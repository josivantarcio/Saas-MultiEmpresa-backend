import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '../entities/order.entity';
import { OrderItem, OrderItemStatus } from '../entities/order-item.entity';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Order> {
    return this.orderRepository.findOne({ 
      where: { id, tenantId },
      relations: ['items'],
    });
  }

  async findByOrderNumber(orderNumber: string, tenantId: string): Promise<Order> {
    return this.orderRepository.findOne({ 
      where: { orderNumber, tenantId },
      relations: ['items'],
    });
  }

  async findByUserId(userId: string, tenantId: string, options: {
    skip?: number;
    take?: number;
    status?: OrderStatus;
  } = {}): Promise<[Order[], number]> {
    const { skip = 0, take = 10, status } = options;
    
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.tenantId = :tenantId', { tenantId })
      .andWhere('order.userId = :userId', { userId });
    
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }
    
    queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(take);
    
    return queryBuilder.getManyAndCount();
  }

  async findAll(tenantId: string, options: {
    skip?: number;
    take?: number;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fulfillmentStatus?: FulfillmentStatus;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  } = {}): Promise<[Order[], number]> {
    const { 
      skip = 0, 
      take = 50, 
      status, 
      paymentStatus, 
      fulfillmentStatus,
      startDate,
      endDate,
      search
    } = options;
    
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.tenantId = :tenantId', { tenantId });
    
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }
    
    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
    }
    
    if (fulfillmentStatus) {
      queryBuilder.andWhere('order.fulfillmentStatus = :fulfillmentStatus', { fulfillmentStatus });
    }
    
    if (startDate && endDate) {
      queryBuilder.andWhere('order.createdAt BETWEEN :startDate AND :endDate', { 
        startDate, 
        endDate 
      });
    } else if (startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(order.orderNumber LIKE :search OR order.customerName LIKE :search OR order.customerEmail LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(take);
    
    return queryBuilder.getManyAndCount();
  }

  async generateOrderNumber(tenantId: string): Promise<string> {
    // Get current date
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Get count of orders for today
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const todayOrdersCount = await this.orderRepository.count({
      where: {
        tenantId,
        createdAt: Between(startOfDay, endOfDay),
      },
    });
    
    // Generate sequential number
    const sequentialNumber = (todayOrdersCount + 1).toString().padStart(4, '0');
    
    // Combine to create order number: TENANT_PREFIX + YYMMDD + SEQUENTIAL
    // For simplicity, using first 3 chars of tenant ID as prefix
    const tenantPrefix = tenantId.substring(0, 3).toUpperCase();
    
    return `${tenantPrefix}${year}${month}${day}${sequentialNumber}`;
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    // Generate order number if not provided
    if (!orderData.orderNumber) {
      orderData.orderNumber = await this.generateOrderNumber(orderData.tenantId);
    }
    
    const order = this.orderRepository.create(orderData);
    return this.orderRepository.save(order);
  }

  async update(id: string, tenantId: string, orderData: Partial<Order>): Promise<Order> {
    await this.orderRepository.update(
      { id, tenantId },
      orderData
    );
    return this.findById(id, tenantId);
  }

  async updateStatus(id: string, tenantId: string, status: OrderStatus): Promise<Order> {
    const order = await this.findById(id, tenantId);
    
    if (!order) {
      return null;
    }
    
    // Update status and related timestamps
    const updates: Partial<Order> = { status };
    
    switch (status) {
      case OrderStatus.PAID:
        updates.paidAt = new Date();
        updates.paymentStatus = PaymentStatus.PAID;
        break;
      case OrderStatus.SHIPPED:
        updates.shippedAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        updates.deliveredAt = new Date();
        break;
      case OrderStatus.COMPLETED:
        updates.completedAt = new Date();
        break;
      case OrderStatus.CANCELLED:
        updates.cancelledAt = new Date();
        break;
      case OrderStatus.REFUNDED:
        updates.refundedAt = new Date();
        updates.paymentStatus = PaymentStatus.REFUNDED;
        break;
    }
    
    await this.orderRepository.update({ id, tenantId }, updates);
    return this.findById(id, tenantId);
  }

  async updatePaymentStatus(id: string, tenantId: string, paymentStatus: PaymentStatus, transactionId?: string): Promise<Order> {
    const updates: Partial<Order> = { 
      paymentStatus,
      paymentTransactionId: transactionId || undefined
    };
    
    if (paymentStatus === PaymentStatus.PAID) {
      updates.paidAt = new Date();
      updates.status = OrderStatus.PAID;
    } else if (paymentStatus === PaymentStatus.REFUNDED) {
      updates.refundedAt = new Date();
      updates.status = OrderStatus.REFUNDED;
    }
    
    await this.orderRepository.update({ id, tenantId }, updates);
    return this.findById(id, tenantId);
  }

  async updateFulfillmentStatus(id: string, tenantId: string, fulfillmentStatus: FulfillmentStatus): Promise<Order> {
    const updates: Partial<Order> = { fulfillmentStatus };
    
    if (fulfillmentStatus === FulfillmentStatus.FULFILLED) {
      updates.shippedAt = new Date();
      updates.status = OrderStatus.SHIPPED;
    }
    
    await this.orderRepository.update({ id, tenantId }, updates);
    return this.findById(id, tenantId);
  }

  async addItem(orderId: string, itemData: Partial<OrderItem>): Promise<OrderItem> {
    const orderItem = this.orderItemRepository.create({
      orderId,
      ...itemData,
    });
    return this.orderItemRepository.save(orderItem);
  }

  async updateItem(id: string, orderId: string, itemData: Partial<OrderItem>): Promise<OrderItem> {
    await this.orderItemRepository.update(
      { id, orderId },
      itemData
    );
    
    return this.orderItemRepository.findOne({ where: { id } });
  }

  async updateItemStatus(id: string, orderId: string, status: OrderItemStatus): Promise<OrderItem> {
    const updates: Partial<OrderItem> = { status };
    
    switch (status) {
      case OrderItemStatus.SHIPPED:
        updates.shippedAt = new Date();
        break;
      case OrderItemStatus.DELIVERED:
        updates.deliveredAt = new Date();
        break;
      case OrderItemStatus.CANCELLED:
        updates.cancelledAt = new Date();
        break;
      case OrderItemStatus.REFUNDED:
        updates.refundedAt = new Date();
        break;
    }
    
    await this.orderItemRepository.update({ id, orderId }, updates);
    return this.orderItemRepository.findOne({ where: { id } });
  }

  async getOrderStats(tenantId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }
    
    // Get total orders
    const [orders, totalOrders] = await this.findAll(tenantId, {
      startDate,
      endDate: now,
    });
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    
    // Get orders by status
    const ordersByStatus = await Promise.all(
      Object.values(OrderStatus).map(async (status) => {
        const count = await this.orderRepository.count({
          where: {
            tenantId,
            status,
            createdAt: Between(startDate, now),
          },
        });
        return { status, count };
      })
    );
    
    // Get average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      period,
    };
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.orderRepository.count({ where: { tenantId } });
  }
}
