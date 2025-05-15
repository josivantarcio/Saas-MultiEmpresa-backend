import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Cart> {
    return this.cartRepository.findOne({ 
      where: { id, tenantId },
      relations: ['items'],
    });
  }

  async findBySessionId(sessionId: string, tenantId: string): Promise<Cart> {
    return this.cartRepository.findOne({ 
      where: { sessionId, tenantId },
      relations: ['items'],
    });
  }

  async findByUserId(userId: string, tenantId: string): Promise<Cart> {
    return this.cartRepository.findOne({ 
      where: { userId, tenantId },
      relations: ['items'],
    });
  }

  async findAbandoned(tenantId: string, options: {
    hours: number;
    excludeNotified?: boolean;
    limit?: number;
  }): Promise<Cart[]> {
    const { hours, excludeNotified = true, limit = 50 } = options;
    
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    
    const queryBuilder = this.cartRepository.createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .where('cart.tenantId = :tenantId', { tenantId })
      .andWhere('cart.updatedAt < :cutoffDate', { cutoffDate })
      .andWhere('cart.isCheckoutStarted = :isCheckoutStarted', { isCheckoutStarted: true })
      .andWhere('cart.isAbandoned = :isAbandoned', { isAbandoned: false });
    
    if (excludeNotified) {
      queryBuilder.andWhere('(cart.lastNotificationSent IS NULL OR cart.lastNotificationSent < :cutoffDate)');
    }
    
    queryBuilder.orderBy('cart.updatedAt', 'DESC')
      .take(limit);
    
    return queryBuilder.getMany();
  }

  async create(cartData: Partial<Cart>): Promise<Cart> {
    const cart = this.cartRepository.create(cartData);
    return this.cartRepository.save(cart);
  }

  async update(id: string, tenantId: string, cartData: Partial<Cart>): Promise<Cart> {
    await this.cartRepository.update(
      { id, tenantId },
      cartData
    );
    return this.findById(id, tenantId);
  }

  async markAsAbandoned(id: string, tenantId: string): Promise<void> {
    await this.cartRepository.update(
      { id, tenantId },
      { isAbandoned: true }
    );
  }

  async updateLastNotification(id: string, tenantId: string): Promise<void> {
    await this.cartRepository.update(
      { id, tenantId },
      { lastNotificationSent: new Date() }
    );
  }

  async addItem(cartId: string, itemData: Partial<CartItem>): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cartId,
        productId: itemData.productId,
        productVariantId: itemData.productVariantId || null,
      },
    });
    
    if (existingItem) {
      // Update quantity
      existingItem.quantity += itemData.quantity || 1;
      return this.cartItemRepository.save(existingItem);
    } else {
      // Create new item
      const cartItem = this.cartItemRepository.create({
        cartId,
        ...itemData,
      });
      return this.cartItemRepository.save(cartItem);
    }
  }

  async updateItem(id: string, cartId: string, itemData: Partial<CartItem>): Promise<CartItem> {
    await this.cartItemRepository.update(
      { id, cartId },
      itemData
    );
    
    return this.cartItemRepository.findOne({ where: { id } });
  }

  async removeItem(id: string, cartId: string): Promise<void> {
    await this.cartItemRepository.delete({ id, cartId });
  }

  async clearItems(cartId: string): Promise<void> {
    await this.cartItemRepository.delete({ cartId });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    // First remove all cart items
    const cart = await this.findById(id, tenantId);
    if (cart && cart.items) {
      await this.clearItems(id);
    }
    
    // Then remove the cart
    await this.cartRepository.delete({ id, tenantId });
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.cartRepository.count({ where: { tenantId } });
  }

  async calculateTotals(id: string, tenantId: string): Promise<Cart> {
    const cart = await this.findById(id, tenantId);
    
    if (!cart) {
      return null;
    }
    
    cart.calculateTotals();
    return this.cartRepository.save(cart);
  }
}
