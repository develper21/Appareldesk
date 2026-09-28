import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ collection: 'products', timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, required: false, unique: true, sparse: true, trim: true })
  sku?: string;

  @Prop({ type: String, required: false, trim: true })
  description?: string;

  @Prop({ type: String, required: false })
  category?: string;

  @Prop({ type: String, enum: ['readymade', 'fabric'], default: 'readymade' })
  productType: 'readymade' | 'fabric';

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: Number, required: false, min: 0 })
  costPrice?: number;

  @Prop({ default: 0, min: 0 })
  stockQuantity: number;

  @Prop({ type: String, required: false })
  unit?: string;

  @Prop({ type: String, required: false })
  imageUrl?: string;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 'text', category: 'text' });
