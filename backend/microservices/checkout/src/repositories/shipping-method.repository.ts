import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethod, ShippingMethodType } from '../entities/shipping-method.entity';

@Injectable()
export class ShippingMethodRepository {
  constructor(
    @InjectRepository(ShippingMethod)
    private shippingMethodRepository: Repository<ShippingMethod>,
  ) {}

  async findById(id: string, tenantId: string): Promise<ShippingMethod> {
    return this.shippingMethodRepository.findOne({ where: { id, tenantId } });
  }

  async findByCode(code: string, tenantId: string): Promise<ShippingMethod> {
    return this.shippingMethodRepository.findOne({ where: { code, tenantId } });
  }

  async findAll(tenantId: string, options: {
    isActive?: boolean;
    type?: ShippingMethodType;
  } = {}): Promise<ShippingMethod[]> {
    const { isActive, type } = options;
    
    const queryBuilder = this.shippingMethodRepository.createQueryBuilder('shippingMethod')
      .where('shippingMethod.tenantId = :tenantId', { tenantId });
    
    if (isActive !== undefined) {
      queryBuilder.andWhere('shippingMethod.isActive = :isActive', { isActive });
    }
    
    if (type) {
      queryBuilder.andWhere('shippingMethod.type = :type', { type });
    }
    
    queryBuilder.orderBy('shippingMethod.sortOrder', 'ASC');
    
    return queryBuilder.getMany();
  }

  async create(shippingMethodData: Partial<ShippingMethod>): Promise<ShippingMethod> {
    const shippingMethod = this.shippingMethodRepository.create(shippingMethodData);
    return this.shippingMethodRepository.save(shippingMethod);
  }

  async update(id: string, tenantId: string, shippingMethodData: Partial<ShippingMethod>): Promise<ShippingMethod> {
    await this.shippingMethodRepository.update(
      { id, tenantId },
      shippingMethodData
    );
    return this.findById(id, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    await this.shippingMethodRepository.delete({ id, tenantId });
  }

  async updateSortOrder(ids: string[], tenantId: string): Promise<void> {
    const queryRunner = this.shippingMethodRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      for (let i = 0; i < ids.length; i++) {
        await queryRunner.manager.update(
          ShippingMethod,
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

  async calculateShippingOptions(
    tenantId: string,
    cartDetails: {
      subtotal: number;
      weight: number;
      location: {
        country: string;
        state?: string;
        city?: string;
        postalCode?: string;
      };
    }
  ): Promise<Array<{ id: string; name: string; price: number; estimatedDeliveryDays?: number }>> {
    const shippingMethods = await this.findAll(tenantId, { isActive: true });
    
    const options = [];
    
    for (const method of shippingMethods) {
      const price = method.calculatePrice(
        cartDetails.subtotal,
        cartDetails.weight,
        cartDetails.location
      );
      
      // Only include methods where a price could be calculated
      if (price !== null) {
        options.push({
          id: method.id,
          name: method.name,
          price,
          estimatedDeliveryDays: method.settings.estimatedDeliveryDays,
        });
      }
    }
    
    return options;
  }

  async initializeDefaultMethods(tenantId: string): Promise<void> {
    // Create common default shipping methods for all tenants
    const defaultMethods = [
      {
        name: 'Frete Grátis',
        code: 'free_shipping',
        description: 'Frete grátis para compras acima de R$ 150,00',
        type: ShippingMethodType.FREE,
        isActive: true,
        sortOrder: 0,
        basePrice: 0,
        freeShippingThreshold: 150,
        settings: {
          estimatedDeliveryDays: 7,
          requiresAddress: true,
        },
        tenantId,
      },
      {
        name: 'Frete Padrão',
        code: 'standard_shipping',
        description: 'Entrega em 5-7 dias úteis',
        type: ShippingMethodType.FIXED,
        isActive: true,
        sortOrder: 1,
        basePrice: 15.90,
        settings: {
          estimatedDeliveryDays: 7,
          requiresAddress: true,
        },
        tenantId,
      },
      {
        name: 'Frete Expresso',
        code: 'express_shipping',
        description: 'Entrega em 2-3 dias úteis',
        type: ShippingMethodType.FIXED,
        isActive: true,
        sortOrder: 2,
        basePrice: 29.90,
        settings: {
          estimatedDeliveryDays: 3,
          requiresAddress: true,
        },
        tenantId,
      },
      {
        name: 'Retirada na Loja',
        code: 'store_pickup',
        description: 'Retire seu pedido em uma de nossas lojas',
        type: ShippingMethodType.PICKUP,
        isActive: true,
        sortOrder: 3,
        basePrice: 0,
        settings: {
          estimatedDeliveryDays: 1,
          requiresAddress: false,
          allowsPickup: true,
          pickupLocations: [
            {
              name: 'Loja Central',
              address: 'Av. Paulista, 1000',
              city: 'São Paulo',
              state: 'SP',
              postalCode: '01310-100',
              country: 'BR',
              businessHours: 'Seg-Sex: 9h-18h, Sáb: 9h-13h',
            }
          ],
        },
        tenantId,
      },
    ];
    
    for (const methodData of defaultMethods) {
      // Check if method already exists
      const existingMethod = await this.findByCode(methodData.code, tenantId);
      if (!existingMethod) {
        await this.create(methodData);
      }
    }
  }
}
