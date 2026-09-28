import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PurchaseOrder, PurchaseOrderDocument } from './purchase-order.schema';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto/purchase-order.dto';
import { ContactsService } from '../contacts/contacts.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectModel(PurchaseOrder.name) private readonly poModel: Model<PurchaseOrderDocument>,
    private readonly contactsService: ContactsService,
    private readonly productsService: ProductsService,
  ) {}

  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrderDocument> {
    const vendor = await this.contactsService.findOne(dto.vendorId);
    if (vendor.contactType !== 'vendor') {
      throw new BadRequestException('Selected contact is not a vendor');
    }

    let subtotal = 0;
    const items = dto.items.map((i) => {
      const totalPrice = i.unitPrice * i.quantity;
      subtotal += totalPrice;
      return {
        productId: new Types.ObjectId(i.productId),
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice,
      };
    });

    const taxAmount = dto.taxAmount ?? 0;
    return this.poModel.create({
      poNumber: await this.nextPoNumber(),
      vendorId: new Types.ObjectId(dto.vendorId),
      items,
      subtotal,
      taxAmount,
      totalAmount: subtotal + taxAmount,
      status: 'draft',
      notes: dto.notes ?? null,
    });
  }

  async findAll(query: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 50, 200);
    const filter: Record<string, any> = {};

    if (query.status) filter.status = query.status;
    if (query.search) {
      const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.poNumber = rx;
    }

    const [items, total] = await Promise.all([
      this.poModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('vendorId', 'name company')
        .exec(),
      this.poModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<PurchaseOrderDocument> {
    const po = await this.poModel.findById(id).populate('vendorId', 'name company').exec();
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async updateStatus(id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrderDocument> {
    const po = await this.poModel.findById(id);
    if (!po) throw new NotFoundException('Purchase order not found');

    const previous = po.status;
    if (dto.status) po.status = dto.status;
    if (dto.notes !== undefined) po.notes = dto.notes;
    await po.save();

    // When a PO is marked received, increment product stock
    if (previous !== 'received' && dto.status === 'received') {
      await Promise.all(
        po.items.map((i) =>
          this.productsService.incrementStock((i.productId as any).toString(), i.quantity),
        ),
      );
    }

    return po;
  }

  async remove(id: string): Promise<void> {
    const res = await this.poModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Purchase order not found');
  }

  async countAll(): Promise<number> {
    return this.poModel.countDocuments();
  }

  private async nextPoNumber(): Promise<string> {
    const count = await this.poModel.countDocuments();
    return `PO-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
}
