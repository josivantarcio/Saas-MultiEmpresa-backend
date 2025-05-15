import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { ShippingMethodRepository } from '../repositories/shipping-method.repository';
import { PaymentMethodRepository } from '../repositories/payment-method.repository';
import { Cart } from '../entities/cart.entity';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';
import { PaymentMethodType } from '../entities/payment-method.entity';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CheckoutService {
  private asaasApiUrl: string;
  private asaasApiKey: string;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private shippingMethodRepository: ShippingMethodRepository,
    private paymentMethodRepository: PaymentMethodRepository,
    private configService: ConfigService,
  ) {
    this.asaasApiUrl = this.configService.get<string>('ASAAS_API_URL');
    this.asaasApiKey = this.configService.get<string>('ASAAS_API_KEY');
  }

  async getShippingOptions(
    cartId: string,
    tenantId: string,
    location: {
      country: string;
      state?: string;
      city?: string;
      postalCode?: string;
    }
  ): Promise<any[]> {
    // Get cart to calculate shipping options
    const cart = await this.cartService.findById(cartId, tenantId);
    
    // Calculate total weight of physical items
    const totalWeight = cart.items
      .filter(item => item.requiresShipping)
      .reduce((sum, item) => sum + (item.attributes.weight || 0) * item.quantity, 0);
    
    // Get shipping options
    return this.shippingMethodRepository.calculateShippingOptions(tenantId, {
      subtotal: cart.subtotal,
      weight: totalWeight,
      location,
    });
  }

  async getPaymentMethods(tenantId: string): Promise<any[]> {
    const paymentMethods = await this.paymentMethodRepository.findAll(tenantId, { isActive: true });
    
    // Format for client
    return paymentMethods.map(method => ({
      id: method.id,
      name: method.name,
      code: method.code,
      description: method.description,
      type: method.type,
      iconUrl: method.iconUrl,
      settings: {
        installmentOptions: method.settings.installmentOptions,
        customFields: method.settings.customFields,
        allowsPickup: method.settings.allowsPickup,
        pickupLocations: method.settings.pickupLocations,
      },
    }));
  }

  async applyShippingMethod(
    cartId: string,
    tenantId: string,
    shippingMethodId: string
  ): Promise<Cart> {
    // Get shipping method
    const shippingMethod = await this.shippingMethodRepository.findById(shippingMethodId, tenantId);
    if (!shippingMethod) {
      throw new NotFoundException(`Shipping method with ID ${shippingMethodId} not found`);
    }
    
    // Get cart
    const cart = await this.cartService.findById(cartId, tenantId);
    
    // Calculate total weight of physical items
    const totalWeight = cart.items
      .filter(item => item.requiresShipping)
      .reduce((sum, item) => sum + (item.attributes.weight || 0) * item.quantity, 0);
    
    // Calculate shipping price
    const shippingAmount = shippingMethod.calculatePrice(
      cart.subtotal,
      totalWeight,
      cart.shippingAddress || { country: 'BR' }
    );
    
    if (shippingAmount === null) {
      throw new BadRequestException('This shipping method is not applicable to your cart');
    }
    
    // Apply shipping to cart
    return this.cartService.applyShipping(cartId, tenantId, shippingMethodId, shippingAmount);
  }

  async applyCoupon(
    cartId: string,
    tenantId: string,
    couponCode: string
  ): Promise<Cart> {
    // Get cart
    const cart = await this.cartService.findById(cartId, tenantId);
    
    // TODO: Implement coupon validation and calculation
    // This would normally come from a coupon service
    const discountAmount = 0;
    
    // Apply coupon to cart
    return this.cartService.applyCoupon(cartId, tenantId, couponCode, discountAmount);
  }

  async processCheckout(
    cartId: string,
    tenantId: string,
    checkoutData: {
      customerEmail: string;
      customerName: string;
      customerPhone?: string;
      paymentMethodId: string;
      paymentData?: any;
      notes?: string;
      isGuestCheckout?: boolean;
    }
  ): Promise<{ order: Order; paymentInfo?: any }> {
    // Get cart
    const cart = await this.cartService.findById(cartId, tenantId);
    
    // Validate cart
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout with an empty cart');
    }
    
    // Get payment method
    const paymentMethod = await this.paymentMethodRepository.findById(checkoutData.paymentMethodId, tenantId);
    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${checkoutData.paymentMethodId} not found`);
    }
    
    // Create order
    const order = await this.orderService.createFromCart(cartId, tenantId, {
      customerEmail: checkoutData.customerEmail,
      customerName: checkoutData.customerName,
      customerPhone: checkoutData.customerPhone,
      paymentMethodId: paymentMethod.id,
      paymentMethodName: paymentMethod.name,
      notes: checkoutData.notes,
      isGuestCheckout: checkoutData.isGuestCheckout,
    });
    
    // Process payment if using Asaas
    let paymentInfo = null;
    if (paymentMethod.isGatewayMethod && paymentMethod.gatewayId === 'asaas') {
      paymentInfo = await this.processAsaasPayment(order, paymentMethod, checkoutData.paymentData);
      
      // Update order with payment transaction ID
      if (paymentInfo && paymentInfo.id) {
        await this.orderService.updatePaymentStatus(
          order.id,
          tenantId,
          PaymentStatus.PENDING,
          paymentInfo.id
        );
        
        // Store Asaas payment ID
        await this.orderService.updateOrderItem(order.id, order.items[0].id, tenantId, {
          metadata: { asaasPaymentId: paymentInfo.id }
        });
      }
    }
    
    return { order, paymentInfo };
  }

  private async processAsaasPayment(
    order: Order,
    paymentMethod: any,
    paymentData: any
  ): Promise<any> {
    try {
      // Check if Asaas is configured
      if (!this.asaasApiUrl || !this.asaasApiKey) {
        throw new Error('Asaas payment gateway is not configured');
      }
      
      // Format billing address for Asaas
      const billingAddress = order.billingAddress;
      
      // Determine payment type based on payment method
      let billingType = 'UNDEFINED';
      switch (paymentMethod.type) {
        case PaymentMethodType.CREDIT_CARD:
          billingType = 'CREDIT_CARD';
          break;
        case PaymentMethodType.BOLETO:
          billingType = 'BOLETO';
          break;
        case PaymentMethodType.PIX:
          billingType = 'PIX';
          break;
        default:
          throw new Error(`Unsupported payment method type: ${paymentMethod.type}`);
      }
      
      // Create payment in Asaas
      const paymentRequest = {
        customer: paymentData.customerId || 'cus_000005113026', // This would normally come from a customer service
        billingType,
        value: order.total,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        description: `Pedido #${order.orderNumber}`,
        externalReference: order.id,
        postalService: false,
      };
      
      // Add credit card info if using credit card
      if (billingType === 'CREDIT_CARD' && paymentData.creditCard) {
        paymentRequest['creditCard'] = paymentData.creditCard;
        paymentRequest['creditCardHolderInfo'] = {
          name: paymentData.creditCard.holderName,
          email: order.customerEmail,
          cpfCnpj: paymentData.creditCard.holderDocument,
          postalCode: billingAddress.postalCode,
          addressNumber: paymentData.addressNumber || '0',
          addressComplement: billingAddress.address2,
          phone: order.customerPhone || '0',
        };
      }
      
      // Make API request to Asaas
      const response = await axios.post(
        `${this.asaasApiUrl}/payments`,
        paymentRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'access_token': this.asaasApiKey,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error processing Asaas payment:', error);
      throw new BadRequestException('Failed to process payment. Please try again.');
    }
  }

  async handleAsaasWebhook(webhookData: any): Promise<any> {
    try {
      const { event, payment } = webhookData;
      
      // Find order by external reference (order ID)
      const orders = await this.orderService.findAll(null, {
        search: payment.externalReference,
      });
      
      if (!orders || orders.total === 0) {
        throw new NotFoundException(`Order with ID ${payment.externalReference} not found`);
      }
      
      const order = orders.items[0];
      
      // Update order based on payment status
      switch (event) {
        case 'PAYMENT_CONFIRMED':
          await this.orderService.updatePaymentStatus(
            order.id,
            order.tenantId,
            PaymentStatus.PAID,
            payment.id
          );
          break;
          
        case 'PAYMENT_RECEIVED':
          await this.orderService.updatePaymentStatus(
            order.id,
            order.tenantId,
            PaymentStatus.PAID,
            payment.id
          );
          break;
          
        case 'PAYMENT_OVERDUE':
          await this.orderService.updateStatus(
            order.id,
            order.tenantId,
            OrderStatus.PAYMENT_FAILED
          );
          break;
          
        case 'PAYMENT_REFUNDED':
          await this.orderService.refundOrder(
            order.id,
            order.tenantId,
            payment.value
          );
          break;
      }
      
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Error processing Asaas webhook:', error);
      throw new BadRequestException('Failed to process webhook');
    }
  }
}
