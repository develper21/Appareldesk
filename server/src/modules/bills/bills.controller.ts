import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@Controller('bills')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.billsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBillDto) {
    return this.billsService.create(dto);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBillDto) {
    return this.billsService.updateStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billsService.remove(id);
  }
}
