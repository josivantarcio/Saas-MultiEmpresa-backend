import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CartController } from './controllers/cart.controller';
import { OrderController } from './controllers/order.controller';
import { CheckoutController } from './controllers/checkout.controller';
import { CartService } from './services/cart.service';
import { OrderService } from './services/order.service';
import { CheckoutService } from './services/checkout.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ShippingMethod } from './entities/shipping-method.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { CartRepository } from './repositories/cart.repository';
import { OrderRepository } from './repositories/order.repository';
import { ShippingMethodRepository } from './repositories/shipping-method.repository';
import { PaymentMethodRepository } from './repositories/payment-method.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [Cart, CartItem, Order, OrderItem, ShippingMethod, PaymentMethod],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    TypeOrmModule.forFeature([Cart, CartItem, Order, OrderItem, ShippingMethod, PaymentMethod]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
    }),
  ],
  controllers: [CartController, OrderController, CheckoutController],
  providers: [
    CartService,
    OrderService,
    CheckoutService,
    CartRepository,
    OrderRepository,
    ShippingMethodRepository,
    PaymentMethodRepository,
  ],
})
export class CheckoutModule {}
