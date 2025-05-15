import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from '../../src/services/subscription.service';
import { SubscriptionRepository } from '../../src/repositories/subscription.repository';
import { PaymentService } from '../../src/services/payment.service';
import { AsaasService } from '../../src/services/asaas.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Subscription, SubscriptionStatus, SubscriptionCycle } from '../../src/entities/subscription.entity';
import { PaymentType } from '../../src/entities/payment.entity';

// Mock dos repositórios e serviços
const mockSubscriptionRepository = () => ({
  findById: jest.fn(),
  findByGatewayId: jest.fn(),
  findByTenantId: jest.fn(),
  findAll: jest.fn(),
  findDueForRenewal: jest.fn(),
  findOverdue: jest.fn(),
  findTrialsEnding: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  updatePaymentInfo: jest.fn(),
  cancel: jest.fn(),
  getSubscriptionStats: jest.fn(),
});

const mockPaymentService = () => ({
  create: jest.fn(),
});

const mockAsaasService = () => ({
  createSubscription: jest.fn(),
  getSubscriptionInvoices: jest.fn(),
  cancelSubscription: jest.fn(),
  updateSubscription: jest.fn(),
});

describe('SubscriptionService', () => {
  let subscriptionService: SubscriptionService;
  let subscriptionRepository;
  let paymentService;
  let asaasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SubscriptionRepository,
          useFactory: mockSubscriptionRepository,
        },
        {
          provide: PaymentService,
          useFactory: mockPaymentService,
        },
        {
          provide: AsaasService,
          useFactory: mockAsaasService,
        },
      ],
    }).compile();

    subscriptionService = module.get<SubscriptionService>(SubscriptionService);
    subscriptionRepository = module.get<SubscriptionRepository>(SubscriptionRepository);
    paymentService = module.get<PaymentService>(PaymentService);
    asaasService = module.get<AsaasService>(AsaasService);
  });

  describe('findById', () => {
    it('deve retornar uma assinatura quando encontrada', async () => {
      const mockSubscription = {
        id: '123',
        tenantId: 'tenant123',
        planName: 'Premium',
        cycle: SubscriptionCycle.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        amount: 99.90,
      };

      subscriptionRepository.findById.mockResolvedValue(mockSubscription);

      const result = await subscriptionService.findById('123', 'tenant123');
      expect(result).toEqual(mockSubscription);
      expect(subscriptionRepository.findById).toHaveBeenCalledWith('123', 'tenant123');
    });

    it('deve lançar NotFoundException quando a assinatura não for encontrada', async () => {
      subscriptionRepository.findById.mockResolvedValue(null);

      await expect(subscriptionService.findById('123', 'tenant123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTenantId', () => {
    it('deve retornar uma assinatura para um tenantId', async () => {
      const mockSubscription = {
        id: '123',
        tenantId: 'tenant123',
        planName: 'Premium',
        cycle: SubscriptionCycle.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        amount: 99.90,
      };

      subscriptionRepository.findByTenantId.mockResolvedValue(mockSubscription);

      const result = await subscriptionService.findByTenantId('tenant123');
      expect(result).toEqual(mockSubscription);
      expect(subscriptionRepository.findByTenantId).toHaveBeenCalledWith('tenant123');
    });

    it('deve lançar NotFoundException quando a assinatura não for encontrada', async () => {
      subscriptionRepository.findByTenantId.mockResolvedValue(null);

      await expect(subscriptionService.findByTenantId('tenant123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('deve criar uma nova assinatura com status padrão', async () => {
      const mockSubscriptionData = {
        tenantId: 'tenant123',
        planId: 'plan123',
        planName: 'Premium',
        cycle: SubscriptionCycle.MONTHLY,
        amount: 99.90,
        customerId: 'customer123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        paymentMethod: 'credit_card',
      };

      const mockCreatedSubscription = {
        id: 'subscription123',
        ...mockSubscriptionData,
        status: SubscriptionStatus.PENDING,
        nextBillingDate: expect.any(Date),
        createdAt: new Date(),
      };

      subscriptionRepository.create.mockResolvedValue(mockCreatedSubscription);

      const result = await subscriptionService.create(mockSubscriptionData);
      
      expect(result).toEqual(mockCreatedSubscription);
      expect(subscriptionRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        ...mockSubscriptionData,
        status: SubscriptionStatus.PENDING,
        nextBillingDate: expect.any(Date),
      }));
    });

    it('deve configurar a data de término do trial para assinaturas em trial', async () => {
      const mockSubscriptionData = {
        tenantId: 'tenant123',
        planId: 'plan123',
        planName: 'Premium',
        cycle: SubscriptionCycle.MONTHLY,
        amount: 99.90,
        customerId: 'customer123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        paymentMethod: 'credit_card',
        status: SubscriptionStatus.TRIAL,
      };

      const mockCreatedSubscription = {
        id: 'subscription123',
        ...mockSubscriptionData,
        trialEndDate: expect.any(Date),
        nextBillingDate: expect.any(Date),
        createdAt: new Date(),
      };

      subscriptionRepository.create.mockResolvedValue(mockCreatedSubscription);

      const result = await subscriptionService.create(mockSubscriptionData);
      
      expect(result).toEqual(mockCreatedSubscription);
      expect(subscriptionRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        ...mockSubscriptionData,
        trialEndDate: expect.any(Date),
        nextBillingDate: expect.any(Date),
      }));
    });
  });

  describe('createSubscription', () => {
    it('deve criar uma assinatura através do gateway', async () => {
      const subscriptionData = {
        tenantId: 'tenant123',
        planId: 'plan123',
        planName: 'Premium',
        cycle: SubscriptionCycle.MONTHLY,
        amount: 99.90,
        customerId: 'customer123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        paymentMethod: 'credit_card',
      };

      const gatewayResponse = {
        id: 'asaas123',
        status: 'ACTIVE',
      };

      const mockInvoices = [
        {
          id: 'invoice123',
          dueDate: '2023-06-01',
          invoiceUrl: 'https://example.com/invoice',
        }
      ];

      const mockCreatedSubscription = {
        id: 'subscription123',
        ...subscriptionData,
        gatewaySubscriptionId: 'asaas123',
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: new Date('2023-06-01'),
        createdAt: new Date(),
      };

      asaasService.createSubscription.mockResolvedValue(gatewayResponse);
      asaasService.getSubscriptionInvoices.mockResolvedValue(mockInvoices);
      subscriptionService.create = jest.fn().mockResolvedValue(mockCreatedSubscription);
      subscriptionService.updatePaymentInfo = jest.fn().mockResolvedValue(mockCreatedSubscription);

      const result = await subscriptionService.createSubscription(subscriptionData);
      
      expect(result).toEqual(mockCreatedSubscription);
      expect(asaasService.createSubscription).toHaveBeenCalledWith(expect.objectContaining({
        customer: 'customer123',
        billingType: 'CREDIT_CARD',
        value: 99.90,
        cycle: 'MONTHLY',
      }));
      expect(subscriptionService.create).toHaveBeenCalledWith(expect.objectContaining({
        ...subscriptionData,
        gatewaySubscriptionId: 'asaas123',
        status: SubscriptionStatus.ACTIVE,
      }));
      expect(paymentService.create).toHaveBeenCalledWith(expect.objectContaining({
        tenantId: 'tenant123',
        type: PaymentType.SUBSCRIPTION,
        amount: 99.90,
        subscriptionId: 'subscription123',
      }));
    });

    it('deve criar uma assinatura em trial sem chamar o gateway', async () => {
      const subscriptionData = {
        tenantId: 'tenant123',
        planId: 'plan123',
        planName: 'Premium',
        cycle: SubscriptionCycle.MONTHLY,
        amount: 99.90,
        customerId: 'customer123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        paymentMethod: 'credit_card',
        isTrial: true,
        trialDays: 15,
      };

      const mockCreatedSubscription = {
        id: 'subscription123',
        ...subscriptionData,
        status: SubscriptionStatus.TRIAL,
        trialEndDate: expect.any(Date),
        nextBillingDate: expect.any(Date),
        createdAt: new Date(),
      };

      subscriptionService.create = jest.fn().mockResolvedValue(mockCreatedSubscription);

      const result = await subscriptionService.createSubscription(subscriptionData);
      
      expect(result).toEqual(mockCreatedSubscription);
      expect(asaasService.createSubscription).not.toHaveBeenCalled();
      expect(subscriptionService.create).toHaveBeenCalledWith(expect.objectContaining({
        ...subscriptionData,
        status: SubscriptionStatus.TRIAL,
        trialEndDate: expect.any(Date),
      }));
      expect(paymentService.create).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando o gateway retornar erro', async () => {
      const subscriptionData = {
        tenantId: 'tenant123',
        planId: 'plan123',
        planName: 'Premium',
        cycle: SubscriptionCycle.MONTHLY,
        amount: 99.90,
        customerId: 'customer123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        paymentMethod: 'credit_card',
      };

      asaasService.createSubscription.mockRejectedValue(new Error('Gateway error'));

      await expect(subscriptionService.createSubscription(subscriptionData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('deve cancelar uma assinatura no gateway e no sistema', async () => {
      const mockSubscription = {
        id: 'subscription123',
        tenantId: 'tenant123',
        gatewaySubscriptionId: 'asaas123',
        status: SubscriptionStatus.ACTIVE,
      };

      const cancelledSubscription = {
        ...mockSubscription,
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: expect.any(Date),
        cancelReason: 'Customer request',
      };

      subscriptionRepository.findById.mockResolvedValue(mockSubscription);
      asaasService.cancelSubscription.mockResolvedValue({ success: true });
      subscriptionRepository.cancel.mockResolvedValue(cancelledSubscription);

      const result = await subscriptionService.cancel('subscription123', 'tenant123', 'Customer request');
      
      expect(result).toEqual(cancelledSubscription);
      expect(asaasService.cancelSubscription).toHaveBeenCalledWith('asaas123');
      expect(subscriptionRepository.cancel).toHaveBeenCalledWith('subscription123', 'tenant123', 'Customer request');
    });

    it('deve lançar NotFoundException quando a assinatura não for encontrada', async () => {
      subscriptionRepository.findById.mockResolvedValue(null);

      await expect(
        subscriptionService.cancel('subscription123', 'tenant123', 'Customer request')
      ).rejects.toThrow(NotFoundException);
      
      expect(asaasService.cancelSubscription).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando o gateway retornar erro', async () => {
      const mockSubscription = {
        id: 'subscription123',
        tenantId: 'tenant123',
        gatewaySubscriptionId: 'asaas123',
        status: SubscriptionStatus.ACTIVE,
      };

      subscriptionRepository.findById.mockResolvedValue(mockSubscription);
      asaasService.cancelSubscription.mockRejectedValue(new Error('Gateway error'));

      await expect(
        subscriptionService.cancel('subscription123', 'tenant123', 'Customer request')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('convertTrialToActive', () => {
    it('deve converter uma assinatura de trial para ativa', async () => {
      const mockSubscription = {
        id: 'subscription123',
        tenantId: 'tenant123',
        planId: 'plan123',
        planName: 'Premium',
        cycle: SubscriptionCycle.MONTHLY,
        amount: 99.90,
        customerId: 'customer123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        status: SubscriptionStatus.TRIAL,
      };

      const gatewayResponse = {
        id: 'asaas123',
        status: 'ACTIVE',
      };

      const mockInvoices = [
        {
          id: 'invoice123',
          dueDate: '2023-06-01',
          invoiceUrl: 'https://example.com/invoice',
        }
      ];

      const updatedSubscription = {
        ...mockSubscription,
        status: SubscriptionStatus.ACTIVE,
        paymentMethod: 'credit_card',
        gatewaySubscriptionId: 'asaas123',
      };

      subscriptionRepository.findById.mockResolvedValue(mockSubscription);
      asaasService.createSubscription.mockResolvedValue(gatewayResponse);
      asaasService.getSubscriptionInvoices.mockResolvedValue(mockInvoices);
      subscriptionService.update = jest.fn().mockResolvedValue(updatedSubscription);
      subscriptionService.updatePaymentInfo = jest.fn().mockResolvedValue(updatedSubscription);

      const result = await subscriptionService.convertTrialToActive('subscription123', 'tenant123', 'credit_card');
      
      expect(result).toEqual(updatedSubscription);
      expect(asaasService.createSubscription).toHaveBeenCalledWith(expect.objectContaining({
        customer: 'customer123',
        billingType: 'CREDIT_CARD',
        value: 99.90,
        cycle: 'MONTHLY',
      }));
      expect(subscriptionService.update).toHaveBeenCalledWith('subscription123', 'tenant123', expect.objectContaining({
        status: SubscriptionStatus.ACTIVE,
        paymentMethod: 'credit_card',
        gatewaySubscriptionId: 'asaas123',
      }));
      expect(paymentService.create).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException ao tentar converter uma assinatura que não está em trial', async () => {
      const mockSubscription = {
        id: 'subscription123',
        tenantId: 'tenant123',
        status: SubscriptionStatus.ACTIVE,
      };

      subscriptionRepository.findById.mockResolvedValue(mockSubscription);

      await expect(
        subscriptionService.convertTrialToActive('subscription123', 'tenant123', 'credit_card')
      ).rejects.toThrow(BadRequestException);
      
      expect(asaasService.createSubscription).not.toHaveBeenCalled();
    });
  });

  describe('changePlan', () => {
    it('deve alterar o plano de uma assinatura ativa', async () => {
      const mockSubscription = {
        id: 'subscription123',
        tenantId: 'tenant123',
        planId: 'plan123',
        planName: 'Basic',
        cycle: SubscriptionCycle.MONTHLY,
        amount: 49.90,
        status: SubscriptionStatus.ACTIVE,
        gatewaySubscriptionId: 'asaas123',
      };

      const planData = {
        planId: 'plan456',
        planName: 'Premium',
        amount: 99.90,
        cycle: SubscriptionCycle.MONTHLY,
      };

      const updatedSubscription = {
        ...mockSubscription,
        ...planData,
      };

      subscriptionRepository.findById.mockResolvedValue(mockSubscription);
      asaasService.updateSubscription.mockResolvedValue({ success: true });
      subscriptionService.update = jest.fn().mockResolvedValue(updatedSubscription);

      const result = await subscriptionService.changePlan('subscription123', 'tenant123', planData);
      
      expect(result).toEqual(updatedSubscription);
      expect(asaasService.updateSubscription).toHaveBeenCalledWith('asaas123', expect.objectContaining({
        value: 99.90,
        cycle: 'MONTHLY',
        description: 'Subscription to Premium',
      }));
      expect(subscriptionService.update).toHaveBeenCalledWith('subscription123', 'tenant123', planData);
    });

    it('deve lançar BadRequestException ao tentar alterar o plano de uma assinatura não ativa', async () => {
      const mockSubscription = {
        id: 'subscription123',
        tenantId: 'tenant123',
        status: SubscriptionStatus.TRIAL,
      };

      const planData = {
        planId: 'plan456',
        planName: 'Premium',
        amount: 99.90,
      };

      subscriptionRepository.findById.mockResolvedValue(mockSubscription);

      await expect(
        subscriptionService.changePlan('subscription123', 'tenant123', planData)
      ).rejects.toThrow(BadRequestException);
      
      expect(asaasService.updateSubscription).not.toHaveBeenCalled();
    });
  });

  describe('processRenewals', () => {
    it('deve processar renovações de assinaturas', async () => {
      const mockSubscriptions = [
        {
          id: 'subscription123',
          tenantId: 'tenant123',
          cycle: SubscriptionCycle.MONTHLY,
          nextBillingDate: new Date(),
          totalPayments: 1,
        },
        {
          id: 'subscription456',
          tenantId: 'tenant456',
          cycle: SubscriptionCycle.QUARTERLY,
          nextBillingDate: new Date(),
          totalPayments: 2,
        },
      ];

      subscriptionRepository.findDueForRenewal.mockResolvedValue(mockSubscriptions);
      subscriptionService.updatePaymentInfo = jest.fn().mockResolvedValue({});

      await subscriptionService.processRenewals();
      
      expect(subscriptionRepository.findDueForRenewal).toHaveBeenCalledWith(0);
      expect(subscriptionService.updatePaymentInfo).toHaveBeenCalledTimes(2);
    });
  });

  describe('processTrialEndings', () => {
    it('deve processar términos de trial', async () => {
      const mockTrials = [
        {
          id: 'subscription123',
          tenantId: 'tenant123',
          status: SubscriptionStatus.TRIAL,
          trialEndDate: new Date(),
        },
        {
          id: 'subscription456',
          tenantId: 'tenant456',
          status: SubscriptionStatus.TRIAL,
          trialEndDate: new Date(),
        },
      ];

      subscriptionRepository.findTrialsEnding.mockResolvedValue(mockTrials);
      subscriptionService.updateStatus = jest.fn().mockResolvedValue({});

      await subscriptionService.processTrialEndings();
      
      expect(subscriptionRepository.findTrialsEnding).toHaveBeenCalledWith(0);
      expect(subscriptionService.updateStatus).toHaveBeenCalledTimes(2);
      expect(subscriptionService.updateStatus).toHaveBeenCalledWith(
        'subscription123', 
        'tenant123', 
        SubscriptionStatus.EXPIRED
      );
    });
  });
});
