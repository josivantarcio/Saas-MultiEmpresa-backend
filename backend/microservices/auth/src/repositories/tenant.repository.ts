import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from '../entities/tenant.entity';

@Injectable()
export class TenantRepository {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async findById(id: string): Promise<Tenant> {
    return this.tenantRepository.findOne({ where: { id } });
  }

  async findBySubdomain(subdomain: string): Promise<Tenant> {
    return this.tenantRepository.findOne({ where: { subdomain } });
  }

  async findByCustomDomain(customDomain: string): Promise<Tenant> {
    return this.tenantRepository.findOne({ where: { customDomain } });
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async findActive(): Promise<Tenant[]> {
    return this.tenantRepository.find({ 
      where: { status: TenantStatus.ACTIVE }
    });
  }

  async findOverdue(): Promise<Tenant[]> {
    return this.tenantRepository.find({ 
      where: { isPaymentOverdue: true }
    });
  }

  async create(tenantData: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenantRepository.create(tenantData);
    return this.tenantRepository.save(tenant);
  }

  async update(id: string, tenantData: Partial<Tenant>): Promise<Tenant> {
    await this.tenantRepository.update(id, tenantData);
    return this.findById(id);
  }

  async updateStatus(id: string, status: TenantStatus): Promise<void> {
    await this.tenantRepository.update(id, { status });
  }

  async updatePaymentInfo(
    id: string, 
    asaasSubscriptionId: string,
    lastPaymentDate: Date,
    nextPaymentDate: Date,
    isPaymentOverdue: boolean
  ): Promise<void> {
    await this.tenantRepository.update(id, {
      asaasSubscriptionId,
      lastPaymentDate,
      nextPaymentDate,
      isPaymentOverdue
    });
  }

  async markOverdue(id: string): Promise<void> {
    await this.tenantRepository.update(id, { 
      isPaymentOverdue: true,
      status: TenantStatus.PENDING_PAYMENT
    });
  }

  async suspendTenant(id: string): Promise<void> {
    await this.tenantRepository.update(id, { 
      status: TenantStatus.SUSPENDED
    });
  }

  async reactivateTenant(id: string): Promise<void> {
    await this.tenantRepository.update(id, { 
      status: TenantStatus.ACTIVE,
      isPaymentOverdue: false
    });
  }

  async remove(id: string): Promise<void> {
    await this.tenantRepository.delete(id);
  }
}
