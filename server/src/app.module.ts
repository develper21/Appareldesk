import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { BillsModule } from './modules/bills/bills.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PaymentTermsModule } from './modules/payment-terms/payment-terms.module';
import { DiscountOffersModule } from './modules/discount-offers/discount-offers.module';
import { WishlistsModule } from './modules/wishlists/wishlists.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { JwtGlobalModule } from './common/jwt-global.module';
import { HealthController } from './health.controller';

/**
 * Which env file the API loads (first match wins):
 *   production build/runtime  ->  .env.production, then .env, then .env.local
 *   development               ->  .env.local, then .env
 * Real values live in .env.local (dev) / .env.production (prod); .env.example stays a reference.
 */
const envFilePath =
  process.env.NODE_ENV === 'production'
    ? ['.env.production', '.env', '.env.local']
    : ['.env.local', '.env'];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        let uri = config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/appareldesk');
        // Atlas URIs may arrive without a database name (trailing '/') —
        // Mongoose would then silently use the "test" database. Default to "appareldesk".
        if (/^mongodb(\+srv)?:\/\/[^/]+\/?$/.test(uri)) {
          uri = uri.replace(/\/?$/, '/appareldesk');
        }
        return { uri };
      },
    }),
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 300 }, // 300 requests per minute per IP
    ]),
    JwtGlobalModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    ContactsModule,
    OrdersModule,
    PurchaseOrdersModule,
    InvoicesModule,
    BillsModule,
    PaymentsModule,
    PaymentTermsModule,
    DiscountOffersModule,
    WishlistsModule,
    NotificationsModule,
    SettingsModule,
    DashboardModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
