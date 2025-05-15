import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  COLOR = 'color',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
}

@Entity('attributes')
@Index(['tenantId', 'code'], { unique: true })
export class Attribute {
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
    enum: AttributeType,
    default: AttributeType.TEXT,
  })
  type: AttributeType;

  @Column({ default: true })
  isRequired: boolean;

  @Column({ default: false })
  isFilterable: boolean;

  @Column({ default: false })
  isSearchable: boolean;

  @Column({ default: false })
  isVariant: boolean;

  @Column({ type: 'jsonb', nullable: true })
  options: { value: string; label: string; }[];

  @Column({ nullable: true })
  defaultValue: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ default: false })
  isSystem: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
