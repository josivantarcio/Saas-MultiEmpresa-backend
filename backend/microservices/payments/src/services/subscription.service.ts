import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { PaymentService } from './payment.service';
import { Subscription, SubscriptionStatus, SubscriptionCycle } from '../entities/subscription.entity';
import { PaymentType } from '../entities/payment.entity';
import { AsaasService } from './asaas.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentService: PaymentService,
    private readonly asaasService: AsaasService,
  ) {}

  async findById(id: string, tenantId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(id, tenantId);
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async findByGatewayId(gatewaySubscriptionId: string, tenantId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByGatewayId(gatewaySubscriptionId, tenantId);
    if (!subscription) {
      throw new NotFoundException(`Subscription with gateway ID ${gatewaySubscriptionId} not found`);
    }
    return subscription;
  }

  async findByTenantId(tenantId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByTenantId(tenantId);
    if (!subscription) {
      throw new NotFoundException(`No subscription found for tenant ID ${tenantId}`);
    }
    return subscription;
  }

  async findAll(options: {
    skip?: number;
    take?: number;
    status?: SubscriptionStatus;
    cycle?: SubscriptionCycle;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  } = {}): Promise<[Subscription[], number]> {
    return this.subscriptionRepository.findAll(options);
  }

  async findDueForRenewal(daysAhead: number = 3): Promise<Subscription[]> {
    return this.subscriptionRepository.findDueForRenewal(daysAhead);
  }

  async findOverdue(): Promise<Subscription[]> {
    return this.subscriptionRepository.findOverdue();
  }

  async findTrialsEnding(daysAhead: number = 3): Promise<Subscription[]> {
    return this.subscriptionRepository.findTrialsEnding(daysAhead);
  }

  async create(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    // Set default status if not provided
    if (!subscriptionData.status) {
      subscriptionData.status = SubscriptionStatus.PENDING;
    }
    
    // Set trial end date if in trial status
    if (subscriptionData.status === SubscriptionStatus.TRIAL && !subscriptionData.trialEndDate) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 15); // Default 15-day trial
      subscriptionData.trialEndDate = trialEndDate;
    }
    
    // Set next billing date if not provided
    if (!subscriptionData.nextBillingDate) {
      const nextBillingDate = new Date();
      
      // If in trial, set next billing date to trial end date
      if (subscriptionData.status === SubscriptionStatus.TRIAL && subscriptionData.trialEndDate) {
        nextBillingDate.setTime(subscriptionData.trialEndDate.getTime());
      } else {
        // Otherwise, set based on cycle
        switch (subscriptionData.cycle) {
          case SubscriptionCycle.MONTHLY:
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            break;
          case SubscriptionCycle.QUARTERLY:
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
            break;
          case SubscriptionCycle.SEMIANNUAL:
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 6);
            break;
          case SubscriptionCycle.ANNUAL:
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
            break;
          default:
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1); // Default to monthly
        }
      }
      
      subscriptionData.nextBillingDate = nextBillingDate;
    }
    
    return this.subscriptionRepository.create(subscriptionData);
  }

  async update(id: string, tenantId: string, subscriptionData: Partial<Subscription>): Promise<Subscription> {
    await this.findById(id, tenantId); // Verify subscription exists
    return this.subscriptionRepository.update(id, tenantId, subscriptionData);
  }

  async updateStatus(id: string, tenantId: string, status: SubscriptionStatus): Promise<Subscription> {
    await this.findById(id, tenantId); // Verify subscription exists
    return this.subscriptionRepository.updateStatus(id, tenantId, status);
  }

  async updatePaymentInfo(
    id: string,
    tenantId: string,
    paymentInfo: {
      lastPaymentDate: Date;
      nextBillingDate: Date;
      totalPayments: number;
    }
  ): Promise<Subscription> {
    await this.findById(id, tenantId); // Verify subscription exists
    return this.subscriptionRepository.updatePaymentInfo(id, tenantId, paymentInfo);
  }

  async cancel(id: string, tenantId: string, reason: string): Promise<Subscription> {
    const subscription = await this.findById(id, tenantId);
    
    try {
      // Cancel subscription in gateway if it exists
      if (subscription.gatewaySubscriptionId) {
        await this.asaasService.cancelSubscription(subscription.gatewaySubscriptionId);
      }
      
      // Update subscription in our system
      return this.subscriptionRepository.cancel(id, tenantId, reason);
    } catch (error) {
      throw new BadRequestException(`Failed to cancel subscription: ${error.message}`);
    }
  }

  async createSubscription(subscriptionData: {
    tenantId: string;
    planId: string;
    planName: string;
    cycle: SubscriptionCycle;
    amount: number;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerDocument?: string;
    customerPhone?: string;
    billingAddress?: any;
    paymentMethod: string;
    startDate?: Date;
    metadata?: any;
    isTrial?: boolean;
    trialDays?: number;
  }): Promise<Subscription> {
    try {
      const startDate = subscriptionData.startDate || new Date();
      const isTrial = subscriptionData.isTrial || false;
      const trialDays = subscriptionData.trialDays || 15;
      
      let gatewaySubscriptionId = null;
      let gatewaySubscription = null;
      
      // Create subscription in gateway if not a trial
      if (!isTrial) {
        gatewaySubscription = await this.asaasService.createSubscription({
          customer: subscriptionData.customerId,
          billingType: this.mapPaymentMethodToAsaas(subscriptionData.paymentMethod),
          value: subscriptionData.amount,
          nextDueDate: startDate,
          cycle: this.mapCycleToAsaas(subscriptionData.cycle),
          description: `Subscription to ${subscriptionData.planName}`,
          ...subscriptionData.metadata
        });
        
        gatewaySubscriptionId = gatewaySubscription.id;
      }
      
      // Calculate trial end date if applicable
      let trialEndDate = null;
      if (isTrial) {
        trialEndDate = new Date(startDate);
        trialEndDate.setDate(trialEndDate.getDate() + trialDays);
      }
      
      // Create subscription in our system
      const subscription = await this.create({
        tenantId: subscriptionData.tenantId,
        planId: subscriptionData.planId,
        planName: subscriptionData.planName,
        cycle: subscriptionData.cycle,
        amount: subscriptionData.amount,
        customerId: subscriptionData.customerId,
        customerName: subscriptionData.customerName,
        customerEmail: subscriptionData.customerEmail,
        customerDocument: subscriptionData.customerDocument,
        customerPhone: subscriptionData.customerPhone,
        billingAddress: subscriptionData.billingAddress,
        paymentMethod: subscriptionData.paymentMethod,
        startDate,
        status: isTrial ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE,
        trialEndDate,
        gatewaySubscriptionId,
        metadata: {
          ...subscriptionData.metadata,
          gateway: 'asaas',
          gatewayResponse: gatewaySubscription
        }
      });
      
      // If not a trial, create initial payment
      if (!isTrial && gatewaySubscription) {
        // Get the first invoice from the subscription
        const invoices = await this.asaasService.getSubscriptionInvoices(gatewaySubscriptionId);
        
        if (invoices && invoices.length > 0) {
          const firstInvoice = invoices[0];
          
          // Create payment record for the first invoice
          await this.paymentService.create({
            tenantId: subscriptionData.tenantId,
            type: PaymentType.SUBSCRIPTION,
            amount: subscriptionData.amount,
            paymentMethod: subscriptionData.paymentMethod,
            dueDate: new Date(firstInvoice.dueDate),
            customerId: subscriptionData.customerId,
            customerName: subscriptionData.customerName,
            customerEmail: subscriptionData.customerEmail,
            customerDocument: subscriptionData.customerDocument,
            customerPhone: subscriptionData.customerPhone,
            billingAddress: subscriptionData.billingAddress,
            subscriptionId: subscription.id,
            externalReference: `subscription-${subscription.id}-payment-1`,
            description: `Payment 1 for subscription to ${subscriptionData.planName}`,
            gatewayPaymentId: firstInvoice.id,
            gatewayUrl: firstInvoice.invoiceUrl,
            metadata: {
              gateway: 'asaas',
              gatewayResponse: firstInvoice
            }
          });
          
          // Update subscription with payment info
          await this.updatePaymentInfo(subscription.id, subscription.tenantId, {
            lastPaymentDate: startDate,
            nextBillingDate: new Date(firstInvoice.dueDate),
            totalPayments: 1
          });
        }
      }
      
      return subscription;
    } catch (error) {
      throw new BadRequestException(`Failed to create subscription: ${error.message}`);
    }
  }

  async convertTrialToActive(id: string, tenantId: string, paymentMethod: string): Promise<Subscription> {
    const subscription = await this.findById(id, tenantId);
    
    if (subscription.status !== SubscriptionStatus.TRIAL) {
      throw new BadRequestException('Only trial subscriptions can be converted to active');
    }
    
    try {
      // Create subscription in gateway
      const gatewaySubscription = await this.asaasService.createSubscription({
        customer: subscription.customerId,
        billingType: this.mapPaymentMethodToAsaas(paymentMethod),
        value: subscription.amount,
        nextDueDate: new Date(), // Start billing immediately
        cycle: this.mapCycleToAsaas(subscription.cycle),
        description: `Subscription to ${subscription.planName}`,
      });
      
      // Update subscription in our system
      const updatedSubscription = await this.update(id, tenantId, {
        status: SubscriptionStatus.ACTIVE,
        paymentMethod,
        gatewaySubscriptionId: gatewaySubscription.id,
        metadata: {
          ...subscription.metadata,
          gateway: 'asaas',
          gatewayResponse: gatewaySubscription
        }
      });
      
      // Get the first invoice from the subscription
      const invoices = await this.asaasService.getSubscriptionInvoices(gatewaySubscription.id);
      
      if (invoices && invoices.length > 0) {
        const firstInvoice = invoices[0];
        
        // Create payment record for the first invoice
        await this.paymentService.create({
          tenantId: subscription.tenantId,
          type: PaymentType.SUBSCRIPTION,
          amount: subscription.amount,
          paymentMethod,
          dueDate: new Date(firstInvoice.dueDate),
          customerId: subscription.customerId,
          customerName: subscription.customerName,
          customerEmail: subscription.customerEmail,
          customerDocument: subscription.customerDocument,
          customerPhone: subscription.customerPhone,
          billingAddress: subscription.billingAddress,
          subscriptionId: subscription.id,
          externalReference: `subscription-${subscription.id}-payment-1`,
          description: `Payment 1 for subscription to ${subscription.planName}`,
          gatewayPaymentId: firstInvoice.id,
          gatewayUrl: firstInvoice.invoiceUrl,
          metadata: {
            gateway: 'asaas',
            gatewayResponse: firstInvoice
          }
        });
        
        // Update subscription with payment info
        await this.updatePaymentInfo(subscription.id, subscription.tenantId, {
          lastPaymentDate: new Date(),
          nextBillingDate: new Date(firstInvoice.dueDate),
          totalPayments: 1
        });
      }
      
      return updatedSubscription;
    } catch (error) {
      throw new BadRequestException(`Failed to convert trial to active subscription: ${error.message}`);
    }
  }

  async changePlan(
    id: string,
    tenantId: string,
    planData: {
      planId: string;
      planName: string;
      amount: number;
      cycle?: SubscriptionCycle;
    }
  ): Promise<Subscription> {
    const subscription = await this.findById(id, tenantId);
    
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Only active subscriptions can change plans');
    }
    
    try {
      // Update subscription in gateway
      if (subscription.gatewaySubscriptionId) {
        await this.asaasService.updateSubscription(subscription.gatewaySubscriptionId, {
          value: planData.amount,
          cycle: planData.cycle ? this.mapCycleToAsaas(planData.cycle) : undefined,
          description: `Subscription to ${planData.planName}`,
        });
      }
      
      // Update subscription in our system
      return this.update(id, tenantId, {
        planId: planData.planId,
        planName: planData.planName,
        amount: planData.amount,
        cycle: planData.cycle || subscription.cycle,
      });
    } catch (error) {
      throw new BadRequestException(`Failed to change subscription plan: ${error.message}`);
    }
  }

  async getSubscriptionStats(): Promise<any> {
    return this.subscriptionRepository.getSubscriptionStats();
  }

  async processRenewals(): Promise<void> {
    // Get subscriptions due for renewal
    const dueSubscriptions = await this.findDueForRenewal(0); // Get subscriptions due today
    
    for (const subscription of dueSubscriptions) {
      try {
        // For subscriptions managed by the gateway, we don't need to do anything
        // as the gateway will handle the renewal automatically
        
        // Just update our records with the new payment info
        const nextBillingDate = new Date(subscription.nextBillingDate);
        
        // Calculate next billing date based on cycle
        switch (subscription.cycle) {
          case SubscriptionCycle.MONTHLY:
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            break;
          case SubscriptionCycle.QUARTERLY:
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
            break;
          case SubscriptionCycle.SEMIANNUAL:
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 6);
            break;
          case SubscriptionCycle.ANNUAL:
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
            break;
        }
        
        await this.updatePaymentInfo(subscription.id, subscription.tenantId, {
          lastPaymentDate: new Date(),
          nextBillingDate,
          totalPayments: subscription.totalPayments + 1
        });
      } catch (error) {
        console.error(`Failed to process renewal for subscription ${subscription.id}:`, error);
        // Continue with next subscription
      }
    }
  }

  async processTrialEndings(): Promise<void> {
    // Get trials ending today
    const endingTrials = await this.findTrialsEnding(0);
    
    for (const trial of endingTrials) {
      try {
        // Update trial status to expired
        await this.updateStatus(trial.id, trial.tenantId, SubscriptionStatus.EXPIRED);
      } catch (error) {
        console.error(`Failed to process trial ending for subscription ${trial.id}:`, error);
        // Continue with next trial
      }
    }
  }

  private mapPaymentMethodToAsaas(method: string): string {
    const mapping = {
      'credit_card': 'CREDIT_CARD',
      'boleto': 'BOLETO',
      'pix': 'PIX',
      'bank_transfer': 'BANK_TRANSFER',
      'cash': 'UNDEFINED'
    };
    
    return mapping[method.toLowerCase()] || 'UNDEFINED';
  }

  private mapCycleToAsaas(cycle: SubscriptionCycle): string {
    const mapping = {
      [SubscriptionCycle.MONTHLY]: 'MONTHLY',
      [SubscriptionCycle.QUARTERLY]: 'QUARTERLY',
      [SubscriptionCycle.SEMIANNUAL]: 'SEMIANNUAL',
      [SubscriptionCycle.ANNUAL]: 'YEARLY'
    };
    
    return mapping[cycle] || 'MONTHLY';
  }
}
