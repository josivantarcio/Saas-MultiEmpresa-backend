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
import { ProductService } from '../services/product.service';
import { Product, ProductStatus, ProductType } from '../entities/product.entity';

// DTO classes would normally be in separate files, simplified here for brevity
class CreateProductDto implements Partial<Product> {
  name: string;
  description?: string;
  longDescription?: string;
  slug?: string;
  sku?: string;
  barcode?: string;
  type: ProductType;
  status?: ProductStatus;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  manageInventory?: boolean;
  allowBackorders?: boolean;
  featured?: boolean;
  mainImageUrl?: string;
  imageUrls?: string[];
  attributes?: Record<string, any>;
  metadata?: Record<string, any>;
  categoryId?: string;
  weight?: number;
  weightUnit?: string;
  width?: number;
  height?: number;
  depth?: number;
  dimensionsUnit?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  downloadUrl?: string;
  downloadExpiryDays?: number;
  requiresAppointment?: boolean;
  serviceDuration?: number;
}

class UpdateProductDto extends CreateProductDto {}

class BulkImportProductsDto {
  products: CreateProductDto[];
}

class UpdateStockDto {
  quantity: number;
}

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: ProductStatus,
    @Query('categoryId') categoryId?: string,
    @Query('featured') featured?: boolean,
    @Query('search') search?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.productService.findAll(tenantId, {
      skip,
      take,
      status,
      categoryId,
      featured: featured !== undefined ? Boolean(featured) : undefined,
      search,
    });
  }

  @Get(':id')
  async findById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.productService.findById(id, tenantId);
  }

  @Get('slug/:slug')
  async findBySlug(
    @Request() req,
    @Param('slug') slug: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.productService.findBySlug(slug, tenantId);
  }

  @Post()
  async create(
    @Request() req,
    @Body(ValidationPipe) createProductDto: CreateProductDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.productService.create(tenantId, createProductDto);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.productService.update(id, tenantId, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = req.user.tenantId;
    await this.productService.remove(id, tenantId);
  }

  @Put(':id/stock')
  async updateStock(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    const tenantId = req.user.tenantId;
    await this.productService.updateStock(id, tenantId, updateStockDto.quantity);
    return { message: 'Stock updated successfully' };
  }

  @Post('bulk-import')
  async bulkImport(
    @Request() req,
    @Body() bulkImportDto: BulkImportProductsDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.productService.bulkImport(tenantId, bulkImportDto.products);
  }

  @Get('dashboard/stats')
  async getDashboardStats(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.productService.getDashboardStats(tenantId);
  }
}
