import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ShippingMethodType {
  FIXED = 'fixed',
  WEIGHT_BASED = 'weight_based',
  PRICE_BASED = 'price_based',
  LOCATION_BASED = 'location_based',
  FREE = 'free',
  PICKUP = 'pickup',
  CUSTOM = 'custom',
}

@Entity('shipping_methods')
@Index(['tenantId', 'code'], { unique: true })
export class ShippingMethod {
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
    enum: ShippingMethodType,
    default: ShippingMethodType.FIXED,
  })
  type: ShippingMethodType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  iconUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxOrderValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  freeShippingThreshold: number;

  @Column({ type: 'jsonb', default: [] })
  weightRules: {
    minWeight: number;
    maxWeight: number;
    price: number;
  }[];

  @Column({ type: 'jsonb', default: [] })
  priceRules: {
    minOrderValue: number;
    maxOrderValue: number;
    price: number;
  }[];

  @Column({ type: 'jsonb', default: [] })
  locationRules: {
    country: string;
    state?: string;
    city?: string;
    postalCode?: string;
    price: number;
  }[];

  @Column({ type: 'jsonb', default: {} })
  settings: {
    estimatedDeliveryDays?: number;
    requiresAddress?: boolean;
    allowsPickup?: boolean;
    pickupLocations?: {
      name: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      businessHours?: string;
    }[];
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculate shipping price based on cart details
  calculatePrice(
    subtotal: number,
    weight: number,
    location: { country: string; state?: string; city?: string; postalCode?: string; }
  ): number {
    // If order value is above free shipping threshold, return 0
    if (this.freeShippingThreshold && subtotal >= this.freeShippingThreshold) {
      return 0;
    }

    // Check if order value is within min/max range
    if (
      (this.minOrderValue && subtotal < this.minOrderValue) ||
      (this.maxOrderValue && subtotal > this.maxOrderValue)
    ) {
      return null; // Method not applicable
    }

    // Calculate based on shipping method type
    switch (this.type) {
      case ShippingMethodType.FREE:
        return 0;

      case ShippingMethodType.FIXED:
        return this.basePrice;

      case ShippingMethodType.WEIGHT_BASED:
        if (this.weightRules && this.weightRules.length > 0) {
          const applicableRule = this.weightRules.find(
            rule => weight >= rule.minWeight && weight <= rule.maxWeight
          );
          return applicableRule ? applicableRule.price : this.basePrice;
        }
        return this.basePrice;

      case ShippingMethodType.PRICE_BASED:
        if (this.priceRules && this.priceRules.length > 0) {
          const applicableRule = this.priceRules.find(
            rule => subtotal >= rule.minOrderValue && subtotal <= rule.maxOrderValue
          );
          return applicableRule ? applicableRule.price : this.basePrice;
        }
        return this.basePrice;

      case ShippingMethodType.LOCATION_BASED:
        if (this.locationRules && this.locationRules.length > 0) {
          // Try to find the most specific match
          const applicableRules = this.locationRules.filter(rule => {
            if (rule.country !== location.country) return false;
            if (rule.state && rule.state !== location.state) return false;
            if (rule.city && rule.city !== location.city) return false;
            if (rule.postalCode && rule.postalCode !== location.postalCode) return false;
            return true;
          });

          // Sort by specificity (more fields = more specific)
          if (applicableRules.length > 0) {
            const mostSpecific = applicableRules.sort((a, b) => {
              const specificityA = Object.keys(a).length;
              const specificityB = Object.keys(b).length;
              return specificityB - specificityA;
            })[0];
            return mostSpecific.price;
          }
        }
        return this.basePrice;

      case ShippingMethodType.PICKUP:
        return 0;

      default:
        return this.basePrice;
    }
  }
}
