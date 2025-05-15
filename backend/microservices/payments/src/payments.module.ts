import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PaymentController } from './controllers/payment.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { WebhookController } from './controllers/webhook.controller';
import { TransactionController } from './controllers/transaction.controller';
import { PaymentService } from './services/payment.service';
import { SubscriptionService } from './services/subscription.service';
import { AsaasService } from './services/asaas.service';
import { TransactionService } from './services/transaction.service';
import { Payment } from './entities/payment.entity';
import { Subscription } from './entities/subscription.entity';
import { Transaction } from './entities/transaction.entity';
import { PaymentRepository } from './repositories/payment.repository';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { TransactionRepository } from './repositories/transaction.repository';

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
        entities: [Payment, Subscription, Transaction],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    TypeOrmModule.forFeature([Payment, Subscription, Transaction]),
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
  controllers: [PaymentController, SubscriptionController, WebhookController, TransactionController],
  providers: [
    PaymentService, 
    SubscriptionService, 
    AsaasService,
    TransactionService,
    PaymentRepository,
    SubscriptionRepository,
    TransactionRepository
  ],
})
export class PaymentsModule {}
