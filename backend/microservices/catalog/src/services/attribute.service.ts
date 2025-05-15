import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AttributeRepository } from '../repositories/attribute.repository';
import { Attribute } from '../entities/attribute.entity';

@Injectable()
export class AttributeService {
  constructor(
    private attributeRepository: AttributeRepository,
  ) {}

  async findById(id: string, tenantId: string): Promise<Attribute> {
    const attribute = await this.attributeRepository.findById(id, tenantId);
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }
    return attribute;
  }

  async findByCode(code: string, tenantId: string): Promise<Attribute> {
    const attribute = await this.attributeRepository.findByCode(code, tenantId);
    if (!attribute) {
      throw new NotFoundException(`Attribute with code ${code} not found`);
    }
    return attribute;
  }

  async findAll(tenantId: string, options: any = {}): Promise<Attribute[]> {
    return this.attributeRepository.findAll(tenantId, options);
  }

  async create(tenantId: string, attributeData: Partial<Attribute>): Promise<Attribute> {
    // Check if code already exists for this tenant
    const existingAttribute = await this.attributeRepository.findByCode(attributeData.code, tenantId);
    if (existingAttribute) {
      throw new BadRequestException(`Attribute with code ${attributeData.code} already exists`);
    }
    
    // Ensure tenant ID is set
    attributeData.tenantId = tenantId;
    
    // For SELECT or MULTI_SELECT, validate options
    if (
      (attributeData.type === 'select' || attributeData.type === 'multi_select') && 
      (!attributeData.options || attributeData.options.length === 0)
    ) {
      throw new BadRequestException('Options are required for SELECT and MULTI_SELECT attributes');
    }
    
    return this.attributeRepository.create(attributeData);
  }

  async update(id: string, tenantId: string, attributeData: Partial<Attribute>): Promise<Attribute> {
    // Check if attribute exists
    const existingAttribute = await this.findById(id, tenantId);
    
    // If code is changing, check if new code already exists for this tenant
    if (attributeData.code && attributeData.code !== existingAttribute.code) {
      const attributeWithSameCode = await this.attributeRepository.findByCode(attributeData.code, tenantId);
      if (attributeWithSameCode) {
        throw new BadRequestException(`Attribute with code ${attributeData.code} already exists`);
      }
    }
    
    // For SELECT or MULTI_SELECT, validate options
    if (
      (attributeData.type === 'select' || attributeData.type === 'multi_select' || 
       existingAttribute.type === 'select' || existingAttribute.type === 'multi_select') && 
      attributeData.options && attributeData.options.length === 0
    ) {
      throw new BadRequestException('Options are required for SELECT and MULTI_SELECT attributes');
    }
    
    // Prevent changing type for system attributes
    if (existingAttribute.isSystem && attributeData.type && attributeData.type !== existingAttribute.type) {
      throw new BadRequestException('Cannot change the type of system attributes');
    }
    
    return this.attributeRepository.update(id, tenantId, attributeData);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    // Check if attribute exists
    const attribute = await this.findById(id, tenantId);
    
    // Prevent deleting system attributes
    if (attribute.isSystem) {
      throw new BadRequestException('System attributes cannot be deleted');
    }
    
    return this.attributeRepository.remove(id, tenantId);
  }

  async getVariantAttributes(tenantId: string): Promise<Attribute[]> {
    return this.attributeRepository.getVariantAttributes(tenantId);
  }

  async getFilterableAttributes(tenantId: string): Promise<Attribute[]> {
    return this.attributeRepository.getFilterableAttributes(tenantId);
  }

  async updateSortOrder(tenantId: string, ids: string[]): Promise<void> {
    // Validate that all attributes exist and belong to the tenant
    for (const id of ids) {
      await this.findById(id, tenantId);
    }
    
    return this.attributeRepository.updateSortOrder(ids, tenantId);
  }

  async bulkCreate(tenantId: string, attributes: Partial<Attribute>[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;
    const validAttributes: Partial<Attribute>[] = [];
    
    for (const attributeData of attributes) {
      try {
        // Set tenant ID
        attributeData.tenantId = tenantId;
        
        // Check if code already exists for this tenant
        const existingAttribute = await this.attributeRepository.findByCode(attributeData.code, tenantId);
        if (existingAttribute) {
          throw new Error(`Attribute with code ${attributeData.code} already exists`);
        }
        
        // For SELECT or MULTI_SELECT, validate options
        if (
          (attributeData.type === 'select' || attributeData.type === 'multi_select') && 
          (!attributeData.options || attributeData.options.length === 0)
        ) {
          throw new Error('Options are required for SELECT and MULTI_SELECT attributes');
        }
        
        validAttributes.push(attributeData);
        success++;
      } catch (error) {
        failed++;
      }
    }
    
    if (validAttributes.length > 0) {
      await this.attributeRepository.bulkCreate(validAttributes);
    }
    
    return { success, failed };
  }

  async initializeDefaultAttributes(tenantId: string): Promise<void> {
    // Create common default attributes for all tenants
    const defaultAttributes = [
      {
        name: 'Color',
        code: 'color',
        type: 'color',
        isFilterable: true,
        isSearchable: true,
        isVariant: true,
        isSystem: true,
        sortOrder: 0,
        tenantId,
      },
      {
        name: 'Size',
        code: 'size',
        type: 'select',
        isFilterable: true,
        isSearchable: true,
        isVariant: true,
        isSystem: true,
        sortOrder: 1,
        options: [
          { value: 'xs', label: 'XS' },
          { value: 's', label: 'S' },
          { value: 'm', label: 'M' },
          { value: 'l', label: 'L' },
          { value: 'xl', label: 'XL' },
          { value: 'xxl', label: 'XXL' },
        ],
        tenantId,
      },
      {
        name: 'Material',
        code: 'material',
        type: 'select',
        isFilterable: true,
        isSearchable: true,
        isVariant: false,
        isSystem: true,
        sortOrder: 2,
        options: [
          { value: 'cotton', label: 'Cotton' },
          { value: 'wool', label: 'Wool' },
          { value: 'polyester', label: 'Polyester' },
          { value: 'leather', label: 'Leather' },
          { value: 'silk', label: 'Silk' },
        ],
        tenantId,
      },
      {
        name: 'Brand',
        code: 'brand',
        type: 'text',
        isFilterable: true,
        isSearchable: true,
        isVariant: false,
        isSystem: true,
        sortOrder: 3,
        tenantId,
      },
    ];
    
    await this.attributeRepository.bulkCreate(defaultAttributes);
  }
}
