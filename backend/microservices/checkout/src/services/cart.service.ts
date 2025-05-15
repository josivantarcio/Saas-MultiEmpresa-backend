import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CartRepository } from '../repositories/cart.repository';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartService {
  constructor(
    private cartRepository: CartRepository,
  ) {}

  async findById(id: string, tenantId: string): Promise<Cart> {
    const cart = await this.cartRepository.findById(id, tenantId);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
    return cart;
  }

  async findOrCreateCart(tenantId: string, options: {
    sessionId?: string;
    userId?: string;
  }): Promise<Cart> {
    const { sessionId, userId } = options;
    
    let cart: Cart = null;
    
    // Try to find existing cart
    if (userId) {
      cart = await this.cartRepository.findByUserId(userId, tenantId);
    }
    
    if (!cart && sessionId) {
      cart = await this.cartRepository.findBySessionId(sessionId, tenantId);
    }
    
    // If cart exists, return it
    if (cart) {
      // If user ID is provided and cart doesn't have it, update the cart
      if (userId && !cart.userId) {
        cart = await this.cartRepository.update(cart.id, tenantId, { userId });
      }
      return cart;
    }
    
    // Create new cart
    const newSessionId = sessionId || uuidv4();
    
    return this.cartRepository.create({
      tenantId,
      sessionId: newSessionId,
      userId: userId || null,
    });
  }

  async addItem(
    cartId: string,
    tenantId: string,
    itemData: {
      productId: string;
      productVariantId?: string;
      name: string;
      sku?: string;
      imageUrl?: string;
      price: number;
      quantity?: number;
      attributes?: Record<string, any>;
      requiresShipping?: boolean;
      isDigital?: boolean;
      isService?: boolean;
      appointmentDate?: Date;
      appointmentDuration?: number;
      appointmentStaffId?: string;
    }
  ): Promise<Cart> {
    // Validate cart
    const cart = await this.findById(cartId, tenantId);
    
    // Add item to cart
    await this.cartRepository.addItem(cartId, {
      productId: itemData.productId,
      productVariantId: itemData.productVariantId,
      name: itemData.name,
      sku: itemData.sku,
      imageUrl: itemData.imageUrl,
      price: itemData.price,
      quantity: itemData.quantity || 1,
      attributes: itemData.attributes || {},
      requiresShipping: itemData.requiresShipping || false,
      isDigital: itemData.isDigital || false,
      isService: itemData.isService || false,
      appointmentDate: itemData.appointmentDate,
      appointmentDuration: itemData.appointmentDuration,
      appointmentStaffId: itemData.appointmentStaffId,
    });
    
    // Recalculate cart totals
    return this.cartRepository.calculateTotals(cartId, tenantId);
  }

  async updateItemQuantity(
    cartId: string,
    itemId: string,
    tenantId: string,
    quantity: number
  ): Promise<Cart> {
    // Validate cart
    const cart = await this.findById(cartId, tenantId);
    
    // Find item in cart
    const item = cart.items.find(i => i.id === itemId);
    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found in cart`);
    }
    
    // Validate quantity
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }
    
    // Update item quantity
    await this.cartRepository.updateItem(itemId, cartId, { quantity });
    
    // Recalculate cart totals
    return this.cartRepository.calculateTotals(cartId, tenantId);
  }

  async removeItem(
    cartId: string,
    itemId: string,
    tenantId: string
  ): Promise<Cart> {
    // Validate cart
    const cart = await this.findById(cartId, tenantId);
    
    // Find item in cart
    const item = cart.items.find(i => i.id === itemId);
    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found in cart`);
    }
    
    // Remove item from cart
    await this.cartRepository.removeItem(itemId, cartId);
    
    // Recalculate cart totals
    return this.cartRepository.calculateTotals(cartId, tenantId);
  }

  async clearCart(cartId: string, tenantId: string): Promise<Cart> {
    // Validate cart
    const cart = await this.findById(cartId, tenantId);
    
    // Remove all items from cart
    await this.cartRepository.clearItems(cartId);
    
    // Recalculate cart totals
    return this.cartRepository.calculateTotals(cartId, tenantId);
  }

  async updateCart(
    cartId: string,
    tenantId: string,
    cartData: Partial<Cart>
  ): Promise<Cart> {
    // Validate cart
    await this.findById(cartId, tenantId);
    
    // Update cart
    return this.cartRepository.update(cartId, tenantId, cartData);
  }

  async applyShipping(
    cartId: string,
    tenantId: string,
    shippingMethodId: string,
    shippingAmount: number
  ): Promise<Cart> {
    // Validate cart
    await this.findById(cartId, tenantId);
    
    // Update cart with shipping info
    await this.cartRepository.update(cartId, tenantId, {
      shippingMethodId,
      shippingAmount,
    });
    
    // Recalculate cart totals
    return this.cartRepository.calculateTotals(cartId, tenantId);
  }

  async applyCoupon(
    cartId: string,
    tenantId: string,
    couponCode: string,
    discountAmount: number
  ): Promise<Cart> {
    // Validate cart
    await this.findById(cartId, tenantId);
    
    // Update cart with coupon info
    await this.cartRepository.update(cartId, tenantId, {
      couponCode,
      discountAmount,
    });
    
    // Recalculate cart totals
    return this.cartRepository.calculateTotals(cartId, tenantId);
  }

  async setShippingAddress(
    cartId: string,
    tenantId: string,
    shippingAddress: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone?: string;
    }
  ): Promise<Cart> {
    // Validate cart
    await this.findById(cartId, tenantId);
    
    // Update cart with shipping address
    return this.cartRepository.update(cartId, tenantId, { shippingAddress });
  }

  async setBillingAddress(
    cartId: string,
    tenantId: string,
    billingAddress: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone?: string;
    }
  ): Promise<Cart> {
    // Validate cart
    await this.findById(cartId, tenantId);
    
    // Update cart with billing address
    return this.cartRepository.update(cartId, tenantId, { billingAddress });
  }

  async startCheckout(cartId: string, tenantId: string): Promise<Cart> {
    // Validate cart
    const cart = await this.findById(cartId, tenantId);
    
    // Check if cart has items
    if (cart.isEmpty) {
      throw new BadRequestException('Cannot start checkout with an empty cart');
    }
    
    // Update cart checkout status
    return this.cartRepository.update(cartId, tenantId, { isCheckoutStarted: true });
  }

  async findAbandonedCarts(tenantId: string, hours: number = 24): Promise<Cart[]> {
    return this.cartRepository.findAbandoned(tenantId, { hours });
  }

  async markCartAsAbandoned(cartId: string, tenantId: string): Promise<void> {
    await this.cartRepository.markAsAbandoned(cartId, tenantId);
  }

  async updateLastNotification(cartId: string, tenantId: string): Promise<void> {
    await this.cartRepository.updateLastNotification(cartId, tenantId);
  }

  async deleteCart(cartId: string, tenantId: string): Promise<void> {
    await this.cartRepository.remove(cartId, tenantId);
  }
}
