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
import { AttributeService } from '../services/attribute.service';
import { Attribute, AttributeType } from '../entities/attribute.entity';

// DTO classes would normally be in separate files, simplified here for brevity
class CreateAttributeDto implements Partial<Attribute> {
  name: string;
  code: string;
  description?: string;
  type: AttributeType;
  isRequired?: boolean;
  isFilterable?: boolean;
  isSearchable?: boolean;
  isVariant?: boolean;
  options?: { value: string; label: string; }[];
  defaultValue?: string;
  unit?: string;
  isSystem?: boolean;
  sortOrder?: number;
  metadata?: Record<string, any>;
}

class UpdateAttributeDto extends CreateAttributeDto {}

class UpdateSortOrderDto {
  ids: string[];
}

class BulkCreateAttributesDto {
  attributes: CreateAttributeDto[];
}

@Controller('attributes')
@UseGuards(AuthGuard('jwt'))
export class AttributeController {
  constructor(private attributeService: AttributeService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('isFilterable') isFilterable?: boolean,
    @Query('isSearchable') isSearchable?: boolean,
    @Query('isVariant') isVariant?: boolean,
    @Query('type') type?: AttributeType,
  ) {
    const tenantId = req.user.tenantId;
    const options: any = {};
    
    if (isFilterable !== undefined) {
      options.isFilterable = isFilterable === 'true';
    }
    
    if (isSearchable !== undefined) {
      options.isSearchable = isSearchable === 'true';
    }
    
    if (isVariant !== undefined) {
      options.isVariant = isVariant === 'true';
    }
    
    if (type) {
      options.type = type;
    }
    
    return this.attributeService.findAll(tenantId, options);
  }

  @Get('variants')
  async getVariantAttributes(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.attributeService.getVariantAttributes(tenantId);
  }

  @Get('filterable')
  async getFilterableAttributes(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.attributeService.getFilterableAttributes(tenantId);
  }

  @Get(':id')
  async findById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.attributeService.findById(id, tenantId);
  }

  @Get('code/:code')
  async findByCode(
    @Request() req,
    @Param('code') code: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.attributeService.findByCode(code, tenantId);
  }

  @Post()
  async create(
    @Request() req,
    @Body(ValidationPipe) createAttributeDto: CreateAttributeDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.attributeService.create(tenantId, createAttributeDto);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateAttributeDto: UpdateAttributeDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.attributeService.update(id, tenantId, updateAttributeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = req.user.tenantId;
    await this.attributeService.remove(id, tenantId);
  }

  @Put('sort-order')
  async updateSortOrder(
    @Request() req,
    @Body() updateSortOrderDto: UpdateSortOrderDto,
  ) {
    const tenantId = req.user.tenantId;
    await this.attributeService.updateSortOrder(tenantId, updateSortOrderDto.ids);
    return { message: 'Attribute sort order updated successfully' };
  }

  @Post('bulk-create')
  async bulkCreate(
    @Request() req,
    @Body() bulkCreateDto: BulkCreateAttributesDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.attributeService.bulkCreate(tenantId, bulkCreateDto.attributes);
  }

  @Post('initialize-defaults')
  async initializeDefaultAttributes(@Request() req) {
    const tenantId = req.user.tenantId;
    await this.attributeService.initializeDefaultAttributes(tenantId);
    return { message: 'Default attributes initialized successfully' };
  }
}
