import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../repositories/cart.repository';
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '../entities/order.entity';
import { OrderItem, OrderItemStatus } from '../entities/order-item.entity';

@Injectable()
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private cartRepository: CartRepository,
  ) {}

  async findById(id: string, tenantId: string): Promise<Order> {
    const order = await this.orderRepository.findById(id, tenantId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByOrderNumber(orderNumber: string, tenantId: string): Promise<Order> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber, tenantId);
    if (!order) {
      throw new NotFoundException(`Order with number ${orderNumber} not found`);
    }
    return order;
  }

  async findByUserId(
    userId: string,
    tenantId: string,
    options: {
      skip?: number;
      take?: number;
      status?: OrderStatus;
    } = {}
  ): Promise<{ items: Order[]; total: number }> {
    const [orders, total] = await this.orderRepository.findByUserId(userId, tenantId, options);
    return { items: orders, total };
  }

  async findAll(
    tenantId: string,
    options: {
      skip?: number;
      take?: number;
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      fulfillmentStatus?: FulfillmentStatus;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    } = {}
  ): Promise<{ items: Order[]; total: number }> {
    const [orders, total] = await this.orderRepository.findAll(tenantId, options);
    return { items: orders, total };
  }

  async createFromCart(
    cartId: string,
    tenantId: string,
    orderData: {
      userId?: string;
      customerEmail: string;
      customerName: string;
      customerPhone?: string;
      paymentMethodId: string;
      paymentMethodName: string;
      notes?: string;
      isGuestCheckout?: boolean;
    }
  ): Promise<Order> {
    // Find cart
    const cart = await this.cartRepository.findById(cartId, tenantId);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }
    
    // Check if cart has items
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot create order from an empty cart');
    }
    
    // Check if cart has shipping and payment info if needed
    const hasPhysicalItems = cart.items.some(item => item.requiresShipping);
    if (hasPhysicalItems && !cart.shippingAddress) {
      throw new BadRequestException('Shipping address is required for physical items');
    }
    
    if (!cart.billingAddress) {
      throw new BadRequestException('Billing address is required');
    }
    
    // Create order
    const order = await this.orderRepository.create({
      tenantId,
      userId: orderData.userId || cart.userId,
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      cartId,
      subtotal: cart.subtotal,
      taxAmount: cart.taxAmount,
      discountAmount: cart.discountAmount,
      shippingAmount: cart.shippingAmount,
      total: cart.total,
      couponCode: cart.couponCode,
      shippingMethodId: cart.shippingMethodId,
      shippingMethodName: cart.shippingMethodId ? 'Shipping Method' : null, // This would normally come from a shipping method service
      paymentMethodId: orderData.paymentMethodId,
      paymentMethodName: orderData.paymentMethodName,
      shippingAddress: cart.shippingAddress,
      billingAddress: cart.billingAddress,
      notes: orderData.notes,
      isGuestCheckout: orderData.isGuestCheckout || false,
      hasPhysicalItems,
      hasDigitalItems: cart.items.some(item => item.isDigital),
      hasServices: cart.items.some(item => item.isService),
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
    });
    
    // Create order items from cart items
    for (const cartItem of cart.items) {
      await this.orderRepository.addItem(order.id, {
        productId: cartItem.productId,
        productVariantId: cartItem.productVariantId,
        name: cartItem.name,
        sku: cartItem.sku,
        imageUrl: cartItem.imageUrl,
        price: cartItem.price,
        discountAmount: cartItem.discountAmount,
        quantity: cartItem.quantity,
        attributes: cartItem.attributes,
        requiresShipping: cartItem.requiresShipping,
        isDigital: cartItem.isDigital,
        isService: cartItem.isService,
        appointmentDate: cartItem.appointmentDate,
        appointmentDuration: cartItem.appointmentDuration,
        appointmentStaffId: cartItem.appointmentStaffId,
        status: OrderItemStatus.PENDING,
      });
    }
    
    // Mark cart as abandoned to prevent further modifications
    await this.cartRepository.markAsAbandoned(cartId, tenantId);
    
    return this.findById(order.id, tenantId);
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: OrderStatus
  ): Promise<Order> {
    return this.orderRepository.updateStatus(id, tenantId, status);
  }

  async updatePaymentStatus(
    id: string,
    tenantId: string,
    paymentStatus: PaymentStatus,
    transactionId?: string
  ): Promise<Order> {
    return this.orderRepository.updatePaymentStatus(id, tenantId, paymentStatus, transactionId);
  }

  async updateFulfillmentStatus(
    id: string,
    tenantId: string,
    fulfillmentStatus: FulfillmentStatus
  ): Promise<Order> {
    return this.orderRepository.updateFulfillmentStatus(id, tenantId, fulfillmentStatus);
  }

  async updateOrderItem(
    orderId: string,
    itemId: string,
    tenantId: string,
    itemData: Partial<OrderItem>
  ): Promise<OrderItem> {
    // Validate order
    await this.findById(orderId, tenantId);
    
    return this.orderRepository.updateItem(itemId, orderId, itemData);
  }

  async updateOrderItemStatus(
    orderId: string,
    itemId: string,
    tenantId: string,
    status: OrderItemStatus
  ): Promise<OrderItem> {
    // Validate order
    await this.findById(orderId, tenantId);
    
    return this.orderRepository.updateItemStatus(itemId, orderId, status);
  }

  async addTrackingInfo(
    id: string,
    tenantId: string,
    trackingInfo: {
      trackingNumber: string;
      trackingUrl?: string;
      estimatedDeliveryDate?: Date;
    }
  ): Promise<Order> {
    // Validate order
    await this.findById(id, tenantId);
    
    // Update order with tracking info
    return this.orderRepository.update(id, tenantId, {
      trackingNumber: trackingInfo.trackingNumber,
      trackingUrl: trackingInfo.trackingUrl,
      estimatedDeliveryDate: trackingInfo.estimatedDeliveryDate,
      fulfillmentStatus: FulfillmentStatus.PARTIALLY_FULFILLED,
    });
  }

  async addAdminNotes(
    id: string,
    tenantId: string,
    adminNotes: string
  ): Promise<Order> {
    // Validate order
    await this.findById(id, tenantId);
    
    // Update order with admin notes
    return this.orderRepository.update(id, tenantId, { adminNotes });
  }

  async cancelOrder(
    id: string,
    tenantId: string,
    cancelReason: string
  ): Promise<Order> {
    // Validate order
    const order = await this.findById(id, tenantId);
    
    // Check if order can be cancelled
    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(`Order with status ${order.status} cannot be cancelled`);
    }
    
    // Update order status and add cancel reason
    return this.orderRepository.update(id, tenantId, {
      status: OrderStatus.CANCELLED,
      cancelReason,
      cancelledAt: new Date(),
    });
  }

  async refundOrder(
    id: string,
    tenantId: string,
    refundAmount: number
  ): Promise<Order> {
    // Validate order
    const order = await this.findById(id, tenantId);
    
    // Check if order can be refunded
    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Only paid orders can be refunded');
    }
    
    // Determine refund status
    const isFullRefund = refundAmount >= order.total;
    const refundStatus = isFullRefund ? OrderStatus.REFUNDED : OrderStatus.PARTIALLY_REFUNDED;
    const paymentStatus = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
    
    // Update order with refund info
    return this.orderRepository.update(id, tenantId, {
      status: refundStatus,
      paymentStatus,
      refundedAmount: refundAmount,
      refundedAt: new Date(),
    });
  }

  async getOrderStats(
    tenantId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<any> {
    return this.orderRepository.getOrderStats(tenantId, period);
  }
}
