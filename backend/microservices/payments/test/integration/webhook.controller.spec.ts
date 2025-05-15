import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PaymentsModule } from '../../src/payments.module';
import { AsaasService } from '../../src/services/asaas.service';
import { PaymentService } from '../../src/services/payment.service';
import { SubscriptionService } from '../../src/services/subscription.service';
import { PaymentStatus } from '../../src/entities/payment.entity';
import { SubscriptionStatus } from '../../src/entities/subscription.entity';

describe('WebhookController (Integration)', () => {
  let app: INestApplication;
  let asaasService: AsaasService;
  let paymentService: PaymentService;
  let subscriptionService: SubscriptionService;

  // Mock dos serviços
  const mockAsaasService = {
    processWebhook: jest.fn(),
  };

  const mockPaymentService = {
    findByGatewayId: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockSubscriptionService = {
    findByGatewayId: jest.fn(),
    updateStatus: jest.fn(),
    updatePaymentInfo: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PaymentsModule],
    })
      .overrideProvider(AsaasService)
      .useValue(mockAsaasService)
      .overrideProvider(PaymentService)
      .useValue(mockPaymentService)
      .overrideProvider(SubscriptionService)
      .useValue(mockSubscriptionService)
      .compile();

    app = moduleFixture.createNestApplication();
    
    // Configuração global de pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    
    // Obter serviços
    asaasService = moduleFixture.get<AsaasService>(AsaasService);
    paymentService = moduleFixture.get<PaymentService>(PaymentService);
    subscriptionService = moduleFixture.get<SubscriptionService>(SubscriptionService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /webhooks/asaas', () => {
    it('deve processar webhook de pagamento confirmado', async () => {
      const webhookData = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'asaas123',
          customer: 'tenant123',
          value: 100,
          status: 'CONFIRMED',
        },
      };

      const mockPayment = {
        id: 'payment123',
        tenantId: 'tenant123',
        gatewayPaymentId: 'asaas123',
        status: PaymentStatus.PENDING,
        amount: 100,
        transactions: [
          { id: 'transaction123', type: 'PAYMENT' },
        ],
      };

      mockAsaasService.processWebhook.mockReturnValue({
        event: 'PAYMENT_CONFIRMED',
        data: webhookData.payment,
        processed: true,
      });

      mockPaymentService.findByGatewayId.mockResolvedValue(mockPayment);
      mockPaymentService.updateStatus.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.CONFIRMED,
      });

      const response = await request(app.getHttpServer())
        .post('/api/webhooks/asaas')
        .set('asaas-access-token', 'test-token')
        .send(webhookData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });
      
      expect(asaasService.processWebhook).toHaveBeenCalledWith(
        'PAYMENT_CONFIRMED',
        webhookData.payment
      );
      
      expect(paymentService.findByGatewayId).toHaveBeenCalledWith(
        'asaas123',
        'tenant123'
      );
      
      expect(paymentService.updateStatus).toHaveBeenCalledWith(
        'payment123',
        'tenant123',
        PaymentStatus.CONFIRMED
      );
    });

    it('deve processar webhook de assinatura renovada', async () => {
      const webhookData = {
        event: 'SUBSCRIPTION_RENEWED',
        subscription: {
          id: 'asaas123',
          customer: 'tenant123',
          value: 99.90,
          status: 'ACTIVE',
          nextDueDate: '2023-07-01',
        },
      };

      const mockSubscription = {
        id: 'subscription123',
        tenantId: 'tenant123',
        gatewaySubscriptionId: 'asaas123',
        status: SubscriptionStatus.ACTIVE,
        amount: 99.90,
        totalPayments: 1,
      };

      mockAsaasService.processWebhook.mockReturnValue({
        event: 'SUBSCRIPTION_RENEWED',
        data: webhookData.subscription,
        processed: true,
      });

      mockSubscriptionService.findByGatewayId.mockResolvedValue(mockSubscription);
      mockSubscriptionService.updatePaymentInfo.mockResolvedValue({
        ...mockSubscription,
        totalPayments: 2,
        nextBillingDate: new Date('2023-07-01'),
      });

      const response = await request(app.getHttpServer())
        .post('/api/webhooks/asaas')
        .set('asaas-access-token', 'test-token')
        .send(webhookData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });
      
      expect(asaasService.processWebhook).toHaveBeenCalledWith(
        'SUBSCRIPTION_RENEWED',
        webhookData.subscription
      );
      
      expect(subscriptionService.findByGatewayId).toHaveBeenCalledWith(
        'asaas123',
        'tenant123'
      );
      
      expect(subscriptionService.updatePaymentInfo).toHaveBeenCalledWith(
        'subscription123',
        'tenant123',
        expect.objectContaining({
          lastPaymentDate: expect.any(Date),
          nextBillingDate: expect.any(Date),
          totalPayments: 2,
        })
      );
    });

    it('deve processar webhook de pagamento de assinatura confirmado', async () => {
      const webhookData = {
        event: 'SUBSCRIPTION_PAYMENT_CONFIRMED',
        payment: {
          id: 'asaas123',
          customer: 'tenant123',
          value: 99.90,
          status: 'CONFIRMED',
        },
      };

      const mockPayment = {
        id: 'payment123',
        tenantId: 'tenant123',
        gatewayPaymentId: 'asaas123',
        status: PaymentStatus.PENDING,
        amount: 99.90,
        transactions: [
          { id: 'transaction123', type: 'PAYMENT' },
        ],
      };

      mockAsaasService.processWebhook.mockReturnValue({
        event: 'SUBSCRIPTION_PAYMENT_CONFIRMED',
        data: webhookData.payment,
        processed: true,
      });

      mockPaymentService.findByGatewayId.mockResolvedValue(mockPayment);
      mockPaymentService.updateStatus.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.CONFIRMED,
      });

      const response = await request(app.getHttpServer())
        .post('/api/webhooks/asaas')
        .set('asaas-access-token', 'test-token')
        .send(webhookData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });
      
      expect(asaasService.processWebhook).toHaveBeenCalledWith(
        'SUBSCRIPTION_PAYMENT_CONFIRMED',
        webhookData.payment
      );
      
      expect(paymentService.findByGatewayId).toHaveBeenCalledWith(
        'asaas123',
        'tenant123'
      );
      
      expect(paymentService.updateStatus).toHaveBeenCalledWith(
        'payment123',
        'tenant123',
        PaymentStatus.CONFIRMED
      );
    });

    it('deve lidar com erros durante o processamento do webhook', async () => {
      const webhookData = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'asaas123',
          customer: 'tenant123',
          value: 100,
          status: 'CONFIRMED',
        },
      };

      mockAsaasService.processWebhook.mockReturnValue({
        event: 'PAYMENT_CONFIRMED',
        data: webhookData.payment,
        processed: true,
      });

      mockPaymentService.findByGatewayId.mockRejectedValue(new Error('Payment not found'));

      const response = await request(app.getHttpServer())
        .post('/api/webhooks/asaas')
        .set('asaas-access-token', 'test-token')
        .send(webhookData)
        .expect(200); // Ainda retorna 200 mesmo com erro

      expect(response.body).toEqual({
        success: false,
        message: 'Payment not found',
      });
      
      expect(asaasService.processWebhook).toHaveBeenCalledWith(
        'PAYMENT_CONFIRMED',
        webhookData.payment
      );
      
      expect(paymentService.findByGatewayId).toHaveBeenCalledWith(
        'asaas123',
        'tenant123'
      );
      
      expect(paymentService.updateStatus).not.toHaveBeenCalled();
    });

    it('deve ignorar webhooks para entidades não encontradas', async () => {
      const webhookData = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'asaas123',
          customer: 'tenant123',
          value: 100,
          status: 'CONFIRMED',
        },
      };

      mockAsaasService.processWebhook.mockReturnValue({
        event: 'PAYMENT_CONFIRMED',
        data: webhookData.payment,
        processed: true,
      });

      mockPaymentService.findByGatewayId.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/api/webhooks/asaas')
        .set('asaas-access-token', 'test-token')
        .send(webhookData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });
      
      expect(paymentService.updateStatus).not.toHaveBeenCalled();
    });
  });
});
