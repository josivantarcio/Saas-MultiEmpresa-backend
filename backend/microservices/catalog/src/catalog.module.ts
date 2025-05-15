import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ProductController } from './controllers/product.controller';
import { CategoryController } from './controllers/category.controller';
import { AttributeController } from './controllers/attribute.controller';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { AttributeService } from './services/attribute.service';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Attribute } from './entities/attribute.entity';
import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from './repositories/category.repository';
import { AttributeRepository } from './repositories/attribute.repository';

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
        entities: [Product, Category, Attribute],
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
    TypeOrmModule.forFeature([Product, Category, Attribute]),
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
  controllers: [ProductController, CategoryController, AttributeController],
  providers: [
    ProductService, 
    CategoryService, 
    AttributeService,
    ProductRepository,
    CategoryRepository,
    AttributeRepository
  ],
})
export class CatalogModule {}
