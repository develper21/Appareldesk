import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DiscountOffer, DiscountOfferDocument } from './discount-offer.schema';
import { CreateDiscountOfferDto, UpdateDiscountOfferDto } from './dto/discount-offer.dto';

@Injectable()
export class DiscountOffersService {
  constructor(
    @InjectModel(DiscountOffer.name)
    private readonly discountOfferModel: Model<DiscountOfferDocument>,
  ) {}

  async create(dto: CreateDiscountOfferDto): Promise<DiscountOfferDocument> {
    const code = dto.code.toUpperCase();
    const existing = await this.discountOfferModel.findOne({ code });
    if (existing) throw new ConflictException(`Coupon code "${code}" already exists`);

    return this.discountOfferModel.create({
      ...dto,
      code,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
    });
  }

  async findAll(query: { includeInactive?: boolean } = {}): Promise<DiscountOfferDocument[]> {
    const filter: Record<string, any> = query.includeInactive ? {} : { isActive: true };
    return this.discountOfferModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<DiscountOfferDocument> {
    const offer = await this.discountOfferModel.findById(id).exec();
    if (!offer) throw new NotFoundException('Discount offer not found');
    return offer;
  }

  async update(id: string, dto: UpdateDiscountOfferDto): Promise<DiscountOfferDocument> {
    const offer = await this.discountOfferModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!offer) throw new NotFoundException('Discount offer not found');
    return offer;
  }

  async remove(id: string): Promise<void> {
    const res = await this.discountOfferModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Discount offer not found');
  }

  /** Used at checkout: validates the coupon and returns the discount amount */
  async validateAndApply(
    code: string,
    subtotal: number,
    incrementUsage = false,
  ): Promise<{ discountAmount: number; code: string; id: string }> {
    const offer = await this.discountOfferModel.findOne({ code: code.toUpperCase() });

    if (!offer) throw new BadRequestException('Invalid coupon code');
    if (!offer.isActive) throw new BadRequestException('This coupon is no longer active');
    if (offer.validFrom && new Date(offer.validFrom) > new Date()) {
      throw new BadRequestException('This coupon is not yet valid');
    }
    if (offer.validUntil && new Date(offer.validUntil) < new Date()) {
      throw new BadRequestException('This coupon has expired');
    }
    if (offer.maxUses && offer.usedCount >= offer.maxUses) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }
    if (offer.minOrderAmount && subtotal < offer.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount of ₹${offer.minOrderAmount} required for this coupon`);
    }

    const discountAmount =
      offer.discountType === 'percent'
        ? Math.round(subtotal * (offer.discountValue / 100) * 100) / 100
        : Math.min(offer.discountValue, subtotal);

    if (incrementUsage) {
      await this.discountOfferModel.updateOne({ _id: offer._id }, { $inc: { usedCount: 1 } });
    }

    return { discountAmount, code: offer.code, id: (offer._id as any).toString() };
  }

  /** Public endpoint for storefront cart coupon preview (no usage increment) */
  async preview(code: string, subtotal: number): Promise<{ discountAmount: number; code: string; description: string | null }> {
    const res = await this.validateAndApply(code, subtotal, false);
    const offer = await this.discountOfferModel.findOne({ code: res.code });
    return { discountAmount: res.discountAmount, code: res.code, description: offer?.description ?? null };
  }

  async countActive(): Promise<number> {
    return this.discountOfferModel.countDocuments({ isActive: true });
  }
}
