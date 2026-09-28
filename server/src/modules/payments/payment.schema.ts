import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ collection: 'payments', timestamps: true })
export class Payment {
  @Prop({ required: true, unique: true })
  paymentNumber: string;

  @Prop({ type: String, enum: ['incoming', 'outgoing'], required: true })
  paymentType: 'incoming' | 'outgoing';

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'card', 'other'],
    default: 'cash',
  })
  paymentMethod: 'cash' | 'bank_transfer' | 'upi' | 'cheque' | 'card' | 'other';

  @Prop({ type: Types.ObjectId, ref: 'Contact', default: null })
  contactId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Invoice', default: null })
  invoiceId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Bill', default: null })
  billId: Types.ObjectId | null;

  @Prop({ required: true })
  paidAt: Date;

  @Prop({ type: String, required: false })
  referenceNumber?: string | null;

  @Prop({ type: String, required: false })
  notes?: string | null;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
