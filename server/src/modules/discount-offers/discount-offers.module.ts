import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscountOffersController } from './discount-offers.controller';
import { DiscountOffersService } from './discount-offers.service';
import { DiscountOffer, DiscountOfferSchema } from './discount-offer.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: DiscountOffer.name, schema: DiscountOfferSchema }])],
  controllers: [DiscountOffersController],
  providers: [DiscountOffersService],
  exports: [DiscountOffersService],
})
export class DiscountOffersModule {}
