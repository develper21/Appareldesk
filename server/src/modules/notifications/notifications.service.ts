import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<NotificationDocument> {
    return this.notificationModel.create({
      userId: dto.userId ? new Types.ObjectId(dto.userId) : null,
      title: dto.title,
      message: dto.message,
      type: dto.type ?? 'system',
      priority: dto.priority ?? 'low',
      actionUrl: dto.actionUrl ?? null,
      actionText: dto.actionText ?? null,
    });
  }

  /** Admin sees broadcasts (userId null) + their own; user sees only their own */
  async findAllFor(userId: string, isAdmin: boolean, query: { unreadOnly?: boolean }) {
    const filter: Record<string, any> = isAdmin
      ? { $or: [{ userId: null }, { userId: new Types.ObjectId(userId) }] }
      : { userId: new Types.ObjectId(userId) };

    if (query.unreadOnly) filter.read = false;

    return this.notificationModel.find(filter).sort({ createdAt: -1 }).limit(100).exec();
  }

  async markRead(id: string, dto: UpdateNotificationDto): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findByIdAndUpdate(id, { read: dto.read ?? true }, { new: true }).exec();
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async markAllRead(userId: string, isAdmin: boolean): Promise<void> {
    const filter: Record<string, any> = isAdmin
      ? { $or: [{ userId: null }, { userId: new Types.ObjectId(userId) }] }
      : { userId: new Types.ObjectId(userId) };
    await this.notificationModel.updateMany(filter, { read: true });
  }

  async remove(id: string): Promise<void> {
    const res = await this.notificationModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Notification not found');
  }

  async countUnread(userId: string, isAdmin: boolean): Promise<number> {
    const filter: Record<string, any> = isAdmin
      ? { $or: [{ userId: null }, { userId: new Types.ObjectId(userId) }], read: false }
      : { userId: new Types.ObjectId(userId), read: false };
    return this.notificationModel.countDocuments(filter);
  }
}
