import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from '../repositories/transaction.repository';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async findById(id: string, tenantId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id, tenantId);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async findByPaymentId(paymentId: string, tenantId: string): Promise<Transaction[]> {
    return this.transactionRepository.findByPaymentId(paymentId, tenantId);
  }

  async findByGatewayId(gatewayTransactionId: string, tenantId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findByGatewayId(gatewayTransactionId, tenantId);
    if (!transaction) {
      throw new NotFoundException(`Transaction with gateway ID ${gatewayTransactionId} not found`);
    }
    return transaction;
  }

  async findAll(tenantId: string, options: {
    skip?: number;
    take?: number;
    type?: TransactionType;
    status?: TransactionStatus;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<[Transaction[], number]> {
    return this.transactionRepository.findAll(tenantId, options);
  }

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    // Set default status if not provided
    if (!transactionData.status) {
      transactionData.status = TransactionStatus.PENDING;
    }
    
    return this.transactionRepository.create(transactionData);
  }

  async update(id: string, tenantId: string, transactionData: Partial<Transaction>): Promise<Transaction> {
    await this.findById(id, tenantId); // Verify transaction exists
    return this.transactionRepository.update(id, tenantId, transactionData);
  }

  async updateStatus(id: string, tenantId: string, status: TransactionStatus): Promise<Transaction> {
    await this.findById(id, tenantId); // Verify transaction exists
    return this.transactionRepository.updateStatus(id, tenantId, status);
  }

  async createPaymentTransaction(
    paymentId: string,
    tenantId: string,
    amount: number,
    description: string,
    gatewayTransactionId?: string,
    metadata?: any
  ): Promise<Transaction> {
    return this.create({
      paymentId,
      tenantId,
      type: TransactionType.PAYMENT,
      status: TransactionStatus.PENDING,
      amount,
      description,
      gatewayTransactionId,
      metadata,
    });
  }

  async createRefundTransaction(
    paymentId: string,
    tenantId: string,
    amount: number,
    description: string,
    gatewayTransactionId?: string,
    metadata?: any
  ): Promise<Transaction> {
    return this.create({
      paymentId,
      tenantId,
      type: TransactionType.REFUND,
      status: TransactionStatus.PENDING,
      amount,
      description,
      gatewayTransactionId,
      metadata,
    });
  }

  async createFeeTransaction(
    paymentId: string,
    tenantId: string,
    amount: number,
    description: string,
    gatewayTransactionId?: string,
    metadata?: any
  ): Promise<Transaction> {
    return this.create({
      paymentId,
      tenantId,
      type: TransactionType.FEE,
      status: TransactionStatus.COMPLETED, // Fees are typically completed immediately
      amount,
      description,
      gatewayTransactionId,
      metadata,
    });
  }

  async createSplitTransaction(
    paymentId: string,
    tenantId: string,
    amount: number,
    recipientId: string,
    recipientName: string,
    description: string,
    gatewayTransactionId?: string,
    metadata?: any
  ): Promise<Transaction> {
    return this.create({
      paymentId,
      tenantId,
      type: TransactionType.SPLIT,
      status: TransactionStatus.PENDING,
      amount,
      description,
      recipientId,
      recipientName,
      gatewayTransactionId,
      metadata,
    });
  }

  async getTransactionStats(tenantId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    return this.transactionRepository.getTransactionStats(tenantId, period);
  }

  async getSplitPaymentStats(tenantId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    return this.transactionRepository.getSplitPaymentStats(tenantId, period);
  }
}
