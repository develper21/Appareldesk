import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateBillDto {
  @IsString()
  vendorId: string;

  @IsOptional()
  @IsString()
  purchaseOrderId?: string;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBillDto {
  @IsOptional()
  @IsEnum(['draft', 'received', 'paid', 'overdue', 'cancelled'])
  status?: 'draft' | 'received' | 'paid' | 'overdue' | 'cancelled';

  @IsOptional()
  @IsString()
  notes?: string;
}
