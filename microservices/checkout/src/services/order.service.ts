import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { rabbitMQService } from '../../../shared/messaging/rabbitmq';
import { HttpClient } from '../../../../shared/src/communication/http-client';
import { EventBus } from '../../../../shared/src/events/event-bus';

@Injectable()
export class OrderService {
  private paymentsClient: HttpClient;
  private catalogClient: HttpClient;
  private eventBus: EventBus;
  
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private orderItemRepository: OrderItemRepository,
    private cartService: CartService
  ) {
    // Inicializar clientes HTTP para comunicação com outros serviços
    this.paymentsClient = new HttpClient(
      process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3004',
      process.env.SERVICE_TOKEN || 'default-service-token'
    );
    
    this.catalogClient = new HttpClient(
      process.env.CATALOG_SERVICE_URL || 'http://localhost:3002',
      process.env.SERVICE_TOKEN || 'default-service-token'
    );
    
    // Inicializar barramento de eventos
    this.eventBus = EventBus.getInstance();
    this.initEventListeners();
  }
  
  private async initEventListeners() {
    await this.eventBus.connect();
    
    // Inscrever-se em eventos do serviço de pagamentos
    this.eventBus.subscribeToEvent('payments', 'payment.succeeded', async (data) => {
      await this.updateOrderStatus(data.orderId, 'paid');
    });
    
    this.eventBus.subscribeToEvent('payments', 'payment.failed', async (data) => {
      await this.updateOrderStatus(data.orderId, 'payment_failed');
    });
    
    this.eventBus.subscribeToEvent('payments', 'payment.refunded', async (data) => {
      await this.updateOrderStatus(data.orderId, 'refunded');
    });
  }
  
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Criar o pedido
    const order = this.orderRepository.create(createOrderDto);
    const savedOrder = await this.orderRepository.save(order);
    
    // Publicar evento de pedido criado para o microserviço de pagamentos
    await rabbitMQService.publishMessage(
      'orders',
      'order.created',
      {
        orderId: savedOrder.id,
        tenantId: savedOrder.tenantId,
        userId: savedOrder.userId,
        totalAmount: savedOrder.totalAmount,
        items: savedOrder.items,
        paymentMethod: savedOrder.paymentMethod,
      }
    );
    
    return savedOrder;
  }

  async createOrderFromCart(userId: string, tenantId: string, paymentData: any, shippingData: any) {
    // Buscar carrinho ativo do usuário
    const cart = await this.cartService.getCart(userId, tenantId);
    
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Carrinho vazio ou não encontrado');
    }
    
    // Verificar estoque dos produtos
    for (const item of cart.items) {
      const product = await this.catalogClient.get(`/products/${item.productId}`);
      
      if (!product) {
        throw new Error(`Produto ${item.productName} não encontrado`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Quantidade solicitada de ${item.productName} não disponível em estoque`);
      }
    }
    
    // Calcular total do pedido
    const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Criar pedido
    const order = await this.orderRepository.create({
      userId,
      tenantId,
      status: 'pending',
      total,
      shippingAddress: shippingData.address,
      shippingMethod: shippingData.method,
      shippingCost: shippingData.cost,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Criar itens do pedido
    for (const item of cart.items) {
      await this.orderItemRepository.create({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Atualizar estoque do produto
      await this.catalogClient.put(`/products/${item.productId}/reduce-stock`, {
        quantity: item.quantity
      });
    }
    
    // Processar pagamento
    const paymentResult = await this.paymentsClient.post('/payments', {
      orderId: order.id,
      userId,
      tenantId,
      amount: total,
      paymentMethod: paymentData.method,
      paymentDetails: paymentData.details
    });
    
    // Atualizar status do pedido com base no resultado do pagamento
    if (paymentResult.status === 'succeeded') {
      await this.updateOrderStatus(order.id, 'paid');
    } else if (paymentResult.status === 'pending') {
      await this.updateOrderStatus(order.id, 'awaiting_payment');
    } else {
      await this.updateOrderStatus(order.id, 'payment_failed');
    }
    
    // Limpar carrinho após criação do pedido
    await this.cartService.clearCart(userId, tenantId);
    
    // Publicar evento de pedido criado
    await this.eventBus.publishEvent('checkout', 'order.created', {
      orderId: order.id,
      userId,
      tenantId,
      total,
      status: order.status
    });
    
    return this.getOrderById(order.id);
  }
  
  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.orderRepository.findById(orderId);
    
    if (!order) {
      throw new Error('Pedido não encontrado');
    }
    
    await this.orderRepository.update(orderId, {
      status,
      updatedAt: new Date()
    });
    
    // Publicar evento de status do pedido atualizado
    await this.eventBus.publishEvent('checkout', 'order.status.updated', {
      orderId,
      status,
      previousStatus: order.status
    });
    
    return this.getOrderById(orderId);
  }
}