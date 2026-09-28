import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PurchaseOrderItemDocument = HydratedDocument<PurchaseOrderItem>;

@Schema()
export class PurchaseOrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;
}

export const PurchaseOrderItemSchema = SchemaFactory.createForClass(PurchaseOrderItem);

export type PurchaseOrderDocument = HydratedDocument<PurchaseOrder>;

@Schema({ collection: 'purchase_orders', timestamps: true })
export class PurchaseOrder {
  @Prop({ required: true, unique: true })
  poNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Contact', required: true, index: true })
  vendorId: Types.ObjectId;

  @Prop({ type: [PurchaseOrderItemSchema], default: [] })
  items: PurchaseOrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0, min: 0 })
  taxAmount: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ type: String, enum: ['draft', 'confirmed', 'received', 'cancelled'], default: 'draft' })
  status: 'draft' | 'confirmed' | 'received' | 'cancelled';

  @Prop({ type: Types.ObjectId, ref: 'PaymentTerm', default: null })
  paymentTermId: Types.ObjectId | null;

  @Prop({ type: String, required: false })
  notes?: string | null;
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);
