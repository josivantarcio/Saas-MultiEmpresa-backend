import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../../src/services/order.service';
import { OrderRepository } from '../../src/repositories/order.repository';
import { CartRepository } from '../../src/repositories/cart.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '../../src/entities/order.entity';
import { OrderItemStatus } from '../../src/entities/order-item.entity';

// Mock dos repositórios
const mockOrderRepository = () => ({
  findById: jest.fn(),
  findByOrderNumber: jest.fn(),
  findByUserId: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  updatePaymentStatus: jest.fn(),
  updateFulfillmentStatus: jest.fn(),
  updateItem: jest.fn(),
  updateItemStatus: jest.fn(),
  getOrderStats: jest.fn(),
});

const mockCartRepository = () => ({
  findById: jest.fn(),
  markAsAbandoned: jest.fn(),
});

describe('OrderService', () => {
  let orderService: OrderService;
  let orderRepository;
  let cartRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useFactory: mockOrderRepository,
        },
        {
          provide: CartRepository,
          useFactory: mockCartRepository,
        },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    orderRepository = module.get<OrderRepository>(OrderRepository);
    cartRepository = module.get<CartRepository>(CartRepository);
  });

  describe('findById', () => {
    it('deve retornar um pedido quando encontrado', async () => {
      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        status: OrderStatus.PENDING,
      };

      orderRepository.findById.mockResolvedValue(mockOrder);

      const result = await orderService.findById('order123', 'tenant123');
      expect(result).toEqual(mockOrder);
      expect(orderRepository.findById).toHaveBeenCalledWith('order123', 'tenant123');
    });

    it('deve lançar NotFoundException quando o pedido não for encontrado', async () => {
      orderRepository.findById.mockResolvedValue(null);

      await expect(orderService.findById('order123', 'tenant123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByOrderNumber', () => {
    it('deve retornar um pedido pelo número do pedido', async () => {
      const mockOrder = {
        id: 'order123',
        orderNumber: 'ORD-123456',
        tenantId: 'tenant123',
        status: OrderStatus.PENDING,
      };

      orderRepository.findByOrderNumber.mockResolvedValue(mockOrder);

      const result = await orderService.findByOrderNumber('ORD-123456', 'tenant123');
      expect(result).toEqual(mockOrder);
      expect(orderRepository.findByOrderNumber).toHaveBeenCalledWith('ORD-123456', 'tenant123');
    });

    it('deve lançar NotFoundException quando o número do pedido não for encontrado', async () => {
      orderRepository.findByOrderNumber.mockResolvedValue(null);

      await expect(orderService.findByOrderNumber('ORD-123456', 'tenant123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('deve retornar pedidos de um usuário', async () => {
      const mockOrders = [
        {
          id: 'order123',
          userId: 'user123',
          tenantId: 'tenant123',
          status: OrderStatus.PENDING,
        },
      ];

      orderRepository.findByUserId.mockResolvedValue([mockOrders, 1]);

      const result = await orderService.findByUserId('user123', 'tenant123');
      expect(result).toEqual({ items: mockOrders, total: 1 });
      expect(orderRepository.findByUserId).toHaveBeenCalledWith('user123', 'tenant123', {});
    });

    it('deve aplicar filtros na busca por pedidos de um usuário', async () => {
      const mockOrders = [
        {
          id: 'order123',
          userId: 'user123',
          tenantId: 'tenant123',
          status: OrderStatus.PROCESSING,
        },
      ];

      const options = {
        skip: 0,
        take: 10,
        status: OrderStatus.PROCESSING,
      };

      orderRepository.findByUserId.mockResolvedValue([mockOrders, 1]);

      const result = await orderService.findByUserId('user123', 'tenant123', options);
      expect(result).toEqual({ items: mockOrders, total: 1 });
      expect(orderRepository.findByUserId).toHaveBeenCalledWith('user123', 'tenant123', options);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os pedidos', async () => {
      const mockOrders = [
        {
          id: 'order123',
          tenantId: 'tenant123',
          status: OrderStatus.PENDING,
        },
        {
          id: 'order456',
          tenantId: 'tenant123',
          status: OrderStatus.PROCESSING,
        },
      ];

      orderRepository.findAll.mockResolvedValue([mockOrders, 2]);

      const result = await orderService.findAll('tenant123');
      expect(result).toEqual({ items: mockOrders, total: 2 });
      expect(orderRepository.findAll).toHaveBeenCalledWith('tenant123', {});
    });

    it('deve aplicar filtros na busca por todos os pedidos', async () => {
      const mockOrders = [
        {
          id: 'order123',
          tenantId: 'tenant123',
          status: OrderStatus.PROCESSING,
          paymentStatus: PaymentStatus.PAID,
        },
      ];

      const options = {
        skip: 0,
        take: 10,
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.PAID,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      orderRepository.findAll.mockResolvedValue([mockOrders, 1]);

      const result = await orderService.findAll('tenant123', options);
      expect(result).toEqual({ items: mockOrders, total: 1 });
      expect(orderRepository.findAll).toHaveBeenCalledWith('tenant123', options);
    });
  });

  describe('createFromCart', () => {
    it('deve criar um pedido a partir de um carrinho', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
            requiresShipping: true,
          },
        ],
        subtotal: 100,
        total: 100,
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        shippingMethodId: 'shipping123',
      };

      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        userId: 'user123',
        cartId: 'cart123',
        orderNumber: 'ORD-123456',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        items: [
          {
            id: 'orderItem123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
            status: OrderItemStatus.PENDING,
          },
        ],
        subtotal: 100,
        total: 100,
        customerEmail: 'john@example.com',
        customerName: 'John Doe',
      };

      const orderData = {
        customerEmail: 'john@example.com',
        customerName: 'John Doe',
        paymentMethodId: 'payment123',
        paymentMethodName: 'Credit Card',
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      orderRepository.create.mockResolvedValue(mockOrder);
      orderRepository.findById.mockResolvedValue(mockOrder);
      cartRepository.markAsAbandoned.mockResolvedValue(undefined);

      const result = await orderService.createFromCart('cart123', 'tenant123', orderData);
      
      expect(result).toEqual(mockOrder);
      expect(cartRepository.findById).toHaveBeenCalledWith('cart123', 'tenant123');
      expect(orderRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        tenantId: 'tenant123',
        userId: 'user123',
        customerEmail: 'john@example.com',
        customerName: 'John Doe',
        cartId: 'cart123',
        subtotal: 100,
        total: 100,
        paymentMethodId: 'payment123',
        paymentMethodName: 'Credit Card',
        shippingMethodId: 'shipping123',
        hasPhysicalItems: true,
      }));
      expect(cartRepository.markAsAbandoned).toHaveBeenCalledWith('cart123', 'tenant123');
    });

    it('deve lançar NotFoundException quando o carrinho não for encontrado', async () => {
      cartRepository.findById.mockResolvedValue(null);

      const orderData = {
        customerEmail: 'john@example.com',
        customerName: 'John Doe',
        paymentMethodId: 'payment123',
        paymentMethodName: 'Credit Card',
      };

      await expect(
        orderService.createFromCart('cart123', 'tenant123', orderData)
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException ao criar pedido de um carrinho vazio', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        items: [],
      };

      cartRepository.findById.mockResolvedValue(mockCart);

      const orderData = {
        customerEmail: 'john@example.com',
        customerName: 'John Doe',
        paymentMethodId: 'payment123',
        paymentMethodName: 'Credit Card',
      };

      await expect(
        orderService.createFromCart('cart123', 'tenant123', orderData)
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException quando falta endereço de entrega para itens físicos', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
            requiresShipping: true,
          },
        ],
        subtotal: 100,
        total: 100,
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
      };

      cartRepository.findById.mockResolvedValue(mockCart);

      const orderData = {
        customerEmail: 'john@example.com',
        customerName: 'John Doe',
        paymentMethodId: 'payment123',
        paymentMethodName: 'Credit Card',
      };

      await expect(
        orderService.createFromCart('cart123', 'tenant123', orderData)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar o status de um pedido', async () => {
      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        status: OrderStatus.PENDING,
      };

      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.PROCESSING,
      };

      orderRepository.updateStatus.mockResolvedValue(updatedOrder);

      const result = await orderService.updateStatus('order123', 'tenant123', OrderStatus.PROCESSING);
      
      expect(result).toEqual(updatedOrder);
      expect(orderRepository.updateStatus).toHaveBeenCalledWith('order123', 'tenant123', OrderStatus.PROCESSING);
    });
  });

  describe('updatePaymentStatus', () => {
    it('deve atualizar o status de pagamento de um pedido', async () => {
      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        paymentStatus: PaymentStatus.PENDING,
      };

      const updatedOrder = {
        ...mockOrder,
        paymentStatus: PaymentStatus.PAID,
        transactionId: 'transaction123',
      };

      orderRepository.updatePaymentStatus.mockResolvedValue(updatedOrder);

      const result = await orderService.updatePaymentStatus(
        'order123',
        'tenant123',
        PaymentStatus.PAID,
        'transaction123'
      );
      
      expect(result).toEqual(updatedOrder);
      expect(orderRepository.updatePaymentStatus).toHaveBeenCalledWith(
        'order123',
        'tenant123',
        PaymentStatus.PAID,
        'transaction123'
      );
    });
  });

  describe('cancelOrder', () => {
    it('deve cancelar um pedido pendente', async () => {
      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        status: OrderStatus.PENDING,
      };

      const cancelledOrder = {
        ...mockOrder,
        status: OrderStatus.CANCELLED,
        cancelReason: 'Customer request',
        cancelledAt: expect.any(Date),
      };

      orderRepository.findById.mockResolvedValue(mockOrder);
      orderRepository.update.mockResolvedValue(cancelledOrder);

      const result = await orderService.cancelOrder('order123', 'tenant123', 'Customer request');
      
      expect(result).toEqual(cancelledOrder);
      expect(orderRepository.update).toHaveBeenCalledWith('order123', 'tenant123', expect.objectContaining({
        status: OrderStatus.CANCELLED,
        cancelReason: 'Customer request',
        cancelledAt: expect.any(Date),
      }));
    });

    it('deve lançar BadRequestException ao tentar cancelar um pedido já entregue', async () => {
      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        status: OrderStatus.DELIVERED,
      };

      orderRepository.findById.mockResolvedValue(mockOrder);

      await expect(
        orderService.cancelOrder('order123', 'tenant123', 'Customer request')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refundOrder', () => {
    it('deve processar um reembolso total para um pedido pago', async () => {
      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
        total: 100,
      };

      const refundedOrder = {
        ...mockOrder,
        status: OrderStatus.REFUNDED,
        paymentStatus: PaymentStatus.REFUNDED,
        refundedAmount: 100,
        refundedAt: expect.any(Date),
      };

      orderRepository.findById.mockResolvedValue(mockOrder);
      orderRepository.update.mockResolvedValue(refundedOrder);

      const result = await orderService.refundOrder('order123', 'tenant123', 100);
      
      expect(result).toEqual(refundedOrder);
      expect(orderRepository.update).toHaveBeenCalledWith('order123', 'tenant123', expect.objectContaining({
        status: OrderStatus.REFUNDED,
        paymentStatus: PaymentStatus.REFUNDED,
        refundedAmount: 100,
        refundedAt: expect.any(Date),
      }));
    });

    it('deve processar um reembolso parcial para um pedido pago', async () => {
      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
        total: 100,
      };

      const refundedOrder = {
        ...mockOrder,
        status: OrderStatus.PARTIALLY_REFUNDED,
        paymentStatus: PaymentStatus.PARTIALLY_REFUNDED,
        refundedAmount: 50,
        refundedAt: expect.any(Date),
      };

      orderRepository.findById.mockResolvedValue(mockOrder);
      orderRepository.update.mockResolvedValue(refundedOrder);

      const result = await orderService.refundOrder('order123', 'tenant123', 50);
      
      expect(result).toEqual(refundedOrder);
      expect(orderRepository.update).toHaveBeenCalledWith('order123', 'tenant123', expect.objectContaining({
        status: OrderStatus.PARTIALLY_REFUNDED,
        paymentStatus: PaymentStatus.PARTIALLY_REFUNDED,
        refundedAmount: 50,
        refundedAt: expect.any(Date),
      }));
    });

    it('deve lançar BadRequestException ao tentar reembolsar um pedido não pago', async () => {
      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        total: 100,
      };

      orderRepository.findById.mockResolvedValue(mockOrder);

      await expect(
        orderService.refundOrder('order123', 'tenant123', 100)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOrderStats', () => {
    it('deve retornar estatísticas de pedidos', async () => {
      const mockStats = {
        totalOrders: 10,
        totalRevenue: 1000,
        averageOrderValue: 100,
      };

      orderRepository.getOrderStats.mockResolvedValue(mockStats);

      const result = await orderService.getOrderStats('tenant123', 'month');
      
      expect(result).toEqual(mockStats);
      expect(orderRepository.getOrderStats).toHaveBeenCalledWith('tenant123', 'month');
    });
  });
});
