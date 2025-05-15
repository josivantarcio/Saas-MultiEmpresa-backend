import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Category> {
    return this.categoryRepository.findOne({ 
      where: { id, tenantId },
      relations: ['parent', 'children'],
    });
  }

  async findBySlug(slug: string, tenantId: string): Promise<Category> {
    return this.categoryRepository.findOne({ 
      where: { slug, tenantId },
      relations: ['parent', 'children'],
    });
  }

  async findAll(tenantId: string, options: {
    parentId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
  } = {}): Promise<Category[]> {
    const { parentId, isActive, isFeatured } = options;
    
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .where('category.tenantId = :tenantId', { tenantId });
    
    if (parentId) {
      queryBuilder.andWhere('category.parentId = :parentId', { parentId });
    } else if (parentId === null) {
      queryBuilder.andWhere('category.parentId IS NULL');
    }
    
    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }
    
    if (isFeatured !== undefined) {
      queryBuilder.andWhere('category.isFeatured = :isFeatured', { isFeatured });
    }
    
    queryBuilder
      .leftJoinAndSelect('category.children', 'children')
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC');
    
    return queryBuilder.getMany();
  }

  async getTree(tenantId: string): Promise<Category[]> {
    // Get all root categories (no parent)
    const rootCategories = await this.categoryRepository.find({
      where: { tenantId, parentId: null },
      relations: ['children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    
    // Recursively load children
    for (const rootCategory of rootCategories) {
      await this.loadChildren(rootCategory, tenantId);
    }
    
    return rootCategories;
  }

  private async loadChildren(category: Category, tenantId: string): Promise<void> {
    if (category.children && category.children.length > 0) {
      for (const child of category.children) {
        const loadedChild = await this.categoryRepository.findOne({
          where: { id: child.id, tenantId },
          relations: ['children'],
          order: { sortOrder: 'ASC', name: 'ASC' },
        });
        
        if (loadedChild && loadedChild.children && loadedChild.children.length > 0) {
          await this.loadChildren(loadedChild, tenantId);
        }
      }
    }
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    const category = this.categoryRepository.create(categoryData);
    return this.categoryRepository.save(category);
  }

  async update(id: string, tenantId: string, categoryData: Partial<Category>): Promise<Category> {
    await this.categoryRepository.update(
      { id, tenantId },
      categoryData
    );
    return this.findById(id, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    // Find the category first to check if it has children
    const category = await this.findById(id, tenantId);
    
    if (category && category.children && category.children.length > 0) {
      // Update all children to point to the parent of this category
      await this.categoryRepository.update(
        { parentId: id, tenantId },
        { parentId: category.parentId }
      );
    }
    
    await this.categoryRepository.delete({ id, tenantId });
  }

  async updateSortOrder(ids: string[], tenantId: string): Promise<void> {
    const queryRunner = this.categoryRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      for (let i = 0; i < ids.length; i++) {
        await queryRunner.manager.update(
          Category,
          { id: ids[i], tenantId },
          { sortOrder: i }
        );
      }
      
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.categoryRepository.count({ where: { tenantId } });
  }
}
