import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bill, BillDocument } from './bill.schema';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';

@Injectable()
export class BillsService {
  constructor(@InjectModel(Bill.name) private readonly billModel: Model<BillDocument>) {}

  async create(dto: CreateBillDto): Promise<BillDocument> {
    const taxAmount = dto.taxAmount ?? 0;
    return this.billModel.create({
      billNumber: await this.nextBillNumber(),
      vendorId: new Types.ObjectId(dto.vendorId),
      purchaseOrderId: dto.purchaseOrderId ? new Types.ObjectId(dto.purchaseOrderId) : null,
      subtotal: dto.subtotal,
      taxAmount,
      totalAmount: dto.subtotal + taxAmount,
      status: 'draft',
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      notes: dto.notes ?? null,
    });
  }

  async findAll(query: { page?: number; limit?: number; status?: string }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 50, 200);
    const filter: Record<string, any> = {};

    if (query.status) filter.status = query.status;

    const [items, total] = await Promise.all([
      this.billModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('vendorId', 'name company')
        .exec(),
      this.billModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<BillDocument> {
    const bill = await this.billModel.findById(id).populate('vendorId', 'name company').exec();
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async updateStatus(id: string, dto: UpdateBillDto): Promise<BillDocument> {
    const bill = await this.billModel.findById(id);
    if (!bill) throw new NotFoundException('Bill not found');
    if (dto.status) bill.status = dto.status;
    if (dto.status === 'paid' && !bill.paidAt) bill.paidAt = new Date();
    if (dto.notes !== undefined) bill.notes = dto.notes;
    await bill.save();
    return bill;
  }

  async remove(id: string): Promise<void> {
    const res = await this.billModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Bill not found');
  }

  async countAll(): Promise<number> {
    return this.billModel.countDocuments();
  }

  private async nextBillNumber(): Promise<string> {
    const count = await this.billModel.countDocuments();
    return `BILL-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
}
