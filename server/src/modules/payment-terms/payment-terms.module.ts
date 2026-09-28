import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentTermsController } from './payment-terms.controller';
import { PaymentTermsService } from './payment-terms.service';
import { PaymentTerm, PaymentTermSchema } from './payment-term.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: PaymentTerm.name, schema: PaymentTermSchema }])],
  controllers: [PaymentTermsController],
  providers: [PaymentTermsService],
  exports: [PaymentTermsService],
})
export class PaymentTermsModule {}
