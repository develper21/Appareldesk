import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './wishlist.schema';
import { AddWishlistItemDto } from './dto/wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectModel(Wishlist.name) private readonly wishlistModel: Model<WishlistDocument>,
  ) {}

  /** Idempotent add (upsert on user+product) */
  async add(userId: string, dto: AddWishlistItemDto): Promise<WishlistDocument> {
    return this.wishlistModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), productId: new Types.ObjectId(dto.productId) },
      {
        $setOnInsert: {
          userId: new Types.ObjectId(userId),
          productId: new Types.ObjectId(dto.productId),
          addedAt: new Date(),
        },
        $set: {
          productName: dto.productName ?? null,
          priceAtAdd: dto.priceAtAdd ?? null,
        },
      },
      { new: true, upsert: true },
    );
  }

  /**
   * Full wishlist for the signed-in user.
   * Returns the populated Product documents directly (newest first) so the
   * frontend can consume them exactly like its local wishlist shape.
   */
  async findAllFor(userId: string): Promise<any[]> {
    const entries = await this.wishlistModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ addedAt: -1, createdAt: -1 })
      .populate('productId')
      .exec();

    // Drop entries whose product has since been deleted
    return entries
      .filter((e) => e.productId)
      .map((e) => (e.productId as any).toObject ? (e.productId as any).toObject() : e.productId);
  }

  async remove(userId: string, productId: string): Promise<void> {
    const res = await this.wishlistModel
      .findOneAndDelete({
        userId: new Types.ObjectId(userId),
        productId: new Types.ObjectId(productId),
      })
      .exec();
    if (!res) throw new NotFoundException('Item not found in wishlist');
  }

  async clear(userId: string): Promise<void> {
    await this.wishlistModel.deleteMany({ userId: new Types.ObjectId(userId) });
  }

  async countFor(userId: string): Promise<number> {
    return this.wishlistModel.countDocuments({ userId: new Types.ObjectId(userId) });
  }

  /** Toggle: returns true if the item is now wishlisted, false if removed */
  async toggle(userId: string, dto: AddWishlistItemDto): Promise<boolean> {
    const existing = await this.wishlistModel
      .findOne({ userId: new Types.ObjectId(userId), productId: new Types.ObjectId(dto.productId) })
      .exec();

    if (existing) {
      await existing.deleteOne();
      return false;
    }
    await this.add(userId, dto);
    return true;
  }
}
