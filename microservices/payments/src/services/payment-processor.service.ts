import { Injectable, OnModuleInit } from '@nestjs/common';
import { rabbitMQService } from '../../../shared/messaging/rabbitmq';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class PaymentProcessorService implements OnModuleInit {
  private readonly logger = new Logger(PaymentProcessorService.name);

  constructor(private readonly paymentService: PaymentService) {}

  async onModuleInit() {
    await this.setupOrderCreatedListener();
  }

  private async setupOrderCreatedListener() {
    await rabbitMQService.consumeMessages(
      'orders',
      'payments-order-created',
      'order.created',
      async (message) => {
        this.logger.log(`Recebido evento de pedido criado: ${message.orderId}`);
        
        try {
          // Criar um pagamento baseado no pedido
          const paymentDto: CreatePaymentDto = {
            orderId: message.orderId,
            tenantId: message.tenantId,
            userId: message.userId,
            amount: message.totalAmount,
            paymentMethod: message.paymentMethod,
            status: 'pending',
          };
          
          const payment = await this.paymentService.create(paymentDto);
          
          // Iniciar processamento do pagamento com o gateway
          await this.processPayment(payment);
        } catch (error) {
          this.logger.error(`Erro ao processar pagamento para pedido ${message.orderId}:`, error);
          throw error;
        }
      }
    );
    
    this.logger.log('Listener de pedidos criados configurado');
  }

  private async processPayment(payment: any) {
    // Lógica para processar o pagamento com o gateway Asaas
    // ...
    
    // Publicar evento de pagamento processado
    await rabbitMQService.publishMessage(
      'payments',
      'payment.processed',
      {
        paymentId: payment.id,
        orderId: payment.orderId,
        status: payment.status,
        transactionId: payment.transactionId
      }
    );
  }
}