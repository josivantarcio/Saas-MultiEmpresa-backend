import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  PENDING_PAYMENT = 'pending_payment',
}

export enum TenantPlan {
  FREE = 'free',
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  subdomain: string;

  @Column({ nullable: true })
  customDomain: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.TRIAL,
  })
  status: TenantStatus;

  @Column({
    type: 'enum',
    enum: TenantPlan,
    default: TenantPlan.FREE,
  })
  plan: TenantPlan;

  @Column({ type: 'date', nullable: true })
  trialEndsAt: Date;

  @Column({ type: 'date', nullable: true })
  subscriptionEndsAt: Date;

  @Column({ nullable: true })
  asaasCustomerId: string;

  @Column({ nullable: true })
  asaasSubscriptionId: string;

  @Column({ nullable: true })
  lastPaymentDate: Date;

  @Column({ nullable: true })
  nextPaymentDate: Date;

  @Column({ default: false })
  isPaymentOverdue: boolean;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  primaryColor: string;

  @Column({ nullable: true })
  secondaryColor: string;

  @Column({ type: 'jsonb', default: {} })
  settings: {
    allowedPaymentMethods?: string[];
    enabledFeatures?: string[];
    taxSettings?: Record<string, any>;
    shippingSettings?: Record<string, any>;
    schedulingSettings?: Record<string, any>;
    emailSettings?: Record<string, any>;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @OneToMany(() => User, user => user.tenant)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get isActive(): boolean {
    return this.status === TenantStatus.ACTIVE;
  }

  get storeFrontUrl(): string {
    if (this.customDomain) {
      return `https://${this.customDomain}`;
    }
    return `https://${this.subdomain}.saasecommerce.com`;
  }

  get adminUrl(): string {
    return `https://admin.saasecommerce.com/tenant/${this.id}`;
  }
}
