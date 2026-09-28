import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { ProductsService } from '../products/products.service';
import { DiscountOffersService } from '../discount-offers/discount-offers.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly productsService: ProductsService,
    private readonly discountOffersService: DiscountOffersService,
  ) {}

  /** Storefront checkout: prices come from the DB, never from the client */
  async createFromCart(userId: string, dto: CreateOrderDto): Promise<OrderDocument> {
    if (!dto.items?.length) throw new BadRequestException('Cart is empty');

    const productIds = dto.items.map((i) => new Types.ObjectId(i.productId));
    const products = await this.productsService.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let subtotal = 0;
    const items = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }
      const totalPrice = product.price * item.quantity;
      subtotal += totalPrice;
      return {
        productId: new Types.ObjectId(item.productId),
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice,
      };
    });

    let discountAmount = 0;
    let couponCode: string | null = null;
    if (dto.couponCode) {
      const res = await this.discountOffersService.validateAndApply(dto.couponCode, subtotal, true);
      discountAmount = res.discountAmount;
      couponCode = res.code;
    }

    const taxAmount = dto.taxAmount ?? 0;
    const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);

    const order = await this.orderModel.create({
      orderNumber: await this.nextOrderNumber(),
      userId: new Types.ObjectId(userId),
      items,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      status: 'confirmed',
      couponCode,
      shippingAddress: dto.shippingAddress ?? null,
      notes: dto.notes ?? null,
    });

    // Decrement stock for every purchased item
    await Promise.all(
      dto.items.map((i) => this.productsService.decrementStock(i.productId, i.quantity)),
    );

    return order;
  }

  /** Admin-created order on behalf of a walk-in / phone customer */
  async createForCustomer(dto: CreateOrderDto): Promise<OrderDocument> {
    if (!dto.customerId) throw new BadRequestException('customerId is required');
    if (!dto.items?.length) throw new BadRequestException('Cart is empty');

    const productIds = dto.items.map((i) => new Types.ObjectId(i.productId));
    const products = await this.productsService.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let subtotal = 0;
    const items = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      const totalPrice = product.price * item.quantity;
      subtotal += totalPrice;
      return {
        productId: new Types.ObjectId(item.productId),
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice,
      };
    });

    const taxAmount = dto.taxAmount ?? 0;
    const order = await this.orderModel.create({
      orderNumber: await this.nextOrderNumber(),
      customerId: new Types.ObjectId(dto.customerId),
      items,
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount: subtotal + taxAmount,
      status: 'confirmed',
    });

    await Promise.all(
      dto.items.map((i) => this.productsService.decrementStock(i.productId, i.quantity)),
    );

    return order;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    userId?: string;
    customerId?: string;
  }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 50, 200);
    const filter: Record<string, any> = {};

    if (query.status) filter.status = query.status;
    if (query.userId) filter.userId = new Types.ObjectId(query.userId);
    if (query.customerId) filter.customerId = new Types.ObjectId(query.customerId);
    if (query.search) {
      const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.orderNumber = rx;
    }

    const [items, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email')
        .populate('customerId', 'name')
        .populate('items.productId', 'name imageUrl sku')
        .exec(),
      this.orderModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findMine(userId: string, query: { page?: number; limit?: number; status?: string }) {
    return this.findAll({ ...query, userId });
  }

  async findOne(id: string): Promise<OrderDocument> {
    const order = await this.orderModel
      .findById(id)
      .populate('userId', 'name email')
      .populate('customerId', 'name')
      .populate('items.productId', 'name imageUrl sku')
      .exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderDto): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    if (dto.status) order.status = dto.status;
    if (dto.notes !== undefined) order.notes = dto.notes;
    await order.save();
    return order;
  }

  async remove(id: string): Promise<void> {
    const res = await this.orderModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Order not found');
  }

  async countAll(): Promise<number> {
    return this.orderModel.countDocuments();
  }

  private async nextOrderNumber(): Promise<string> {
    const count = await this.orderModel.countDocuments();
    return `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
}
