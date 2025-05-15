import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Transaction> {
    return this.transactionRepository.findOne({ 
      where: { id, tenantId },
      relations: ['payment'],
    });
  }

  async findByPaymentId(paymentId: string, tenantId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({ 
      where: { paymentId, tenantId },
      relations: ['payment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByGatewayId(gatewayTransactionId: string, tenantId: string): Promise<Transaction> {
    return this.transactionRepository.findOne({ 
      where: { gatewayTransactionId, tenantId },
      relations: ['payment'],
    });
  }

  async findAll(tenantId: string, options: {
    skip?: number;
    take?: number;
    type?: TransactionType;
    status?: TransactionStatus;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<[Transaction[], number]> {
    const { 
      skip = 0, 
      take = 50, 
      type, 
      status,
      startDate,
      endDate,
    } = options;
    
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.payment', 'payment')
      .where('transaction.tenantId = :tenantId', { tenantId });
    
    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }
    
    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }
    
    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', { 
        startDate, 
        endDate 
      });
    } else if (startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate });
    }
    
    queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .skip(skip)
      .take(take);
    
    return queryBuilder.getManyAndCount();
  }

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactionRepository.create(transactionData);
    return this.transactionRepository.save(transaction);
  }

  async update(id: string, tenantId: string, transactionData: Partial<Transaction>): Promise<Transaction> {
    await this.transactionRepository.update(
      { id, tenantId },
      transactionData
    );
    return this.findById(id, tenantId);
  }

  async updateStatus(id: string, tenantId: string, status: TransactionStatus): Promise<Transaction> {
    const transaction = await this.findById(id, tenantId);
    
    if (!transaction) {
      return null;
    }
    
    // Update status and related timestamps
    const updates: Partial<Transaction> = { status };
    
    if (status === TransactionStatus.COMPLETED) {
      updates.completedAt = new Date();
    }
    
    await this.transactionRepository.update({ id, tenantId }, updates);
    return this.findById(id, tenantId);
  }

  async getTransactionStats(tenantId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }
    
    // Get transactions by type
    const transactionsByType = await Promise.all(
      Object.values(TransactionType).map(async (type) => {
        const transactions = await this.transactionRepository.find({
          where: {
            tenantId,
            type,
            createdAt: Between(startDate, now),
            status: TransactionStatus.COMPLETED,
          },
        });
        
        const amount = transactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
        
        return { 
          type, 
          count: transactions.length,
          amount,
        };
      })
    );
    
    // Calculate total fees
    const fees = await this.transactionRepository.find({
      where: {
        tenantId,
        createdAt: Between(startDate, now),
        status: TransactionStatus.COMPLETED,
      },
    });
    
    const totalFees = fees.reduce((sum, transaction) => sum + Number(transaction.feeAmount), 0);
    
    return {
      transactionsByType,
      totalFees,
      period,
    };
  }

  async getSplitPaymentStats(tenantId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }
    
    // Get split transactions
    const splitTransactions = await this.transactionRepository.find({
      where: {
        tenantId,
        type: TransactionType.SPLIT,
        createdAt: Between(startDate, now),
        status: TransactionStatus.COMPLETED,
      },
    });
    
    // Group by recipient
    const recipientMap = new Map();
    
    splitTransactions.forEach(transaction => {
      if (!transaction.recipientId) return;
      
      if (!recipientMap.has(transaction.recipientId)) {
        recipientMap.set(transaction.recipientId, {
          recipientId: transaction.recipientId,
          recipientName: transaction.recipientName,
          count: 0,
          amount: 0,
          fees: 0,
        });
      }
      
      const recipient = recipientMap.get(transaction.recipientId);
      recipient.count++;
      recipient.amount += Number(transaction.amount);
      recipient.fees += Number(transaction.feeAmount);
    });
    
    return {
      splitTransactions: Array.from(recipientMap.values()),
      totalSplitAmount: splitTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
      totalSplitFees: splitTransactions.reduce((sum, t) => sum + Number(t.feeAmount), 0),
      period,
    };
  }
}
