import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DiscountOfferDocument = HydratedDocument<DiscountOffer>;

@Schema({ collection: 'discount_offers', timestamps: true })
export class DiscountOffer {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ type: String, required: false })
  description?: string | null;

  @Prop({ type: String, enum: ['percent', 'fixed'], default: 'percent' })
  discountType: 'percent' | 'fixed';

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ type: Number, required: false, min: 0 })
  minOrderAmount?: number | null;

  @Prop({ type: Number, required: false })
  maxUses?: number | null;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ type: Date, default: null })
  validFrom?: Date | null;

  @Prop({ type: Date, default: null })
  validUntil?: Date | null;

  @Prop({ default: true })
  isActive: boolean;
}

export const DiscountOfferSchema = SchemaFactory.createForClass(DiscountOffer);
