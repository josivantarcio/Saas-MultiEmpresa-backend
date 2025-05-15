import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod, PaymentMethodType } from '../entities/payment-method.entity';

@Injectable()
export class PaymentMethodRepository {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async findById(id: string, tenantId: string): Promise<PaymentMethod> {
    return this.paymentMethodRepository.findOne({ where: { id, tenantId } });
  }

  async findByCode(code: string, tenantId: string): Promise<PaymentMethod> {
    return this.paymentMethodRepository.findOne({ where: { code, tenantId } });
  }

  async findAll(tenantId: string, options: {
    isActive?: boolean;
    type?: PaymentMethodType;
  } = {}): Promise<PaymentMethod[]> {
    const { isActive, type } = options;
    
    const queryBuilder = this.paymentMethodRepository.createQueryBuilder('paymentMethod')
      .where('paymentMethod.tenantId = :tenantId', { tenantId });
    
    if (isActive !== undefined) {
      queryBuilder.andWhere('paymentMethod.isActive = :isActive', { isActive });
    }
    
    if (type) {
      queryBuilder.andWhere('paymentMethod.type = :type', { type });
    }
    
    queryBuilder.orderBy('paymentMethod.sortOrder', 'ASC');
    
    return queryBuilder.getMany();
  }

  async create(paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const paymentMethod = this.paymentMethodRepository.create(paymentMethodData);
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async update(id: string, tenantId: string, paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod> {
    await this.paymentMethodRepository.update(
      { id, tenantId },
      paymentMethodData
    );
    return this.findById(id, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    await this.paymentMethodRepository.delete({ id, tenantId });
  }

  async updateSortOrder(ids: string[], tenantId: string): Promise<void> {
    const queryRunner = this.paymentMethodRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      for (let i = 0; i < ids.length; i++) {
        await queryRunner.manager.update(
          PaymentMethod,
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

  async initializeDefaultMethods(tenantId: string): Promise<void> {
    // Create common default payment methods for all tenants
    const defaultMethods = [
      {
        name: 'Cartão de Crédito',
        code: 'credit_card',
        description: 'Pague com cartão de crédito através do Asaas',
        type: PaymentMethodType.CREDIT_CARD,
        isActive: true,
        sortOrder: 0,
        isGatewayMethod: true,
        gatewayId: 'asaas',
        settings: {
          asaasEnabled: true,
          asaasPaymentMethods: ['credit_card'],
          installmentOptions: [
            { value: 1, label: '1x sem juros' },
            { value: 2, label: '2x sem juros' },
            { value: 3, label: '3x sem juros' },
            { value: 4, label: '4x sem juros' },
            { value: 5, label: '5x sem juros' },
            { value: 6, label: '6x sem juros' },
          ],
        },
        tenantId,
      },
      {
        name: 'Boleto Bancário',
        code: 'boleto',
        description: 'Pague com boleto bancário através do Asaas',
        type: PaymentMethodType.BOLETO,
        isActive: true,
        sortOrder: 1,
        isGatewayMethod: true,
        gatewayId: 'asaas',
        settings: {
          asaasEnabled: true,
          asaasPaymentMethods: ['boleto'],
        },
        tenantId,
      },
      {
        name: 'PIX',
        code: 'pix',
        description: 'Pague instantaneamente com PIX através do Asaas',
        type: PaymentMethodType.PIX,
        isActive: true,
        sortOrder: 2,
        isGatewayMethod: true,
        gatewayId: 'asaas',
        settings: {
          asaasEnabled: true,
          asaasPaymentMethods: ['pix'],
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
