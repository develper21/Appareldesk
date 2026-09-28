import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({ collection: 'settings', timestamps: true })
export class Setting {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  store: Record<string, any>;

  @Prop({ type: Object, default: {} })
  notifications: Record<string, any>;

  @Prop({ type: Object, default: {} })
  appearance: Record<string, any>;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
