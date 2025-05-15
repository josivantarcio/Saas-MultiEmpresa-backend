import {
  Controller,
  Get,
  Post,
  Put,
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
import { OrderService } from '../services/order.service';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '../entities/order.entity';
import { OrderItemStatus } from '../entities/order-item.entity';

// DTO classes would normally be in separate files, simplified here for brevity
class UpdateOrderStatusDto {
  status: OrderStatus;
}

class UpdatePaymentStatusDto {
  status: PaymentStatus;
  transactionId?: string;
}

class UpdateFulfillmentStatusDto {
  status: FulfillmentStatus;
}

class UpdateOrderItemStatusDto {
  status: OrderItemStatus;
}

class AddTrackingInfoDto {
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: Date;
}

class AddAdminNotesDto {
  adminNotes: string;
}

class CancelOrderDto {
  cancelReason: string;
}

class RefundOrderDto {
  refundAmount: number;
}

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('fulfillmentStatus') fulfillmentStatus?: FulfillmentStatus,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('search') search?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.orderService.findAll(tenantId, {
      skip,
      take,
      status,
      paymentStatus,
      fulfillmentStatus,
      startDate,
      endDate,
      search,
    });
  }

  @Get('my-orders')
  async findMyOrders(
    @Request() req,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: OrderStatus,
  ) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    
    return this.orderService.findByUserId(userId, tenantId, {
      skip,
      take,
      status,
    });
  }

  @Get(':id')
  async findById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.orderService.findById(id, tenantId);
  }

  @Get('number/:orderNumber')
  async findByOrderNumber(
    @Request() req,
    @Param('orderNumber') orderNumber: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.orderService.findByOrderNumber(orderNumber, tenantId);
  }

  @Put(':id/status')
  async updateStatus(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateStatusDto: UpdateOrderStatusDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.orderService.updateStatus(id, tenantId, updateStatusDto.status);
  }

  @Put(':id/payment-status')
  async updatePaymentStatus(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updatePaymentStatusDto: UpdatePaymentStatusDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.orderService.updatePaymentStatus(
      id,
      tenantId,
      updatePaymentStatusDto.status,
      updatePaymentStatusDto.transactionId
    );
  }

  @Put(':id/fulfillment-status')
  async updateFulfillmentStatus(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateFulfillmentStatusDto: UpdateFulfillmentStatusDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.orderService.updateFulfillmentStatus(
      id,
      tenantId,
      updateFulfillmentStatusDto.status
    );
  }

  @Put(':id/items/:itemId/status')
  async updateItemStatus(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body(ValidationPipe) updateItemStatusDto: UpdateOrderItemStatusDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.orderService.updateOrderItemStatus(
      id,
      itemId,
      tenantId,
      updateItemStatusDto.status
    );
  }

  @Put(':id/tracking')
  async addTrackingInfo(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) addTrackingInfoDto: AddTrackingInfoDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.orderService.addTrackingInfo(id, tenantId, addTrackingInfoDto);
  }

  @Put(':id/admin-notes')
  async addAdminNotes(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) addAdminNotesDto: AddAdminNotesDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.orderService.addAdminNotes(id, tenantId, addAdminNotesDto.adminNotes);
  }

  @Post(':id/cancel')
  async cancelOrder(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) cancelOrderDto: CancelOrderDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.orderService.cancelOrder(id, tenantId, cancelOrderDto.cancelReason);
  }

  @Post(':id/refund')
  async refundOrder(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) refundOrderDto: RefundOrderDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.orderService.refundOrder(id, tenantId, refundOrderDto.refundAmount);
  }

  @Get('stats/:period')
  async getOrderStats(
    @Request() req,
    @Param('period') period: 'day' | 'week' | 'month' | 'year',
  ) {
    const tenantId = req.user.tenantId;
    return this.orderService.getOrderStats(tenantId, period);
  }
}
