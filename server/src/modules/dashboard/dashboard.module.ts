import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order, OrderSchema } from '../orders/order.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { Contact, ContactSchema } from '../contacts/contact.schema';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Contact.name, schema: ContactSchema },
    ]),
    PaymentsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
