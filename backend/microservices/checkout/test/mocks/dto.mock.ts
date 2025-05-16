import { IsString, IsNumber, IsOptional, IsUUID, IsBoolean, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartDto {
  @IsString()
  @IsOptional()
  sessionId?: string;
}

export class AddItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsUUID()
  @IsOptional()
  productVariantId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsOptional()
  attributes?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  requiresShipping?: boolean;

  @IsBoolean()
  @IsOptional()
  isDigital?: boolean;

  @IsBoolean()
  @IsOptional()
  isService?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  appointmentDate?: Date;

  @IsNumber()
  @IsOptional()
  appointmentDuration?: number;

  @IsUUID()
  @IsOptional()
  appointmentStaffId?: string;
}

export class UpdateItemQuantityDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  address1: string;

  @IsString()
  @IsOptional()
  address2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class BillingAddressDto extends ShippingAddressDto {}
