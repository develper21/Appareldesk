import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ collection: 'notifications', timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  userId: Types.ObjectId | null; // null = broadcast to admins

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: ['order', 'inventory', 'payment', 'customer', 'system', 'marketing'],
    default: 'system',
  })
  type: 'order' | 'inventory' | 'payment' | 'customer' | 'system' | 'marketing';

  @Prop({ type: String, enum: ['high', 'medium', 'low'], default: 'low' })
  priority: 'high' | 'medium' | 'low';

  @Prop({ default: false, index: true })
  read: boolean;

  @Prop({ type: String, required: false })
  actionUrl?: string | null;

  @Prop({ type: String, required: false })
  actionText?: string | null;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
