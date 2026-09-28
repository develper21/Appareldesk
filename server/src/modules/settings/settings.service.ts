import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './setting.schema';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Setting.name) private readonly settingModel: Model<SettingDocument>) {}

  async getForUser(userId: string): Promise<SettingDocument> {
    let setting = await this.settingModel.findOne({ userId: userId as any });
    if (!setting) {
      setting = await this.settingModel.create({ userId: userId as any });
    }
    return setting;
  }

  async updateForUser(userId: string, patch: Partial<{ store: Record<string, any>; notifications: Record<string, any>; appearance: Record<string, any> }>): Promise<SettingDocument> {
    await this.getForUser(userId); // ensure exists
    const setting = await this.settingModel.findOneAndUpdate(
      { userId: userId as any },
      { $set: patch },
      { new: true, upsert: true },
    );
    return setting;
  }
}
