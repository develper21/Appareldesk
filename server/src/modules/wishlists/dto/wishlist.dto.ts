import { IsMongoId, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AddWishlistItemDto {
  @IsMongoId()
  productId: string;

  /** Optional display-name snapshot from the client */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  productName?: string;

  /** Optional price snapshot from the client */
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceAtAdd?: number;
}
