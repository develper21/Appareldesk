import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePaymentTermDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsInt()
  @Min(0)
  days: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}

export class UpdatePaymentTermDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  days?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
