import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(@InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>) {}

  async create(dto: CreatePaymentDto): Promise<PaymentDocument> {
    return this.paymentModel.create({
      paymentNumber: await this.nextPaymentNumber(),
      paymentType: dto.paymentType,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod ?? 'cash',
      contactId: dto.contactId ? new Types.ObjectId(dto.contactId) : null,
      invoiceId: dto.invoiceId ? new Types.ObjectId(dto.invoiceId) : null,
      billId: dto.billId ? new Types.ObjectId(dto.billId) : null,
      paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
      referenceNumber: dto.referenceNumber ?? null,
      notes: dto.notes ?? null,
    });
  }

  async findAll(query: { page?: number; limit?: number; paymentType?: string }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 50, 200);
    const filter: Record<string, any> = {};

    if (query.paymentType) filter.paymentType = query.paymentType;

    const [items, total] = await Promise.all([
      this.paymentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('contactId', 'name contactType')
        .exec(),
      this.paymentModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(id).populate('contactId', 'name contactType').exec();
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async remove(id: string): Promise<void> {
    const res = await this.paymentModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Payment not found');
  }

  async sumByType(type: 'incoming' | 'outgoing'): Promise<number> {
    const result = await this.paymentModel.aggregate<{ _id: null; total: number }>([
      { $match: { paymentType: type } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  private async nextPaymentNumber(): Promise<string> {
    const count = await this.paymentModel.countDocuments();
    return `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
}
