import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { TransactionService } from './transaction.service';
import { Payment, PaymentStatus, PaymentType } from '../entities/payment.entity';
import { TransactionType } from '../entities/transaction.entity';
import { AsaasService } from './asaas.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly transactionService: TransactionService,
    private readonly asaasService: AsaasService,
  ) {}

  async findById(id: string, tenantId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id, tenantId);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByGatewayId(gatewayPaymentId: string, tenantId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByGatewayId(gatewayPaymentId, tenantId);
    if (!payment) {
      throw new NotFoundException(`Payment with gateway ID ${gatewayPaymentId} not found`);
    }
    return payment;
  }

  async findByOrderId(orderId: string, tenantId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByOrderId(orderId, tenantId);
    if (!payment) {
      throw new NotFoundException(`Payment for order ID ${orderId} not found`);
    }
    return payment;
  }

  async findByExternalReference(externalReference: string, tenantId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByExternalReference(externalReference, tenantId);
    if (!payment) {
      throw new NotFoundException(`Payment with reference ${externalReference} not found`);
    }
    return payment;
  }

  async findAll(tenantId: string, options: {
    skip?: number;
    take?: number;
    status?: PaymentStatus;
    type?: PaymentType;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  } = {}): Promise<[Payment[], number]> {
    return this.paymentRepository.findAll(tenantId, options);
  }

  async create(paymentData: Partial<Payment>): Promise<Payment> {
    // Set default status if not provided
    if (!paymentData.status) {
      paymentData.status = PaymentStatus.PENDING;
    }
    
    const payment = await this.paymentRepository.create(paymentData);
    
    // Create initial transaction record
    await this.transactionService.createPaymentTransaction(
      payment.id,
      payment.tenantId,
      Number(payment.amount),
      `Payment for ${payment.type === PaymentType.ORDER ? 'order' : 'subscription'} ${payment.externalReference}`,
      payment.gatewayPaymentId,
      { paymentMethod: payment.paymentMethod }
    );
    
    return payment;
  }

  async update(id: string, tenantId: string, paymentData: Partial<Payment>): Promise<Payment> {
    await this.findById(id, tenantId); // Verify payment exists
    return this.paymentRepository.update(id, tenantId, paymentData);
  }

  async updateStatus(id: string, tenantId: string, status: PaymentStatus): Promise<Payment> {
    const payment = await this.findById(id, tenantId); // Verify payment exists
    
    // If payment is already in this status, return it without changes
    if (payment.status === status) {
      return payment;
    }
    
    // Update payment status
    const updatedPayment = await this.paymentRepository.updateStatus(id, tenantId, status);
    
    // Update transaction status based on payment status
    if (payment.transactions && payment.transactions.length > 0) {
      const mainTransaction = payment.transactions.find(t => t.type === TransactionType.PAYMENT);
      if (mainTransaction) {
        let transactionStatus;
        
        switch (status) {
          case PaymentStatus.CONFIRMED:
          case PaymentStatus.RECEIVED:
            transactionStatus = 'COMPLETED';
            break;
          case PaymentStatus.REFUNDED:
            transactionStatus = 'REFUNDED';
            break;
          case PaymentStatus.CANCELLED:
            transactionStatus = 'CANCELLED';
            break;
          default:
            transactionStatus = 'PENDING';
        }
        
        await this.transactionService.updateStatus(mainTransaction.id, tenantId, transactionStatus);
      }
    }
    
    return updatedPayment;
  }

  async processPayment(paymentData: {
    tenantId: string;
    type: PaymentType;
    amount: number;
    paymentMethod: string;
    dueDate?: Date;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerDocument?: string;
    customerPhone?: string;
    billingAddress?: any;
    orderId?: string;
    subscriptionId?: string;
    externalReference: string;
    description: string;
    installments?: number;
    metadata?: any;
  }): Promise<Payment> {
    try {
      // Create payment in gateway
      const gatewayPayment = await this.asaasService.createPayment({
        customer: paymentData.customerId,
        billingType: this.mapPaymentMethodToAsaas(paymentData.paymentMethod),
        value: paymentData.amount,
        dueDate: paymentData.dueDate || new Date(),
        description: paymentData.description,
        externalReference: paymentData.externalReference,
        installmentCount: paymentData.installments || 1,
        ...paymentData.metadata
      });
      
      // Create payment record in our system
      const payment = await this.create({
        tenantId: paymentData.tenantId,
        type: paymentData.type,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        dueDate: paymentData.dueDate || new Date(),
        customerId: paymentData.customerId,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        customerDocument: paymentData.customerDocument,
        customerPhone: paymentData.customerPhone,
        billingAddress: paymentData.billingAddress,
        orderId: paymentData.orderId,
        subscriptionId: paymentData.subscriptionId,
        externalReference: paymentData.externalReference,
        description: paymentData.description,
        installments: paymentData.installments || 1,
        gatewayPaymentId: gatewayPayment.id,
        gatewayUrl: gatewayPayment.invoiceUrl,
        status: this.mapAsaasStatusToPaymentStatus(gatewayPayment.status),
        metadata: {
          ...paymentData.metadata,
          gateway: 'asaas',
          gatewayResponse: gatewayPayment
        }
      });
      
      return payment;
    } catch (error) {
      throw new BadRequestException(`Failed to process payment: ${error.message}`);
    }
  }

  async refundPayment(id: string, tenantId: string, reason: string, amount?: number): Promise<Payment> {
    const payment = await this.findById(id, tenantId);
    
    if (payment.status !== PaymentStatus.CONFIRMED && payment.status !== PaymentStatus.RECEIVED) {
      throw new BadRequestException('Only confirmed or received payments can be refunded');
    }
    
    try {
      // Process refund in gateway
      const refundAmount = amount || Number(payment.amount);
      const refundResponse = await this.asaasService.refundPayment(payment.gatewayPaymentId, {
        value: refundAmount,
        description: reason
      });
      
      // Create refund transaction
      await this.transactionService.createRefundTransaction(
        payment.id,
        payment.tenantId,
        refundAmount,
        `Refund for payment ${payment.id}: ${reason}`,
        refundResponse.id,
        { refundReason: reason }
      );
      
      // Update payment status
      return this.updateStatus(id, tenantId, PaymentStatus.REFUNDED);
    } catch (error) {
      throw new BadRequestException(`Failed to refund payment: ${error.message}`);
    }
  }

  async cancelPayment(id: string, tenantId: string, reason: string): Promise<Payment> {
    const payment = await this.findById(id, tenantId);
    
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be cancelled');
    }
    
    try {
      // Cancel payment in gateway
      await this.asaasService.cancelPayment(payment.gatewayPaymentId);
      
      // Update payment status
      const updatedPayment = await this.updateStatus(id, tenantId, PaymentStatus.CANCELLED);
      
      // Update cancel reason
      return this.update(id, tenantId, { cancelReason: reason });
    } catch (error) {
      throw new BadRequestException(`Failed to cancel payment: ${error.message}`);
    }
  }

  async getPaymentLink(id: string, tenantId: string): Promise<string> {
    const payment = await this.findById(id, tenantId);
    return payment.gatewayUrl;
  }

  async getPaymentStats(tenantId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    return this.paymentRepository.getPaymentStats(tenantId, period);
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

  private mapAsaasStatusToPaymentStatus(status: string): PaymentStatus {
    const mapping = {
      'PENDING': PaymentStatus.PENDING,
      'CONFIRMED': PaymentStatus.CONFIRMED,
      'RECEIVED': PaymentStatus.RECEIVED,
      'OVERDUE': PaymentStatus.OVERDUE,
      'REFUNDED': PaymentStatus.REFUNDED,
      'CANCELLED': PaymentStatus.CANCELLED
    };
    
    return mapping[status] || PaymentStatus.PENDING;
  }
}
