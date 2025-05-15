import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Transaction } from './transaction.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  RECEIVED = 'received',
  OVERDUE = 'overdue',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum PaymentType {
  ORDER = 'order',
  SUBSCRIPTION = 'subscription',
  MANUAL = 'manual',
  REFUND = 'refund',
}

@Entity('payments')
@Index(['tenantId', 'externalReference'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  subscriptionId: string;

  @Column()
  externalReference: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.ORDER,
  })
  type: PaymentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundedAmount: number;

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
  gatewayPaymentId: string;

  @Column({ nullable: true })
  gatewayUrl: string;

  @Column({ nullable: true })
  boletoUrl: string;

  @Column({ nullable: true })
  boletoBarcode: string;

  @Column({ nullable: true })
  pixQrCode: string;

  @Column({ nullable: true })
  pixKey: string;

  @Column({ nullable: true })
  cardBrand: string;

  @Column({ nullable: true })
  cardLastFourDigits: string;

  @Column({ nullable: true })
  installments: number;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  refundedAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  gatewayData: Record<string, any>;

  @OneToMany(() => Transaction, transaction => transaction.payment)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculated fields
  get isPaid(): boolean {
    return this.status === PaymentStatus.CONFIRMED || this.status === PaymentStatus.RECEIVED;
  }

  get isRefunded(): boolean {
    return this.status === PaymentStatus.REFUNDED;
  }

  get isPartiallyRefunded(): boolean {
    return this.status === PaymentStatus.PARTIALLY_REFUNDED;
  }

  get isCancelled(): boolean {
    return this.status === PaymentStatus.CANCELLED;
  }

  get isOverdue(): boolean {
    return this.status === PaymentStatus.OVERDUE;
  }

  get isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  get isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }
}
