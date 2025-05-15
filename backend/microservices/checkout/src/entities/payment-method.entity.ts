import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BOLETO = 'boleto',
  PIX = 'pix',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
  INSTALLMENT = 'installment',
  CUSTOM = 'custom',
}

@Entity('payment_methods')
@Index(['tenantId', 'code'], { unique: true })
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
    default: PaymentMethodType.CREDIT_CARD,
  })
  type: PaymentMethodType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  iconUrl: string;

  @Column({ type: 'jsonb', default: {} })
  settings: {
    asaasEnabled?: boolean;
    asaasPaymentMethods?: string[];
    installmentOptions?: { value: number; label: string; }[];
    customFields?: { name: string; type: string; required: boolean; }[];
    [key: string]: any;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  feeFixed: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  feePercentage: number;

  @Column({ default: false })
  isGatewayMethod: boolean;

  @Column({ nullable: true })
  gatewayId: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculate fee for a given amount
  calculateFee(amount: number): number {
    return this.feeFixed + (amount * this.feePercentage / 100);
  }
}
