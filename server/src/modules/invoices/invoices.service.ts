import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from './invoice.schema';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
    private readonly ordersService: OrdersService,
  ) {}

  async create(dto: CreateInvoiceDto): Promise<InvoiceDocument> {
    let subtotal = dto.subtotal;
    let totalAmount = dto.subtotal + (dto.taxAmount ?? 0) - (dto.discountAmount ?? 0);
    let customerId = dto.customerId ? new Types.ObjectId(dto.customerId) : null;

    // If created from an order, copy totals from the order
    if (dto.orderId) {
      const order = await this.ordersService.findOne(dto.orderId);
      subtotal = order.subtotal;
      totalAmount = order.totalAmount;
      customerId = (order.customerId as any) ?? ((order.userId as any)?._id ?? null);
    }

    return this.invoiceModel.create({
      invoiceNumber: await this.nextInvoiceNumber(),
      orderId: dto.orderId ? new Types.ObjectId(dto.orderId) : null,
      customerId,
      userId: null,
      subtotal,
      taxAmount: dto.taxAmount ?? 0,
      discountAmount: dto.discountAmount ?? 0,
      totalAmount,
      status: 'draft',
      notes: dto.notes ?? null,
    });
  }

  async findAll(query: { page?: number; limit?: number; status?: string; userId?: string }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 50, 200);
    const filter: Record<string, any> = {};

    if (query.status) filter.status = query.status;
    if (query.userId) filter.userId = new Types.ObjectId(query.userId);

    const [items, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('customerId', 'name')
        .populate('orderId', 'orderNumber')
        .exec(),
      this.invoiceModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findMine(userId: string, query: { page?: number; limit?: number }) {
    return this.findAll({ ...query, userId });
  }

  async findOne(id: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate('customerId', 'name')
      .populate('orderId', 'orderNumber items')
      .exec();
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async updateStatus(id: string, dto: UpdateInvoiceDto): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (dto.status) invoice.status = dto.status;
    if (dto.status === 'paid' && !invoice.paidAt) invoice.paidAt = new Date();
    if (dto.notes !== undefined) invoice.notes = dto.notes;
    await invoice.save();
    return invoice;
  }

  async remove(id: string): Promise<void> {
    const res = await this.invoiceModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Invoice not found');
  }

  async countAll(): Promise<number> {
    return this.invoiceModel.countDocuments();
  }

  private async nextInvoiceNumber(): Promise<string> {
    const count = await this.invoiceModel.countDocuments();
    return `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
}
