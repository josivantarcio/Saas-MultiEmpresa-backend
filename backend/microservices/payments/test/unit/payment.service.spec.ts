import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../src/services/payment.service';
import { PaymentRepository } from '../../src/repositories/payment.repository';
import { TransactionService } from '../../src/services/transaction.service';
import { AsaasService } from '../../src/services/asaas.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Payment, PaymentStatus, PaymentType } from '../../src/entities/payment.entity';

// Mock dos repositórios e serviços
const mockPaymentRepository = () => ({
  findById: jest.fn(),
  findByGatewayId: jest.fn(),
  findByOrderId: jest.fn(),
  findByExternalReference: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  getPaymentStats: jest.fn(),
});

const mockTransactionService = () => ({
  createPaymentTransaction: jest.fn(),
  createRefundTransaction: jest.fn(),
  updateStatus: jest.fn(),
});

const mockAsaasService = () => ({
  createPayment: jest.fn(),
  refundPayment: jest.fn(),
  cancelPayment: jest.fn(),
});

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let paymentRepository;
  let transactionService;
  let asaasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PaymentRepository,
          useFactory: mockPaymentRepository,
        },
        {
          provide: TransactionService,
          useFactory: mockTransactionService,
        },
        {
          provide: AsaasService,
          useFactory: mockAsaasService,
        },
      ],
    }).compile();

    paymentService = module.get<PaymentService>(PaymentService);
    paymentRepository = module.get<PaymentRepository>(PaymentRepository);
    transactionService = module.get<TransactionService>(TransactionService);
    asaasService = module.get<AsaasService>(AsaasService);
  });

  describe('findById', () => {
    it('deve retornar um pagamento quando encontrado', async () => {
      const mockPayment = {
        id: '123',
        tenantId: 'tenant123',
        type: PaymentType.ORDER,
        status: PaymentStatus.PENDING,
        amount: 100,
      };

      paymentRepository.findById.mockResolvedValue(mockPayment);

      const result = await paymentService.findById('123', 'tenant123');
      expect(result).toEqual(mockPayment);
      expect(paymentRepository.findById).toHaveBeenCalledWith('123', 'tenant123');
    });

    it('deve lançar NotFoundException quando o pagamento não for encontrado', async () => {
      paymentRepository.findById.mockResolvedValue(null);

      await expect(paymentService.findById('123', 'tenant123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByOrderId', () => {
    it('deve retornar um pagamento para um orderId', async () => {
      const mockPayment = {
        id: '123',
        tenantId: 'tenant123',
        orderId: 'order123',
        type: PaymentType.ORDER,
        status: PaymentStatus.PENDING,
        amount: 100,
      };

      paymentRepository.findByOrderId.mockResolvedValue(mockPayment);

      const result = await paymentService.findByOrderId('order123', 'tenant123');
      expect(result).toEqual(mockPayment);
      expect(paymentRepository.findByOrderId).toHaveBeenCalledWith('order123', 'tenant123');
    });

    it('deve lançar NotFoundException quando o pagamento não for encontrado', async () => {
      paymentRepository.findByOrderId.mockResolvedValue(null);

      await expect(paymentService.findByOrderId('order123', 'tenant123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('deve criar um novo pagamento e uma transação associada', async () => {
      const mockPaymentData = {
        tenantId: 'tenant123',
        type: PaymentType.ORDER,
        amount: 100,
        paymentMethod: 'credit_card',
        customerId: 'customer123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        orderId: 'order123',
        externalReference: 'order-123',
        description: 'Payment for order #123',
      };

      const mockCreatedPayment = {
        id: 'payment123',
        ...mockPaymentData,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
      };

      paymentRepository.create.mockResolvedValue(mockCreatedPayment);
      transactionService.createPaymentTransaction.mockResolvedValue({
        id: 'transaction123',
        paymentId: 'payment123',
        tenantId: 'tenant123',
        amount: 100,
      });

      const result = await paymentService.create(mockPaymentData);
      
      expect(result).toEqual(mockCreatedPayment);
      expect(paymentRepository.create).toHaveBeenCalledWith({
        ...mockPaymentData,
        status: PaymentStatus.PENDING,
      });
      expect(transactionService.createPaymentTransaction).toHaveBeenCalledWith(
        'payment123',
        'tenant123',
        100,
        'Payment for order #123',
        undefined,
        { paymentMethod: 'credit_card' }
      );
    });

    it('deve manter o status fornecido ao criar um pagamento', async () => {
      const mockPaymentData = {
        tenantId: 'tenant123',
        type: PaymentType.ORDER,
        status: PaymentStatus.CONFIRMED,
        amount: 100,
        paymentMethod: 'credit_card',
        customerId: 'customer123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        orderId: 'order123',
        externalReference: 'order-123',
        description: 'Payment for order #123',
      };

      const mockCreatedPayment = {
        id: 'payment123',
        ...mockPaymentData,
        createdAt: new Date(),
      };

      paymentRepository.create.mockResolvedValue(mockCreatedPayment);
      transactionService.createPaymentTransaction.mockResolvedValue({
        id: 'transaction123',
        paymentId: 'payment123',
        tenantId: 'tenant123',
        amount: 100,
      });

      const result = await paymentService.create(mockPaymentData);
      
      expect(result).toEqual(mockCreatedPayment);
      expect(paymentRepository.create).toHaveBeenCalledWith(mockPaymentData);
    });
  });

  describe('processPayment', () => {
    it('deve processar um pagamento através do gateway', async () => {
      const paymentData = {
        tenantId: 'tenant123',
        type: PaymentType.ORDER,
        amount: 100,
        paymentMethod: 'credit_card',
        customerId: 'customer123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        orderId: 'order123',
        externalReference: 'order-123',
        description: 'Payment for order #123',
      };

      const gatewayResponse = {
        id: 'asaas123',
        status: 'PENDING',
        invoiceUrl: 'https://example.com/invoice',
      };

      const mockCreatedPayment = {
        id: 'payment123',
        ...paymentData,
        gatewayPaymentId: 'asaas123',
        gatewayUrl: 'https://example.com/invoice',
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
      };

      asaasService.createPayment.mockResolvedValue(gatewayResponse);
      paymentService.create = jest.fn().mockResolvedValue(mockCreatedPayment);

      const result = await paymentService.processPayment(paymentData);
      
      expect(result).toEqual(mockCreatedPayment);
      expect(asaasService.createPayment).toHaveBeenCalledWith(expect.objectContaining({
        customer: 'customer123',
        billingType: 'CREDIT_CARD',
        value: 100,
        description: 'Payment for order #123',
        externalReference: 'order-123',
      }));
      expect(paymentService.create).toHaveBeenCalledWith(expect.objectContaining({
        ...paymentData,
        gatewayPaymentId: 'asaas123',
        gatewayUrl: 'https://example.com/invoice',
        status: PaymentStatus.PENDING,
      }));
    });

    it('deve lançar BadRequestException quando o gateway retornar erro', async () => {
      const paymentData = {
        tenantId: 'tenant123',
        type: PaymentType.ORDER,
        amount: 100,
        paymentMethod: 'credit_card',
        customerId: 'customer123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        orderId: 'order123',
        externalReference: 'order-123',
        description: 'Payment for order #123',
      };

      asaasService.createPayment.mockRejectedValue(new Error('Gateway error'));

      await expect(paymentService.processPayment(paymentData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refundPayment', () => {
    it('deve processar um reembolso para um pagamento confirmado', async () => {
      const mockPayment = {
        id: 'payment123',
        tenantId: 'tenant123',
        type: PaymentType.ORDER,
        status: PaymentStatus.CONFIRMED,
        amount: 100,
        gatewayPaymentId: 'asaas123',
      };

      const refundResponse = {
        id: 'refund123',
        status: 'REFUNDED',
      };

      paymentRepository.findById.mockResolvedValue(mockPayment);
      asaasService.refundPayment.mockResolvedValue(refundResponse);
      transactionService.createRefundTransaction.mockResolvedValue({
        id: 'transaction123',
        paymentId: 'payment123',
        tenantId: 'tenant123',
        amount: 100,
      });
      paymentService.updateStatus = jest.fn().mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.REFUNDED,
      });

      const result = await paymentService.refundPayment('payment123', 'tenant123', 'Customer request');
      
      expect(asaasService.refundPayment).toHaveBeenCalledWith('asaas123', {
        value: 100,
        description: 'Customer request',
      });
      expect(transactionService.createRefundTransaction).toHaveBeenCalledWith(
        'payment123',
        'tenant123',
        100,
        'Refund for payment payment123: Customer request',
        'refund123',
        { refundReason: 'Customer request' }
      );
      expect(paymentService.updateStatus).toHaveBeenCalledWith('payment123', 'tenant123', PaymentStatus.REFUNDED);
    });

    it('deve lançar BadRequestException ao tentar reembolsar um pagamento não confirmado', async () => {
      const mockPayment = {
        id: 'payment123',
        tenantId: 'tenant123',
        type: PaymentType.ORDER,
        status: PaymentStatus.PENDING,
        amount: 100,
      };

      paymentRepository.findById.mockResolvedValue(mockPayment);

      await expect(
        paymentService.refundPayment('payment123', 'tenant123', 'Customer request')
      ).rejects.toThrow(BadRequestException);
      
      expect(asaasService.refundPayment).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar o status de um pagamento e da transação associada', async () => {
      const mockPayment = {
        id: 'payment123',
        tenantId: 'tenant123',
        type: PaymentType.ORDER,
        status: PaymentStatus.PENDING,
        amount: 100,
        transactions: [
          {
            id: 'transaction123',
            type: 'PAYMENT',
          },
        ],
      };

      const updatedPayment = {
        ...mockPayment,
        status: PaymentStatus.CONFIRMED,
      };

      paymentRepository.findById.mockResolvedValue(mockPayment);
      paymentRepository.updateStatus.mockResolvedValue(updatedPayment);

      const result = await paymentService.updateStatus('payment123', 'tenant123', PaymentStatus.CONFIRMED);
      
      expect(result).toEqual(updatedPayment);
      expect(paymentRepository.updateStatus).toHaveBeenCalledWith('payment123', 'tenant123', PaymentStatus.CONFIRMED);
      expect(transactionService.updateStatus).toHaveBeenCalledWith('transaction123', 'tenant123', 'COMPLETED');
    });

    it('não deve atualizar se o status for o mesmo', async () => {
      const mockPayment = {
        id: 'payment123',
        tenantId: 'tenant123',
        type: PaymentType.ORDER,
        status: PaymentStatus.CONFIRMED,
        amount: 100,
      };

      paymentRepository.findById.mockResolvedValue(mockPayment);

      const result = await paymentService.updateStatus('payment123', 'tenant123', PaymentStatus.CONFIRMED);
      
      expect(result).toEqual(mockPayment);
      expect(paymentRepository.updateStatus).not.toHaveBeenCalled();
    });
  });
});
