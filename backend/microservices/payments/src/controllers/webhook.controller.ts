import { Controller, Post, Body, Headers, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AsaasService } from '../services/asaas.service';
import { PaymentService } from '../services/payment.service';
import { SubscriptionService } from '../services/subscription.service';
import { PaymentStatus } from '../entities/payment.entity';
import { SubscriptionStatus } from '../entities/subscription.entity';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly asaasService: AsaasService,
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post('asaas')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Asaas webhook notifications' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully.' })
  async handleAsaasWebhook(
    @Headers('asaas-access-token') token: string,
    @Body() webhookData: any,
  ): Promise<any> {
    this.logger.log(`Received Asaas webhook: ${webhookData.event}`);
    
    try {
      // Process the webhook with Asaas service
      const result = this.asaasService.processWebhook(webhookData.event, webhookData.payment || webhookData.subscription);
      
      // Handle different webhook events
      await this.handleWebhookEvent(webhookData.event, result.data);
      
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  private async handleWebhookEvent(event: string, data: any): Promise<void> {
    // Handle payment-related events
    if (event.startsWith('PAYMENT_')) {
      await this.handlePaymentEvent(event, data);
    }
    
    // Handle subscription-related events
    if (event.startsWith('SUBSCRIPTION_')) {
      await this.handleSubscriptionEvent(event, data);
    }
  }

  private async handlePaymentEvent(event: string, data: any): Promise<void> {
    try {
      // Find the payment in our system
      const payment = await this.paymentService.findByGatewayId(data.id, data.customer);
      
      if (!payment) {
        this.logger.warn(`Payment with gateway ID ${data.id} not found in our system`);
        return;
      }
      
      // Update payment status based on event
      switch (event) {
        case 'PAYMENT_CONFIRMED':
          await this.paymentService.updateStatus(payment.id, payment.tenantId, PaymentStatus.CONFIRMED);
          break;
        case 'PAYMENT_RECEIVED':
          await this.paymentService.updateStatus(payment.id, payment.tenantId, PaymentStatus.RECEIVED);
          break;
        case 'PAYMENT_OVERDUE':
          await this.paymentService.updateStatus(payment.id, payment.tenantId, PaymentStatus.OVERDUE);
          break;
        case 'PAYMENT_REFUNDED':
          await this.paymentService.updateStatus(payment.id, payment.tenantId, PaymentStatus.REFUNDED);
          break;
        case 'PAYMENT_DELETED':
        case 'PAYMENT_CANCELLED':
          await this.paymentService.updateStatus(payment.id, payment.tenantId, PaymentStatus.CANCELLED);
          break;
      }
    } catch (error) {
      this.logger.error(`Error handling payment event: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleSubscriptionEvent(event: string, data: any): Promise<void> {
    try {
      // For subscription payment events, handle the payment
      if (event.startsWith('SUBSCRIPTION_PAYMENT_')) {
        await this.handleSubscriptionPaymentEvent(event, data);
        return;
      }
      
      // Find the subscription in our system
      const subscription = await this.subscriptionService.findByGatewayId(data.id, data.customer);
      
      if (!subscription) {
        this.logger.warn(`Subscription with gateway ID ${data.id} not found in our system`);
        return;
      }
      
      // Update subscription status based on event
      switch (event) {
        case 'SUBSCRIPTION_CREATED':
          // No need to update status as it's already set when we create the subscription
          break;
        case 'SUBSCRIPTION_UPDATED':
          // Update subscription details if needed
          await this.subscriptionService.update(subscription.id, subscription.tenantId, {
            amount: data.value,
            nextBillingDate: new Date(data.nextDueDate),
            cycle: this.mapAsaasCycleToSubscriptionCycle(data.cycle),
          });
          break;
        case 'SUBSCRIPTION_DELETED':
        case 'SUBSCRIPTION_CANCELLED':
          await this.subscriptionService.updateStatus(subscription.id, subscription.tenantId, SubscriptionStatus.CANCELLED);
          break;
        case 'SUBSCRIPTION_RENEWED':
          // Update next billing date
          await this.subscriptionService.updatePaymentInfo(
            subscription.id,
            subscription.tenantId,
            {
              lastPaymentDate: new Date(),
              nextBillingDate: new Date(data.nextDueDate),
              totalPayments: subscription.totalPayments + 1,
            }
          );
          break;
      }
    } catch (error) {
      this.logger.error(`Error handling subscription event: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleSubscriptionPaymentEvent(event: string, data: any): Promise<void> {
    try {
      // Find the payment in our system
      const payment = await this.paymentService.findByGatewayId(data.id, data.customer);
      
      if (!payment) {
        this.logger.warn(`Subscription payment with gateway ID ${data.id} not found in our system`);
        return;
      }
      
      // Update payment status based on event
      switch (event) {
        case 'SUBSCRIPTION_PAYMENT_CONFIRMED':
          await this.paymentService.updateStatus(payment.id, payment.tenantId, PaymentStatus.CONFIRMED);
          break;
        case 'SUBSCRIPTION_PAYMENT_RECEIVED':
          await this.paymentService.updateStatus(payment.id, payment.tenantId, PaymentStatus.RECEIVED);
          break;
        case 'SUBSCRIPTION_PAYMENT_OVERDUE':
          await this.paymentService.updateStatus(payment.id, payment.tenantId, PaymentStatus.OVERDUE);
          break;
        case 'SUBSCRIPTION_PAYMENT_REFUNDED':
          await this.paymentService.updateStatus(payment.id, payment.tenantId, PaymentStatus.REFUNDED);
          break;
        case 'SUBSCRIPTION_PAYMENT_DELETED':
        case 'SUBSCRIPTION_PAYMENT_CANCELLED':
          await this.paymentService.updateStatus(payment.id, payment.tenantId, PaymentStatus.CANCELLED);
          break;
      }
    } catch (error) {
      this.logger.error(`Error handling subscription payment event: ${error.message}`, error.stack);
      throw error;
    }
  }

  private mapAsaasCycleToSubscriptionCycle(cycle: string): string {
    const mapping = {
      'MONTHLY': 'MONTHLY',
      'QUARTERLY': 'QUARTERLY',
      'SEMIANNUAL': 'SEMIANNUAL',
      'YEARLY': 'ANNUAL'
    };
    
    return mapping[cycle] || 'MONTHLY';
  }
}
