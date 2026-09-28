import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard, JwtPayload } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get(@CurrentUser() user: JwtPayload) {
    return this.settingsService.getForUser(user.sub);
  }

  @Patch()
  update(
    @CurrentUser() user: JwtPayload,
    @Body() body: Partial<{ store: Record<string, any>; notifications: Record<string, any>; appearance: Record<string, any> }>,
  ) {
    return this.settingsService.updateForUser(user.sub, body);
  }
}
