import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Payment } from './payment.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  ENDED = 'ended',
  TRIAL = 'trial',
}

export enum SubscriptionCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMIANNUAL = 'semiannual',
  ANNUAL = 'annual',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  planId: string;

  @Column()
  planName: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: SubscriptionCycle,
    default: SubscriptionCycle.MONTHLY,
  })
  cycle: SubscriptionCycle;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerDocument: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  paymentGateway: string;

  @Column({ nullable: true })
  gatewaySubscriptionId: string;

  @Column({ nullable: true })
  gatewayCustomerId: string;

  @Column({ nullable: true })
  cardBrand: string;

  @Column({ nullable: true })
  cardLastFourDigits: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  nextBillingDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  trialEndDate: Date;

  @Column({ nullable: true })
  lastPaymentDate: Date;

  @Column({ default: false })
  autoRenew: boolean;

  @Column({ default: 0 })
  totalPayments: number;

  @Column({ default: 0 })
  failedPayments: number;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancelReason: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  gatewayData: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  features: {
    maxProducts?: number;
    maxUsers?: number;
    maxStorage?: number;
    allowsDigitalProducts?: boolean;
    allowsServices?: boolean;
    allowsScheduling?: boolean;
    allowsMultipleStores?: boolean;
    customDomain?: boolean;
    advancedAnalytics?: boolean;
    prioritySupport?: boolean;
    [key: string]: any;
  };

  @OneToMany(() => Payment, payment => payment.subscriptionId)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculated fields
  get isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE;
  }

  get isInTrial(): boolean {
    return this.status === SubscriptionStatus.TRIAL;
  }

  get isCancelled(): boolean {
    return this.status === SubscriptionStatus.CANCELLED;
  }

  get isOverdue(): boolean {
    return this.status === SubscriptionStatus.OVERDUE;
  }

  get isPending(): boolean {
    return this.status === SubscriptionStatus.PENDING;
  }

  get isEnded(): boolean {
    return this.status === SubscriptionStatus.ENDED;
  }

  get daysUntilNextBilling(): number {
    if (!this.nextBillingDate) return null;
    const now = new Date();
    const diffTime = this.nextBillingDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get daysInTrial(): number {
    if (!this.trialEndDate || !this.isInTrial) return 0;
    const now = new Date();
    const diffTime = this.trialEndDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
}
