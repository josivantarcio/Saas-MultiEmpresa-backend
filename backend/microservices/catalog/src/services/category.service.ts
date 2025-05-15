import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { ProductRepository } from '../repositories/product.repository';
import { Category } from '../entities/category.entity';
import { generateSlug } from '../utils/slug.util';

@Injectable()
export class CategoryService {
  constructor(
    private categoryRepository: CategoryRepository,
    private productRepository: ProductRepository,
  ) {}

  async findById(id: string, tenantId: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id, tenantId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async findBySlug(slug: string, tenantId: string): Promise<Category> {
    const category = await this.categoryRepository.findBySlug(slug, tenantId);
    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }
    return category;
  }

  async findAll(tenantId: string, options: any = {}): Promise<Category[]> {
    return this.categoryRepository.findAll(tenantId, options);
  }

  async getTree(tenantId: string): Promise<Category[]> {
    return this.categoryRepository.getTree(tenantId);
  }

  async create(tenantId: string, categoryData: Partial<Category>): Promise<Category> {
    // Validate parent category if provided
    if (categoryData.parentId) {
      const parentCategory = await this.categoryRepository.findById(categoryData.parentId, tenantId);
      if (!parentCategory) {
        throw new BadRequestException(`Parent category with ID ${categoryData.parentId} not found`);
      }
    }
    
    // Generate slug if not provided
    if (!categoryData.slug && categoryData.name) {
      categoryData.slug = await this.generateUniqueSlug(categoryData.name, tenantId);
    }
    
    // Ensure tenant ID is set
    categoryData.tenantId = tenantId;
    
    return this.categoryRepository.create(categoryData);
  }

  async update(id: string, tenantId: string, categoryData: Partial<Category>): Promise<Category> {
    // Check if category exists
    const existingCategory = await this.findById(id, tenantId);
    
    // Validate parent category if provided
    if (categoryData.parentId) {
      // Prevent setting self as parent
      if (categoryData.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }
      
      const parentCategory = await this.categoryRepository.findById(categoryData.parentId, tenantId);
      if (!parentCategory) {
        throw new BadRequestException(`Parent category with ID ${categoryData.parentId} not found`);
      }
      
      // Prevent circular references
      let currentParent = parentCategory;
      while (currentParent.parentId) {
        if (currentParent.parentId === id) {
          throw new BadRequestException('Circular reference detected in category hierarchy');
        }
        currentParent = await this.categoryRepository.findById(currentParent.parentId, tenantId);
      }
    }
    
    // Generate slug if name changed and slug not provided
    if (categoryData.name && !categoryData.slug && categoryData.name !== existingCategory.name) {
      categoryData.slug = await this.generateUniqueSlug(categoryData.name, tenantId, id);
    }
    
    return this.categoryRepository.update(id, tenantId, categoryData);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    // Check if category exists
    await this.findById(id, tenantId);
    
    // Check if category has products
    const productCount = await this.productRepository.countByCategory(id, tenantId);
    if (productCount > 0) {
      throw new BadRequestException(`Cannot delete category with ${productCount} associated products`);
    }
    
    return this.categoryRepository.remove(id, tenantId);
  }

  async updateSortOrder(tenantId: string, ids: string[]): Promise<void> {
    // Validate that all categories exist and belong to the tenant
    for (const id of ids) {
      await this.findById(id, tenantId);
    }
    
    return this.categoryRepository.updateSortOrder(ids, tenantId);
  }

  private async generateUniqueSlug(name: string, tenantId: string, excludeId?: string): Promise<string> {
    let slug = generateSlug(name);
    let existingCategory = await this.categoryRepository.findBySlug(slug, tenantId);
    
    // If category exists and it's not the one we're updating, append a random suffix
    if (existingCategory && (!excludeId || existingCategory.id !== excludeId)) {
      const timestamp = Date.now().toString().slice(-6);
      slug = `${slug}-${timestamp}`;
    }
    
    return slug;
  }

  async getCategoryWithProductCounts(tenantId: string): Promise<any[]> {
    const categories = await this.categoryRepository.findAll(tenantId);
    
    const result = await Promise.all(
      categories.map(async (category) => {
        const productCount = await this.productRepository.countByCategory(category.id, tenantId);
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          parentId: category.parentId,
          productCount,
        };
      })
    );
    
    return result;
  }
}
