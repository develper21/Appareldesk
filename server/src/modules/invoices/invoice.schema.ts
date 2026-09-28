import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InvoiceDocument = HydratedDocument<Invoice>;

@Schema({ collection: 'invoices', timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Order', default: null })
  orderId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Contact', default: null })
  customerId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  userId: Types.ObjectId | null;

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0, min: 0 })
  taxAmount: number;

  @Prop({ default: 0, min: 0 })
  discountAmount: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'draft' })
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

  @Prop({ type: Date, default: null })
  dueDate: Date | null;

  @Prop({ type: Date, default: null })
  paidAt: Date | null;

  @Prop({ type: String, required: false })
  notes?: string | null;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
