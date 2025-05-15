import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { Attribute } from './attribute.entity';

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
  BUNDLE = 'bundle',
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  OUT_OF_STOCK = 'out_of_stock',
}

@Entity('products')
@Index(['tenantId', 'sku'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  longDescription: string;

  @Column({ unique: true, nullable: true })
  slug: string;

  @Column({ unique: true, nullable: true })
  sku: string;

  @Column({ nullable: true })
  barcode: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.PHYSICAL,
  })
  type: ProductType;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPrice: number;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ default: false })
  manageInventory: boolean;

  @Column({ default: false })
  allowBackorders: boolean;

  @Column({ default: false })
  featured: boolean;

  @Column({ nullable: true })
  mainImageUrl: string;

  @Column({ type: 'jsonb', default: [] })
  imageUrls: string[];

  @Column({ type: 'jsonb', default: {} })
  attributes: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToMany(() => Attribute)
  @JoinTable({
    name: 'product_attributes',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'attributeId', referencedColumnName: 'id' },
  })
  attributeDefinitions: Attribute[];

  @Column({ default: 0 })
  weight: number;

  @Column({ nullable: true })
  weightUnit: string;

  @Column({ default: 0 })
  width: number;

  @Column({ default: 0 })
  height: number;

  @Column({ default: 0 })
  depth: number;

  @Column({ nullable: true })
  dimensionsUnit: string;

  // SEO fields
  @Column({ nullable: true })
  metaTitle: string;

  @Column({ nullable: true })
  metaDescription: string;

  @Column({ nullable: true })
  metaKeywords: string;

  // Digital product fields
  @Column({ nullable: true })
  downloadUrl: string;

  @Column({ nullable: true })
  downloadExpiryDays: number;

  // Service fields
  @Column({ default: false })
  requiresAppointment: boolean;

  @Column({ nullable: true })
  serviceDuration: number; // in minutes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
