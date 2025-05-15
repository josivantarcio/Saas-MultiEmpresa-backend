import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attribute, AttributeType } from '../entities/attribute.entity';

@Injectable()
export class AttributeRepository {
  constructor(
    @InjectRepository(Attribute)
    private attributeRepository: Repository<Attribute>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Attribute> {
    return this.attributeRepository.findOne({ where: { id, tenantId } });
  }

  async findByCode(code: string, tenantId: string): Promise<Attribute> {
    return this.attributeRepository.findOne({ where: { code, tenantId } });
  }

  async findAll(tenantId: string, options: {
    isFilterable?: boolean;
    isSearchable?: boolean;
    isVariant?: boolean;
    type?: AttributeType;
  } = {}): Promise<Attribute[]> {
    const { isFilterable, isSearchable, isVariant, type } = options;
    
    const queryBuilder = this.attributeRepository.createQueryBuilder('attribute')
      .where('attribute.tenantId = :tenantId', { tenantId });
    
    if (isFilterable !== undefined) {
      queryBuilder.andWhere('attribute.isFilterable = :isFilterable', { isFilterable });
    }
    
    if (isSearchable !== undefined) {
      queryBuilder.andWhere('attribute.isSearchable = :isSearchable', { isSearchable });
    }
    
    if (isVariant !== undefined) {
      queryBuilder.andWhere('attribute.isVariant = :isVariant', { isVariant });
    }
    
    if (type) {
      queryBuilder.andWhere('attribute.type = :type', { type });
    }
    
    queryBuilder
      .orderBy('attribute.sortOrder', 'ASC')
      .addOrderBy('attribute.name', 'ASC');
    
    return queryBuilder.getMany();
  }

  async create(attributeData: Partial<Attribute>): Promise<Attribute> {
    const attribute = this.attributeRepository.create(attributeData);
    return this.attributeRepository.save(attribute);
  }

  async update(id: string, tenantId: string, attributeData: Partial<Attribute>): Promise<Attribute> {
    await this.attributeRepository.update(
      { id, tenantId },
      attributeData
    );
    return this.findById(id, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    await this.attributeRepository.delete({ id, tenantId });
  }

  async getVariantAttributes(tenantId: string): Promise<Attribute[]> {
    return this.attributeRepository.find({
      where: { tenantId, isVariant: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async getFilterableAttributes(tenantId: string): Promise<Attribute[]> {
    return this.attributeRepository.find({
      where: { tenantId, isFilterable: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async updateSortOrder(ids: string[], tenantId: string): Promise<void> {
    const queryRunner = this.attributeRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      for (let i = 0; i < ids.length; i++) {
        await queryRunner.manager.update(
          Attribute,
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

  async bulkCreate(attributes: Partial<Attribute>[]): Promise<Attribute[]> {
    const createdAttributes = this.attributeRepository.create(attributes);
    return this.attributeRepository.save(createdAttributes);
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.attributeRepository.count({ where: { tenantId } });
  }
}
