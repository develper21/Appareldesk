import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './contact.schema';
import { CreateContactDto } from './dto/contact.dto';
import { UpdateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(@InjectModel(Contact.name) private readonly contactModel: Model<ContactDocument>) {}

  async create(dto: CreateContactDto): Promise<ContactDocument> {
    return this.contactModel.create(dto);
  }

  async findAll(query: { page?: number; limit?: number; search?: string; contactType?: string }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 100, 200);
    const filter: Record<string, any> = {};

    if (query.search) {
      const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { company: rx }, { phone: rx }];
    }
    if (query.contactType) filter.contactType = query.contactType;

    const [items, total] = await Promise.all([
      this.contactModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.contactModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<ContactDocument> {
    const contact = await this.contactModel.findById(id).exec();
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(id: string, dto: UpdateContactDto): Promise<ContactDocument> {
    const contact = await this.contactModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async remove(id: string): Promise<void> {
    const res = await this.contactModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Contact not found');
  }

  async countByType(type: 'customer' | 'vendor'): Promise<number> {
    return this.contactModel.countDocuments({ contactType: type });
  }
}
