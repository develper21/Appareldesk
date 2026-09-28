import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentTermDocument = HydratedDocument<PaymentTerm>;

@Schema({ collection: 'payment_terms', timestamps: true })
export class PaymentTerm {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  days: number;

  @Prop({ type: String, required: false })
  description?: string | null;

  @Prop({ default: true })
  isActive: boolean;
}

export const PaymentTermSchema = SchemaFactory.createForClass(PaymentTerm);
