import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from '../services/cart.service';
import { Cart } from '../entities/cart.entity';

// DTO classes would normally be in separate files, simplified here for brevity
class CreateCartDto {
  sessionId?: string;
}

class AddItemDto {
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

class UpdateItemQuantityDto {
  quantity: number;
}

class ShippingAddressDto {
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

class BillingAddressDto extends ShippingAddressDto {}

@Controller('carts')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private cartService: CartService) {}

  @Post()
  async createCart(
    @Request() req,
    @Body() createCartDto: CreateCartDto,
  ) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    
    return this.cartService.findOrCreateCart(tenantId, {
      sessionId: createCartDto.sessionId,
      userId,
    });
  }

  @Get(':id')
  async findById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.cartService.findById(id, tenantId);
  }

  @Post(':id/items')
  async addItem(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) addItemDto: AddItemDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.cartService.addItem(id, tenantId, addItemDto);
  }

  @Put(':id/items/:itemId')
  async updateItemQuantity(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body(ValidationPipe) updateItemQuantityDto: UpdateItemQuantityDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.cartService.updateItemQuantity(
      id,
      itemId,
      tenantId,
      updateItemQuantityDto.quantity
    );
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    const tenantId = req.user.tenantId;
    await this.cartService.removeItem(id, itemId, tenantId);
  }

  @Delete(':id/items')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = req.user.tenantId;
    await this.cartService.clearCart(id, tenantId);
  }

  @Put(':id/shipping-address')
  async setShippingAddress(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) shippingAddressDto: ShippingAddressDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.cartService.setShippingAddress(id, tenantId, shippingAddressDto);
  }

  @Put(':id/billing-address')
  async setBillingAddress(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) billingAddressDto: BillingAddressDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.cartService.setBillingAddress(id, tenantId, billingAddressDto);
  }

  @Post(':id/start-checkout')
  async startCheckout(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.cartService.startCheckout(id, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCart(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = req.user.tenantId;
    await this.cartService.deleteCart(id, tenantId);
  }
}
