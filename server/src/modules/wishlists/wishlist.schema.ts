import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WishlistDocument = HydratedDocument<Wishlist>;

@Schema({ collection: 'wishlists', timestamps: true })
export class Wishlist {
  /** Owner of the wishlist (a User id) */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /** Wishlisted product (a Product id) */
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  /** Optional display-name snapshot captured when added */
  @Prop({ type: String, required: false })
  productName?: string;

  /** Optional price snapshot captured when added */
  @Prop({ type: Number, required: false, min: 0 })
  priceAtAdd?: number;

  @Prop({ default: Date.now })
  addedAt: Date;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

// One wishlist entry per (user, product) pair
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });
