import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Product> {
    return this.productRepository.findOne({ 
      where: { id, tenantId },
      relations: ['category', 'attributeDefinitions']
    });
  }

  async findBySlug(slug: string, tenantId: string): Promise<Product> {
    return this.productRepository.findOne({ 
      where: { slug, tenantId },
      relations: ['category', 'attributeDefinitions']
    });
  }

  async findBySku(sku: string, tenantId: string): Promise<Product> {
    return this.productRepository.findOne({ 
      where: { sku, tenantId },
      relations: ['category', 'attributeDefinitions']
    });
  }

  async findAll(tenantId: string, options: {
    skip?: number;
    take?: number;
    status?: ProductStatus;
    categoryId?: string;
    featured?: boolean;
    search?: string;
  } = {}): Promise<[Product[], number]> {
    const { skip = 0, take = 50, status, categoryId, featured, search } = options;
    
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.tenantId = :tenantId', { tenantId });
    
    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }
    
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }
    
    if (featured !== undefined) {
      queryBuilder.andWhere('product.featured = :featured', { featured });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(take);
    
    return queryBuilder.getManyAndCount();
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async update(id: string, tenantId: string, productData: Partial<Product>): Promise<Product> {
    await this.productRepository.update(
      { id, tenantId },
      productData
    );
    return this.findById(id, tenantId);
  }

  async updateStock(id: string, tenantId: string, quantity: number): Promise<void> {
    const product = await this.findById(id, tenantId);
    if (product && product.manageInventory) {
      product.stockQuantity = quantity;
      if (quantity <= 0 && !product.allowBackorders) {
        product.status = ProductStatus.OUT_OF_STOCK;
      } else if (product.status === ProductStatus.OUT_OF_STOCK) {
        product.status = ProductStatus.ACTIVE;
      }
      await this.productRepository.save(product);
    }
  }

  async remove(id: string, tenantId: string): Promise<void> {
    await this.productRepository.delete({ id, tenantId });
  }

  async bulkCreate(products: Partial<Product>[]): Promise<Product[]> {
    const createdProducts = this.productRepository.create(products);
    return this.productRepository.save(createdProducts);
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.productRepository.count({ where: { tenantId } });
  }

  async countByCategory(categoryId: string, tenantId: string): Promise<number> {
    return this.productRepository.count({ where: { categoryId, tenantId } });
  }
}
