import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceSchema } from './invoice.schema';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]), OrdersModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
