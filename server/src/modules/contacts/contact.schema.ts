import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactDocument = HydratedDocument<Contact>;

@Schema({ collection: 'contacts', timestamps: true })
export class Contact {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: ['customer', 'vendor'], required: true })
  contactType: 'customer' | 'vendor';

  @Prop({ type: String, required: false, trim: true })
  company?: string;

  @Prop({ type: String, required: false, trim: true })
  email?: string;

  @Prop({ type: String, required: false, trim: true })
  phone?: string;

  @Prop({ type: String, required: false, trim: true })
  address?: string;

  @Prop({ type: String, required: false, trim: true })
  city?: string;

  @Prop({ type: String, required: false, trim: true })
  state?: string;

  @Prop({ type: String, required: false, trim: true })
  pincode?: string;

  @Prop({ type: String, required: false, trim: true })
  gstNumber?: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
