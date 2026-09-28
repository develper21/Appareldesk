import { IsArray, IsEmail, IsEnum, IsIn, IsNumber, IsObject, IsOptional, IsString, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ShippingAddressDto {
  @IsOptional() @IsString() @MaxLength(100) fullName?: string;
  @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @IsOptional() @IsString() @MaxLength(300) line1?: string;
  @IsOptional() @IsString() @MaxLength(64) city?: string;
  @IsOptional() @IsString() @MaxLength(64) state?: string;
  @IsOptional() @IsString() @MaxLength(12) pincode?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsObject()
  shippingAddress?: ShippingAddressDto;

  @IsOptional()
  @IsString()
  notes?: string;

  // Admin fields (used when admin creates on behalf of a customer)
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
  status?: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

  @IsOptional()
  @IsString()
  notes?: string;
}
