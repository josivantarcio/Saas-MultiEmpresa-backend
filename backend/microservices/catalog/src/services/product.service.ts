import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { Product, ProductStatus, ProductType } from '../entities/product.entity';
import { generateSlug } from '../utils/slug.util';

@Injectable()
export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private categoryRepository: CategoryRepository,
  ) {}

  async findById(id: string, tenantId: string): Promise<Product> {
    const product = await this.productRepository.findById(id, tenantId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findBySlug(slug: string, tenantId: string): Promise<Product> {
    const product = await this.productRepository.findBySlug(slug, tenantId);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return product;
  }

  async findAll(tenantId: string, options: any = {}): Promise<{ items: Product[]; total: number }> {
    const [products, total] = await this.productRepository.findAll(tenantId, options);
    return { items: products, total };
  }

  async create(tenantId: string, productData: Partial<Product>): Promise<Product> {
    // Validate category if provided
    if (productData.categoryId) {
      const category = await this.categoryRepository.findById(productData.categoryId, tenantId);
      if (!category) {
        throw new BadRequestException(`Category with ID ${productData.categoryId} not found`);
      }
    }
    
    // Generate slug if not provided
    if (!productData.slug && productData.name) {
      productData.slug = await this.generateUniqueSlug(productData.name, tenantId);
    }
    
    // Ensure tenant ID is set
    productData.tenantId = tenantId;
    
    return this.productRepository.create(productData);
  }

  async update(id: string, tenantId: string, productData: Partial<Product>): Promise<Product> {
    // Check if product exists
    const existingProduct = await this.findById(id, tenantId);
    
    // Validate category if provided
    if (productData.categoryId) {
      const category = await this.categoryRepository.findById(productData.categoryId, tenantId);
      if (!category) {
        throw new BadRequestException(`Category with ID ${productData.categoryId} not found`);
      }
    }
    
    // Generate slug if name changed and slug not provided
    if (productData.name && !productData.slug && productData.name !== existingProduct.name) {
      productData.slug = await this.generateUniqueSlug(productData.name, tenantId, id);
    }
    
    return this.productRepository.update(id, tenantId, productData);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    // Check if product exists
    await this.findById(id, tenantId);
    
    return this.productRepository.remove(id, tenantId);
  }

  async updateStock(id: string, tenantId: string, quantity: number): Promise<void> {
    const product = await this.findById(id, tenantId);
    
    if (!product.manageInventory) {
      throw new BadRequestException('Inventory management is not enabled for this product');
    }
    
    await this.productRepository.updateStock(id, tenantId, quantity);
  }

  async bulkImport(tenantId: string, products: Partial<Product>[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;
    const validProducts: Partial<Product>[] = [];
    
    for (const productData of products) {
      try {
        // Set tenant ID
        productData.tenantId = tenantId;
        
        // Generate slug if not provided
        if (!productData.slug && productData.name) {
          productData.slug = await this.generateUniqueSlug(productData.name, tenantId);
        }
        
        // Validate category if provided
        if (productData.categoryId) {
          const category = await this.categoryRepository.findById(productData.categoryId, tenantId);
          if (!category) {
            throw new Error(`Category with ID ${productData.categoryId} not found`);
          }
        }
        
        validProducts.push(productData);
        success++;
      } catch (error) {
        failed++;
      }
    }
    
    if (validProducts.length > 0) {
      await this.productRepository.bulkCreate(validProducts);
    }
    
    return { success, failed };
  }

  private async generateUniqueSlug(name: string, tenantId: string, excludeId?: string): Promise<string> {
    let slug = generateSlug(name);
    let existingProduct = await this.productRepository.findBySlug(slug, tenantId);
    
    // If product exists and it's not the one we're updating, append a random suffix
    if (existingProduct && (!excludeId || existingProduct.id !== excludeId)) {
      const timestamp = Date.now().toString().slice(-6);
      slug = `${slug}-${timestamp}`;
    }
    
    return slug;
  }

  async getDashboardStats(tenantId: string): Promise<any> {
    const totalProducts = await this.productRepository.countByTenant(tenantId);
    
    // Get counts by product type
    const productsByType = await Promise.all(
      Object.values(ProductType).map(async (type) => {
        try {
          const result = await this.productRepository.findAll(tenantId, { status: ProductStatus.ACTIVE, type });
          const products = result && result[0] ? result[0] : [];
          return { type, count: products.length };
        } catch (error) {
          return { type, count: 0 };
        }
      })
    );
    
    // Get low stock products
    let lowStockProducts = [];
    try {
      const result = await this.productRepository.findAll(tenantId, {
        take: 10,
        status: ProductStatus.ACTIVE,
      });
      
      if (result && result[0]) {
        lowStockProducts = result[0];
      }
    } catch (error) {
      // Em caso de erro, continua com array vazio
    }
    
    const lowStock = lowStockProducts
      .filter(product => product.manageInventory && product.stockQuantity <= 5)
      .map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        stock: product.stockQuantity,
      }));
    
    return {
      totalProducts,
      productsByType,
      lowStock,
    };
  }
}
