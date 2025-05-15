import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { CatalogModule } from './catalog.module';

async function bootstrap() {
  const app = await NestFactory.create(CatalogModule);
  const configService = app.get(ConfigService);
  
  // Get configuration
  const port = configService.get<number>('CATALOG_SERVICE_PORT', 3002);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '').split(',');
  
  // Apply global middlewares
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Set API prefix
  app.setGlobalPrefix(apiPrefix);
  
  await app.listen(port);
  console.log(`Catalog service running on port ${port}`);
}

bootstrap();
