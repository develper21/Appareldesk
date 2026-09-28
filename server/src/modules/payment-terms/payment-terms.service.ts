import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentTerm, PaymentTermDocument } from './payment-term.schema';
import { CreatePaymentTermDto, UpdatePaymentTermDto } from './dto/payment-term.dto';

@Injectable()
export class PaymentTermsService {
  constructor(
    @InjectModel(PaymentTerm.name) private readonly paymentTermModel: Model<PaymentTermDocument>,
  ) {}

  async create(dto: CreatePaymentTermDto): Promise<PaymentTermDocument> {
    return this.paymentTermModel.create(dto);
  }

  async findAll(query: { includeInactive?: boolean } = {}): Promise<PaymentTermDocument[]> {
    const filter: Record<string, any> = query.includeInactive ? {} : { isActive: true };
    return this.paymentTermModel.find(filter).sort({ days: 1 }).exec();
  }

  async findOne(id: string): Promise<PaymentTermDocument> {
    const term = await this.paymentTermModel.findById(id).exec();
    if (!term) throw new NotFoundException('Payment term not found');
    return term;
  }

  async update(id: string, dto: UpdatePaymentTermDto): Promise<PaymentTermDocument> {
    const term = await this.paymentTermModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!term) throw new NotFoundException('Payment term not found');
    return term;
  }

  async remove(id: string): Promise<void> {
    const res = await this.paymentTermModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Payment term not found');
  }

  async countActive(): Promise<number> {
    return this.paymentTermModel.countDocuments({ isActive: true });
  }
}
