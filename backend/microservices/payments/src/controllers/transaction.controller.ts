import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, ParseUUIDPipe, ValidationPipe } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'Return all transactions.' })
  async findAll(
    @Request() req,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const tenantId = req.user.tenantId;
    const [transactions, total] = await this.transactionService.findAll(tenantId, {
      skip,
      take,
      type,
      status,
      startDate,
      endDate,
    });
    return { transactions, total };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Return transaction by ID.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  async findById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Transaction> {
    const tenantId = req.user.tenantId;
    return this.transactionService.findById(id, tenantId);
  }

  @Get('payment/:paymentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Get transactions by payment ID' })
  @ApiResponse({ status: 200, description: 'Return transactions by payment ID.' })
  async findByPaymentId(
    @Request() req,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ): Promise<Transaction[]> {
    const tenantId = req.user.tenantId;
    return this.transactionService.findByPaymentId(paymentId, tenantId);
  }

  @Get('gateway/:gatewayId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Get transaction by gateway ID' })
  @ApiResponse({ status: 200, description: 'Return transaction by gateway ID.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  async findByGatewayId(
    @Request() req,
    @Param('gatewayId') gatewayId: string,
  ): Promise<Transaction> {
    const tenantId = req.user.tenantId;
    return this.transactionService.findByGatewayId(gatewayId, tenantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(
    @Request() req,
    @Body(ValidationPipe) transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    // Set tenant ID from authenticated user
    transactionData.tenantId = req.user.tenantId;
    return this.transactionService.create(transactionData);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, description: 'Return transaction statistics.' })
  async getTransactionStats(
    @Request() req,
    @Query('period') period?: 'day' | 'week' | 'month' | 'year',
  ): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.transactionService.getTransactionStats(tenantId, period);
  }

  @Get('split-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  @ApiOperation({ summary: 'Get split payment statistics' })
  @ApiResponse({ status: 200, description: 'Return split payment statistics.' })
  async getSplitPaymentStats(
    @Request() req,
    @Query('period') period?: 'day' | 'week' | 'month' | 'year',
  ): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.transactionService.getSplitPaymentStats(tenantId, period);
  }
}
