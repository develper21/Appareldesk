import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DiscountOffersService } from './discount-offers.service';
import { CreateDiscountOfferDto, UpdateDiscountOfferDto } from './dto/discount-offer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@Controller('discount-offers')
export class DiscountOffersController {
  constructor(private readonly discountOffersService: DiscountOffersService) {}

  /** Public: preview a coupon at cart (no auth needed) */
  @Post('preview')
  preview(@Body() body: { code: string; subtotal: number }) {
    return this.discountOffersService.preview(body.code, body.subtotal);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(@Query() query: { includeInactive?: string }) {
    return this.discountOffersService.findAll({ includeInactive: query.includeInactive === 'true' });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.discountOffersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateDiscountOfferDto) {
    return this.discountOffersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateDiscountOfferDto) {
    return this.discountOffersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.discountOffersService.remove(id);
  }
}
