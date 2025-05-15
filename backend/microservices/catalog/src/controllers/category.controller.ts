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
import { CategoryService } from '../services/category.service';
import { Category } from '../entities/category.entity';

// DTO classes would normally be in separate files, simplified here for brevity
class CreateCategoryDto implements Partial<Category> {
  name: string;
  description?: string;
  slug?: string;
  parentId?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metadata?: Record<string, any>;
}

class UpdateCategoryDto extends CreateCategoryDto {}

class UpdateSortOrderDto {
  ids: string[];
}

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('parentId') parentId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('isFeatured') isFeatured?: boolean,
  ) {
    const tenantId = req.user.tenantId;
    const options: any = {};
    
    if (parentId === 'null') {
      options.parentId = null;
    } else if (parentId) {
      options.parentId = parentId;
    }
    
    if (isActive !== undefined) {
      options.isActive = isActive === 'true';
    }
    
    if (isFeatured !== undefined) {
      options.isFeatured = isFeatured === 'true';
    }
    
    return this.categoryService.findAll(tenantId, options);
  }

  @Get('tree')
  async getTree(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.categoryService.getTree(tenantId);
  }

  @Get(':id')
  async findById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.categoryService.findById(id, tenantId);
  }

  @Get('slug/:slug')
  async findBySlug(
    @Request() req,
    @Param('slug') slug: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.categoryService.findBySlug(slug, tenantId);
  }

  @Post()
  async create(
    @Request() req,
    @Body(ValidationPipe) createCategoryDto: CreateCategoryDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.categoryService.create(tenantId, createCategoryDto);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.categoryService.update(id, tenantId, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = req.user.tenantId;
    await this.categoryService.remove(id, tenantId);
  }

  @Put('sort-order')
  async updateSortOrder(
    @Request() req,
    @Body() updateSortOrderDto: UpdateSortOrderDto,
  ) {
    const tenantId = req.user.tenantId;
    await this.categoryService.updateSortOrder(tenantId, updateSortOrderDto.ids);
    return { message: 'Category sort order updated successfully' };
  }

  @Get('with-product-counts')
  async getCategoryWithProductCounts(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.categoryService.getCategoryWithProductCounts(tenantId);
  }
}
