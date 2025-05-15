import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Payment> {
    return this.paymentRepository.findOne({ 
      where: { id, tenantId },
      relations: ['transactions'],
    });
  }

  async findByGatewayId(gatewayPaymentId: string, tenantId: string): Promise<Payment> {
    return this.paymentRepository.findOne({ 
      where: { gatewayPaymentId, tenantId },
      relations: ['transactions'],
    });
  }

  async findByOrderId(orderId: string, tenantId: string): Promise<Payment> {
    return this.paymentRepository.findOne({ 
      where: { orderId, tenantId },
      relations: ['transactions'],
    });
  }

  async findByExternalReference(externalReference: string, tenantId: string): Promise<Payment> {
    return this.paymentRepository.findOne({ 
      where: { externalReference, tenantId },
      relations: ['transactions'],
    });
  }

  async findAll(tenantId: string, options: {
    skip?: number;
    take?: number;
    status?: PaymentStatus;
    type?: PaymentType;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  } = {}): Promise<[Payment[], number]> {
    const { 
      skip = 0, 
      take = 50, 
      status, 
      type,
      startDate,
      endDate,
      search
    } = options;
    
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.transactions', 'transactions')
      .where('payment.tenantId = :tenantId', { tenantId });
    
    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }
    
    if (type) {
      queryBuilder.andWhere('payment.type = :type', { type });
    }
    
    if (startDate && endDate) {
      queryBuilder.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', { 
        startDate, 
        endDate 
      });
    } else if (startDate) {
      queryBuilder.andWhere('payment.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('payment.createdAt <= :endDate', { endDate });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(payment.externalReference LIKE :search OR payment.customerName LIKE :search OR payment.customerEmail LIKE :search OR payment.gatewayPaymentId LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    queryBuilder
      .orderBy('payment.createdAt', 'DESC')
      .skip(skip)
      .take(take);
    
    return queryBuilder.getManyAndCount();
  }

  async create(paymentData: Partial<Payment>): Promise<Payment> {
    const payment = this.paymentRepository.create(paymentData);
    return this.paymentRepository.save(payment);
  }

  async update(id: string, tenantId: string, paymentData: Partial<Payment>): Promise<Payment> {
    await this.paymentRepository.update(
      { id, tenantId },
      paymentData
    );
    return this.findById(id, tenantId);
  }

  async updateStatus(id: string, tenantId: string, status: PaymentStatus): Promise<Payment> {
    const payment = await this.findById(id, tenantId);
    
    if (!payment) {
      return null;
    }
    
    // Update status and related timestamps
    const updates: Partial<Payment> = { status };
    
    switch (status) {
      case PaymentStatus.CONFIRMED:
      case PaymentStatus.RECEIVED:
        updates.paidAt = new Date();
        break;
      case PaymentStatus.REFUNDED:
        updates.refundedAt = new Date();
        break;
      case PaymentStatus.CANCELLED:
        updates.cancelledAt = new Date();
        break;
    }
    
    await this.paymentRepository.update({ id, tenantId }, updates);
    return this.findById(id, tenantId);
  }

  async getPaymentStats(tenantId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
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
    
    // Get total payments
    const [payments, totalPayments] = await this.findAll(tenantId, {
      startDate,
      endDate: now,
    });
    
    // Calculate total revenue
    const totalRevenue = payments
      .filter(payment => payment.isPaid)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    
    // Get payments by status
    const paymentsByStatus = await Promise.all(
      Object.values(PaymentStatus).map(async (status) => {
        const count = await this.paymentRepository.count({
          where: {
            tenantId,
            status,
            createdAt: Between(startDate, now),
          },
        });
        return { status, count };
      })
    );
    
    // Get payments by type
    const paymentsByType = await Promise.all(
      Object.values(PaymentType).map(async (type) => {
        const count = await this.paymentRepository.count({
          where: {
            tenantId,
            type,
            createdAt: Between(startDate, now),
          },
        });
        return { type, count };
      })
    );
    
    return {
      totalPayments,
      totalRevenue,
      paymentsByStatus,
      paymentsByType,
      period,
    };
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.paymentRepository.count({ where: { tenantId } });
  }
}
