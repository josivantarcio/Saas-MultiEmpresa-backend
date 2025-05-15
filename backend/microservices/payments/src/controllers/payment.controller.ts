import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, ParseUUIDPipe, ValidationPipe, Patch } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { Payment, PaymentStatus, PaymentType } from '../entities/payment.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Return all payments.' })
  async findAll(
    @Request() req,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: PaymentStatus,
    @Query('type') type?: PaymentType,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('search') search?: string,
  ): Promise<{ payments: Payment[]; total: number }> {
    const tenantId = req.user.tenantId;
    const [payments, total] = await this.paymentService.findAll(tenantId, {
      skip,
      take,
      status,
      type,
      startDate,
      endDate,
      search,
    });
    return { payments, total };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant', 'customer')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Return payment by ID.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  async findById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Payment> {
    const tenantId = req.user.tenantId;
    return this.paymentService.findById(id, tenantId);
  }

  @Get('gateway/:gatewayId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Get payment by gateway ID' })
  @ApiResponse({ status: 200, description: 'Return payment by gateway ID.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  async findByGatewayId(
    @Request() req,
    @Param('gatewayId') gatewayId: string,
  ): Promise<Payment> {
    const tenantId = req.user.tenantId;
    return this.paymentService.findByGatewayId(gatewayId, tenantId);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant', 'customer')
  @ApiOperation({ summary: 'Get payment by order ID' })
  @ApiResponse({ status: 200, description: 'Return payment by order ID.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  async findByOrderId(
    @Request() req,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<Payment> {
    const tenantId = req.user.tenantId;
    return this.paymentService.findByOrderId(orderId, tenantId);
  }

  @Get('reference/:reference')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Get payment by external reference' })
  @ApiResponse({ status: 200, description: 'Return payment by external reference.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  async findByExternalReference(
    @Request() req,
    @Param('reference') reference: string,
  ): Promise<Payment> {
    const tenantId = req.user.tenantId;
    return this.paymentService.findByExternalReference(reference, tenantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Process a new payment' })
  @ApiResponse({ status: 201, description: 'Payment processed successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async processPayment(
    @Request() req,
    @Body(ValidationPipe) paymentData: any,
  ): Promise<Payment> {
    // Set tenant ID from authenticated user
    paymentData.tenantId = req.user.tenantId;
    return this.paymentService.processPayment(paymentData);
  }

  @Patch(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  async refundPayment(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() refundData: { reason: string; amount?: number },
  ): Promise<Payment> {
    const tenantId = req.user.tenantId;
    return this.paymentService.refundPayment(id, tenantId, refundData.reason, refundData.amount);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Cancel a payment' })
  @ApiResponse({ status: 200, description: 'Payment cancelled successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  async cancelPayment(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancelData: { reason: string },
  ): Promise<Payment> {
    const tenantId = req.user.tenantId;
    return this.paymentService.cancelPayment(id, tenantId, cancelData.reason);
  }

  @Get(':id/link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant', 'customer')
  @ApiOperation({ summary: 'Get payment link' })
  @ApiResponse({ status: 200, description: 'Return payment link.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  async getPaymentLink(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ paymentUrl: string }> {
    const tenantId = req.user.tenantId;
    const paymentUrl = await this.paymentService.getPaymentLink(id, tenantId);
    return { paymentUrl };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({ status: 200, description: 'Return payment statistics.' })
  async getPaymentStats(
    @Request() req,
    @Query('period') period?: 'day' | 'week' | 'month' | 'year',
  ): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.paymentService.getPaymentStats(tenantId, period);
  }
}
