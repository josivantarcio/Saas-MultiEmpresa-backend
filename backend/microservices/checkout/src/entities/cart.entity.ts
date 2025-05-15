import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('carts')
@Index(['tenantId', 'sessionId'])
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ nullable: true })
  userId: string;

  @Column()
  sessionId: string;

  @Column({ default: false })
  isCheckoutStarted: boolean;

  @Column({ default: false })
  isAbandoned: boolean;

  @Column({ nullable: true })
  lastNotificationSent: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ nullable: true })
  couponCode: string;

  @Column({ nullable: true })
  shippingMethodId: string;

  @Column({ nullable: true })
  paymentMethodId: string;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  billingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @OneToMany(() => CartItem, cartItem => cartItem.cart, { 
    cascade: true,
    eager: true
  })
  items: CartItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculated fields
  get itemCount(): number {
    if (!this.items) return 0;
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get isEmpty(): boolean {
    return !this.items || this.items.length === 0;
  }

  // Method to recalculate totals
  calculateTotals(): void {
    if (!this.items || this.items.length === 0) {
      this.subtotal = 0;
      this.total = 0;
      return;
    }

    this.subtotal = this.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    this.total = this.subtotal + this.shippingAmount + this.taxAmount - this.discountAmount;
  }
}
