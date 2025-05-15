import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../src/services/transaction.service';
import { TransactionRepository } from '../../src/repositories/transaction.repository';
import { NotFoundException } from '@nestjs/common';
import { Transaction, TransactionType, TransactionStatus } from '../../src/entities/transaction.entity';

// Mock do repositório de transações
const mockTransactionRepository = () => ({
  findById: jest.fn(),
  findByPaymentId: jest.fn(),
  findByGatewayId: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  getTransactionStats: jest.fn(),
  getSplitPaymentStats: jest.fn(),
});

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let transactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: TransactionRepository,
          useFactory: mockTransactionRepository,
        },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get<TransactionRepository>(TransactionRepository);
  });

  describe('findById', () => {
    it('deve retornar uma transação quando encontrada', async () => {
      const mockTransaction = {
        id: '123',
        tenantId: 'tenant123',
        type: TransactionType.PAYMENT,
        status: TransactionStatus.COMPLETED,
        amount: 100,
      };

      transactionRepository.findById.mockResolvedValue(mockTransaction);

      const result = await transactionService.findById('123', 'tenant123');
      expect(result).toEqual(mockTransaction);
      expect(transactionRepository.findById).toHaveBeenCalledWith('123', 'tenant123');
    });

    it('deve lançar NotFoundException quando a transação não for encontrada', async () => {
      transactionRepository.findById.mockResolvedValue(null);

      await expect(transactionService.findById('123', 'tenant123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPaymentId', () => {
    it('deve retornar uma lista de transações para um paymentId', async () => {
      const mockTransactions = [
        {
          id: '123',
          paymentId: 'payment123',
          tenantId: 'tenant123',
          type: TransactionType.PAYMENT,
        },
        {
          id: '456',
          paymentId: 'payment123',
          tenantId: 'tenant123',
          type: TransactionType.FEE,
        },
      ];

      transactionRepository.findByPaymentId.mockResolvedValue(mockTransactions);

      const result = await transactionService.findByPaymentId('payment123', 'tenant123');
      expect(result).toEqual(mockTransactions);
      expect(transactionRepository.findByPaymentId).toHaveBeenCalledWith('payment123', 'tenant123');
    });
  });

  describe('create', () => {
    it('deve criar uma nova transação com status padrão', async () => {
      const mockTransactionData = {
        paymentId: 'payment123',
        tenantId: 'tenant123',
        type: TransactionType.PAYMENT,
        amount: 100,
        description: 'Test payment',
      };

      const mockCreatedTransaction = {
        id: '123',
        ...mockTransactionData,
        status: TransactionStatus.PENDING,
        createdAt: new Date(),
      };

      transactionRepository.create.mockResolvedValue(mockCreatedTransaction);

      const result = await transactionService.create(mockTransactionData);
      
      expect(result).toEqual(mockCreatedTransaction);
      expect(transactionRepository.create).toHaveBeenCalledWith({
        ...mockTransactionData,
        status: TransactionStatus.PENDING,
      });
    });

    it('deve manter o status fornecido ao criar uma transação', async () => {
      const mockTransactionData = {
        paymentId: 'payment123',
        tenantId: 'tenant123',
        type: TransactionType.PAYMENT,
        status: TransactionStatus.COMPLETED,
        amount: 100,
        description: 'Test payment',
      };

      const mockCreatedTransaction = {
        id: '123',
        ...mockTransactionData,
        createdAt: new Date(),
      };

      transactionRepository.create.mockResolvedValue(mockCreatedTransaction);

      const result = await transactionService.create(mockTransactionData);
      
      expect(result).toEqual(mockCreatedTransaction);
      expect(transactionRepository.create).toHaveBeenCalledWith(mockTransactionData);
    });
  });

  describe('update', () => {
    it('deve atualizar uma transação existente', async () => {
      const mockTransaction = {
        id: '123',
        tenantId: 'tenant123',
        type: TransactionType.PAYMENT,
        status: TransactionStatus.PENDING,
        amount: 100,
      };

      const updateData = {
        status: TransactionStatus.COMPLETED,
        description: 'Updated description',
      };

      const updatedTransaction = {
        ...mockTransaction,
        ...updateData,
      };

      transactionRepository.findById.mockResolvedValue(mockTransaction);
      transactionRepository.update.mockResolvedValue(updatedTransaction);

      const result = await transactionService.update('123', 'tenant123', updateData);
      
      expect(result).toEqual(updatedTransaction);
      expect(transactionRepository.update).toHaveBeenCalledWith('123', 'tenant123', updateData);
    });

    it('deve lançar NotFoundException ao tentar atualizar uma transação inexistente', async () => {
      transactionRepository.findById.mockResolvedValue(null);

      await expect(
        transactionService.update('123', 'tenant123', { description: 'test' })
      ).rejects.toThrow(NotFoundException);
      
      expect(transactionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('createPaymentTransaction', () => {
    it('deve criar uma transação de pagamento', async () => {
      const mockTransaction = {
        id: '123',
        paymentId: 'payment123',
        tenantId: 'tenant123',
        type: TransactionType.PAYMENT,
        status: TransactionStatus.PENDING,
        amount: 100,
        description: 'Payment for order',
        gatewayTransactionId: 'gateway123',
        metadata: { paymentMethod: 'credit_card' },
      };

      transactionRepository.create.mockResolvedValue(mockTransaction);

      const result = await transactionService.createPaymentTransaction(
        'payment123',
        'tenant123',
        100,
        'Payment for order',
        'gateway123',
        { paymentMethod: 'credit_card' }
      );
      
      expect(result).toEqual(mockTransaction);
      expect(transactionRepository.create).toHaveBeenCalledWith({
        paymentId: 'payment123',
        tenantId: 'tenant123',
        type: TransactionType.PAYMENT,
        status: TransactionStatus.PENDING,
        amount: 100,
        description: 'Payment for order',
        gatewayTransactionId: 'gateway123',
        metadata: { paymentMethod: 'credit_card' },
      });
    });
  });

  describe('getTransactionStats', () => {
    it('deve retornar estatísticas de transações', async () => {
      const mockStats = {
        transactionsByType: [
          { type: TransactionType.PAYMENT, count: 10, amount: 1000 },
          { type: TransactionType.REFUND, count: 2, amount: 200 },
        ],
        totalFees: 50,
        period: 'month',
      };

      transactionRepository.getTransactionStats.mockResolvedValue(mockStats);

      const result = await transactionService.getTransactionStats('tenant123', 'month');
      
      expect(result).toEqual(mockStats);
      expect(transactionRepository.getTransactionStats).toHaveBeenCalledWith('tenant123', 'month');
    });
  });
});
