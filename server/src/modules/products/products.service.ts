import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    if (dto.sku) {
      const existing = await this.productModel.findOne({ sku: dto.sku });
      if (existing) throw new ConflictException(`SKU "${dto.sku}" already exists`);
    }
    return this.productModel.create(dto);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    productType?: string;
    isPublished?: boolean;
    minPrice?: number;
    maxPrice?: number;
    includeUnpublished?: boolean;
  }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const filter: Record<string, any> = {};

    if (!query.includeUnpublished) filter.isPublished = true;

    if (query.search) {
      const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { description: rx }, { category: rx }];
    }
    if (query.category && query.category !== 'all') filter.category = query.category;
    if (query.productType) filter.productType = query.productType;
    if (query.isPublished !== undefined) filter.isPublished = query.isPublished;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
      if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
    }

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findStorefront(query: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
  }) {
    return this.findAll({ ...query, isPublished: true, includeUnpublished: false });
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    if (dto.sku) {
      const existing = await this.productModel.findOne({ sku: dto.sku, _id: { $ne: id } });
      if (existing) throw new ConflictException(`SKU "${dto.sku}" already exists`);
    }
    const product = await this.productModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string): Promise<void> {
    const res = await this.productModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Product not found');
  }

  async findByIds(ids: Types.ObjectId[]): Promise<ProductDocument[]> {
    return this.productModel.find({ _id: { $in: ids } }).exec();
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    await this.productModel.updateOne(
      { _id: productId },
      { $inc: { stockQuantity: -quantity } },
    );
  }

  async incrementStock(productId: string, quantity: number): Promise<void> {
    await this.productModel.updateOne(
      { _id: productId },
      { $inc: { stockQuantity: quantity } },
    );
  }

  async countPublished(): Promise<number> {
    return this.productModel.countDocuments({ isPublished: true });
  }

  async countAll(): Promise<number> {
    return this.productModel.countDocuments();
  }
}
