import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsEnum(['incoming', 'outgoing'])
  paymentType: 'incoming' | 'outgoing';

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsEnum(['cash', 'bank_transfer', 'upi', 'cheque', 'card', 'other'])
  paymentMethod?: 'cash' | 'bank_transfer' | 'upi' | 'cheque' | 'card' | 'other';

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  billId?: string;

  @IsOptional()
  @IsString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsEnum(['cash', 'bank_transfer', 'upi', 'cheque', 'card', 'other'])
  paymentMethod?: 'cash' | 'bank_transfer' | 'upi' | 'cheque' | 'card' | 'other';

  @IsOptional()
  @IsString()
  notes?: string;
}
