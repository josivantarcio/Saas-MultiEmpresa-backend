import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, ParseUUIDPipe, ValidationPipe, Patch } from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { Subscription, SubscriptionStatus, SubscriptionCycle } from '../entities/subscription.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({ status: 200, description: 'Return all subscriptions.' })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: SubscriptionStatus,
    @Query('cycle') cycle?: SubscriptionCycle,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('search') search?: string,
  ): Promise<{ subscriptions: Subscription[]; total: number }> {
    const [subscriptions, total] = await this.subscriptionService.findAll({
      skip,
      take,
      status,
      cycle,
      startDate,
      endDate,
      search,
    });
    return { subscriptions, total };
  }

  @Get('tenant')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant')
  @ApiOperation({ summary: 'Get subscription for current tenant' })
  @ApiResponse({ status: 200, description: 'Return subscription for current tenant.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  async findForCurrentTenant(
    @Request() req,
  ): Promise<Subscription> {
    const tenantId = req.user.tenantId;
    return this.subscriptionService.findByTenantId(tenantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({ status: 200, description: 'Return subscription by ID.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  async findById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Subscription> {
    const tenantId = req.user.tenantId;
    return this.subscriptionService.findById(id, tenantId);
  }

  @Get('gateway/:gatewayId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get subscription by gateway ID' })
  @ApiResponse({ status: 200, description: 'Return subscription by gateway ID.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  async findByGatewayId(
    @Request() req,
    @Param('gatewayId') gatewayId: string,
  ): Promise<Subscription> {
    const tenantId = req.user.tenantId;
    return this.subscriptionService.findByGatewayId(gatewayId, tenantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async createSubscription(
    @Body(ValidationPipe) subscriptionData: any,
  ): Promise<Subscription> {
    return this.subscriptionService.createSubscription(subscriptionData);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  async cancelSubscription(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancelData: { reason: string },
  ): Promise<Subscription> {
    const tenantId = req.user.tenantId;
    return this.subscriptionService.cancel(id, tenantId, cancelData.reason);
  }

  @Patch(':id/convert-trial')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant')
  @ApiOperation({ summary: 'Convert trial to active subscription' })
  @ApiResponse({ status: 200, description: 'Trial converted successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  async convertTrialToActive(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() paymentData: { paymentMethod: string },
  ): Promise<Subscription> {
    const tenantId = req.user.tenantId;
    return this.subscriptionService.convertTrialToActive(id, tenantId, paymentData.paymentMethod);
  }

  @Patch(':id/change-plan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Change subscription plan' })
  @ApiResponse({ status: 200, description: 'Plan changed successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  async changePlan(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() planData: { planId: string; planName: string; amount: number; cycle?: SubscriptionCycle },
  ): Promise<Subscription> {
    const tenantId = req.user.tenantId;
    return this.subscriptionService.changePlan(id, tenantId, planData);
  }

  @Get('due-for-renewal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get subscriptions due for renewal' })
  @ApiResponse({ status: 200, description: 'Return subscriptions due for renewal.' })
  async findDueForRenewal(
    @Query('daysAhead') daysAhead?: number,
  ): Promise<Subscription[]> {
    return this.subscriptionService.findDueForRenewal(daysAhead);
  }

  @Get('overdue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get overdue subscriptions' })
  @ApiResponse({ status: 200, description: 'Return overdue subscriptions.' })
  async findOverdue(): Promise<Subscription[]> {
    return this.subscriptionService.findOverdue();
  }

  @Get('trials-ending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get trials ending soon' })
  @ApiResponse({ status: 200, description: 'Return trials ending soon.' })
  async findTrialsEnding(
    @Query('daysAhead') daysAhead?: number,
  ): Promise<Subscription[]> {
    return this.subscriptionService.findTrialsEnding(daysAhead);
  }

  @Post('process-renewals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Process subscription renewals' })
  @ApiResponse({ status: 200, description: 'Renewals processed successfully.' })
  async processRenewals(): Promise<{ success: boolean; message: string }> {
    await this.subscriptionService.processRenewals();
    return { success: true, message: 'Subscription renewals processed successfully' };
  }

  @Post('process-trial-endings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Process trial endings' })
  @ApiResponse({ status: 200, description: 'Trial endings processed successfully.' })
  async processTrialEndings(): Promise<{ success: boolean; message: string }> {
    await this.subscriptionService.processTrialEndings();
    return { success: true, message: 'Trial endings processed successfully' };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get subscription statistics' })
  @ApiResponse({ status: 200, description: 'Return subscription statistics.' })
  async getSubscriptionStats(): Promise<any> {
    return this.subscriptionService.getSubscriptionStats();
  }
}
