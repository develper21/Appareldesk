import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ type: String, required: false })
  phone?: string;

  @Prop({ type: String, required: false })
  avatarUrl?: string;

  @Prop({ type: String, enum: ['admin', 'user'], default: 'user' })
  role: 'admin' | 'user';

  @Prop({
    type: [
      {
        label: { type: String, default: 'Home' },
        line1: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        isDefault: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  addresses: Array<{
    label: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
}

export const UserSchema = SchemaFactory.createForClass(User);
