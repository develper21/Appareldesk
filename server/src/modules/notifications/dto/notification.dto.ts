import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  @MaxLength(150)
  title: string;

  @IsString()
  @MaxLength(500)
  message: string;

  @IsOptional()
  @IsEnum(['order', 'inventory', 'payment', 'customer', 'system', 'marketing'])
  type?: 'order' | 'inventory' | 'payment' | 'customer' | 'system' | 'marketing';

  @IsOptional()
  @IsEnum(['high', 'medium', 'low'])
  priority?: 'high' | 'medium' | 'low';

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  actionText?: string;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}
