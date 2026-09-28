import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentTermsService } from './payment-terms.service';
import { CreatePaymentTermDto, UpdatePaymentTermDto } from './dto/payment-term.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@Controller('payment-terms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PaymentTermsController {
  constructor(private readonly paymentTermsService: PaymentTermsService) {}

  @Get()
  findAll(@Query() query: { includeInactive?: string }) {
    return this.paymentTermsService.findAll({ includeInactive: query.includeInactive === 'true' });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentTermsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePaymentTermDto) {
    return this.paymentTermsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentTermDto) {
    return this.paymentTermsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentTermsService.remove(id);
  }
}
