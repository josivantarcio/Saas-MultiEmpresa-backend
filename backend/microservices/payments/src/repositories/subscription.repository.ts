import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Subscription, SubscriptionStatus, SubscriptionCycle } from '../entities/subscription.entity';

@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Subscription> {
    return this.subscriptionRepository.findOne({ 
      where: { id, tenantId },
      relations: ['payments'],
    });
  }

  async findByGatewayId(gatewaySubscriptionId: string, tenantId: string): Promise<Subscription> {
    return this.subscriptionRepository.findOne({ 
      where: { gatewaySubscriptionId, tenantId },
      relations: ['payments'],
    });
  }

  async findByTenantId(tenantId: string): Promise<Subscription> {
    return this.subscriptionRepository.findOne({ 
      where: { tenantId },
      relations: ['payments'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(options: {
    skip?: number;
    take?: number;
    status?: SubscriptionStatus;
    cycle?: SubscriptionCycle;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  } = {}): Promise<[Subscription[], number]> {
    const { 
      skip = 0, 
      take = 50, 
      status, 
      cycle,
      startDate,
      endDate,
      search
    } = options;
    
    const queryBuilder = this.subscriptionRepository.createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.payments', 'payments');
    
    if (status) {
      queryBuilder.andWhere('subscription.status = :status', { status });
    }
    
    if (cycle) {
      queryBuilder.andWhere('subscription.cycle = :cycle', { cycle });
    }
    
    if (startDate && endDate) {
      queryBuilder.andWhere('subscription.createdAt BETWEEN :startDate AND :endDate', { 
        startDate, 
        endDate 
      });
    } else if (startDate) {
      queryBuilder.andWhere('subscription.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('subscription.createdAt <= :endDate', { endDate });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(subscription.planName LIKE :search OR subscription.customerName LIKE :search OR subscription.customerEmail LIKE :search OR subscription.gatewaySubscriptionId LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    queryBuilder
      .orderBy('subscription.createdAt', 'DESC')
      .skip(skip)
      .take(take);
    
    return queryBuilder.getManyAndCount();
  }

  async findDueForRenewal(daysAhead: number = 3): Promise<Subscription[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    
    return this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: Between(today, futureDate),
      },
      relations: ['payments'],
    });
  }

  async findOverdue(): Promise<Subscription[]> {
    const today = new Date();
    
    return this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: LessThanOrEqual(today),
      },
      relations: ['payments'],
    });
  }

  async findTrialsEnding(daysAhead: number = 3): Promise<Subscription[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    
    return this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.TRIAL,
        trialEndDate: Between(today, futureDate),
      },
      relations: ['payments'],
    });
  }

  async create(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create(subscriptionData);
    return this.subscriptionRepository.save(subscription);
  }

  async update(id: string, tenantId: string, subscriptionData: Partial<Subscription>): Promise<Subscription> {
    await this.subscriptionRepository.update(
      { id, tenantId },
      subscriptionData
    );
    return this.findById(id, tenantId);
  }

  async updateStatus(id: string, tenantId: string, status: SubscriptionStatus): Promise<Subscription> {
    const subscription = await this.findById(id, tenantId);
    
    if (!subscription) {
      return null;
    }
    
    // Update status and related timestamps
    const updates: Partial<Subscription> = { status };
    
    switch (status) {
      case SubscriptionStatus.CANCELLED:
        updates.cancelledAt = new Date();
        break;
      case SubscriptionStatus.ACTIVE:
        if (subscription.status === SubscriptionStatus.TRIAL) {
          updates.trialEndDate = new Date();
        }
        break;
    }
    
    await this.subscriptionRepository.update({ id, tenantId }, updates);
    return this.findById(id, tenantId);
  }

  async updatePaymentInfo(
    id: string, 
    tenantId: string, 
    paymentInfo: {
      lastPaymentDate: Date;
      nextBillingDate: Date;
      totalPayments: number;
    }
  ): Promise<Subscription> {
    await this.subscriptionRepository.update(
      { id, tenantId },
      {
        lastPaymentDate: paymentInfo.lastPaymentDate,
        nextBillingDate: paymentInfo.nextBillingDate,
        totalPayments: paymentInfo.totalPayments,
      }
    );
    return this.findById(id, tenantId);
  }

  async cancel(id: string, tenantId: string, reason: string): Promise<Subscription> {
    await this.subscriptionRepository.update(
      { id, tenantId },
      {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason,
      }
    );
    return this.findById(id, tenantId);
  }

  async getSubscriptionStats(): Promise<any> {
    // Get total subscriptions by status
    const subscriptionsByStatus = await Promise.all(
      Object.values(SubscriptionStatus).map(async (status) => {
        const count = await this.subscriptionRepository.count({
          where: { status },
        });
        return { status, count };
      })
    );
    
    // Get total subscriptions by cycle
    const subscriptionsByCycle = await Promise.all(
      Object.values(SubscriptionCycle).map(async (cycle) => {
        const count = await this.subscriptionRepository.count({
          where: { cycle },
        });
        return { cycle, count };
      })
    );
    
    // Get monthly recurring revenue (MRR)
    const activeSubscriptions = await this.subscriptionRepository.find({
      where: { status: SubscriptionStatus.ACTIVE },
    });
    
    const mrr = activeSubscriptions.reduce((sum, subscription) => {
      let monthlyAmount = Number(subscription.amount);
      
      // Convert to monthly amount based on cycle
      switch (subscription.cycle) {
        case SubscriptionCycle.QUARTERLY:
          monthlyAmount /= 3;
          break;
        case SubscriptionCycle.SEMIANNUAL:
          monthlyAmount /= 6;
          break;
        case SubscriptionCycle.ANNUAL:
          monthlyAmount /= 12;
          break;
      }
      
      return sum + monthlyAmount;
    }, 0);
    
    return {
      totalActive: activeSubscriptions.length,
      subscriptionsByStatus,
      subscriptionsByCycle,
      mrr,
    };
  }

  async countTotal(): Promise<number> {
    return this.subscriptionRepository.count();
  }
}
