import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BillDocument = HydratedDocument<Bill>;

@Schema({ collection: 'bills', timestamps: true })
export class Bill {
  @Prop({ required: true, unique: true })
  billNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Contact', required: true, index: true })
  vendorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PurchaseOrder', default: null })
  purchaseOrderId: Types.ObjectId | null;

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0, min: 0 })
  taxAmount: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ type: String, enum: ['draft', 'received', 'paid', 'overdue', 'cancelled'], default: 'draft' })
  status: 'draft' | 'received' | 'paid' | 'overdue' | 'cancelled';

  @Prop({ type: Date, default: null })
  dueDate: Date | null;

  @Prop({ type: Date, default: null })
  paidAt: Date | null;

  @Prop({ type: String, required: false })
  notes?: string | null;
}

export const BillSchema = SchemaFactory.createForClass(Bill);
