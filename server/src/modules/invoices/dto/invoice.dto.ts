import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

  @IsOptional()
  @IsString()
  notes?: string;
}
