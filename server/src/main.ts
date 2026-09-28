import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  const config = app.get(ConfigService);

  app.setGlobalPrefix(config.get<string>('API_PREFIX', 'api'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.use(helmet());
  app.use(cookieParser());

  const origins = (config.get<string>('CORS_ORIGINS', 'http://localhost:8080') || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  const port = Number(process.env.PORT) || Number(config.get('PORT')) || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 ApparelDesk API running at http://localhost:${port}/${config.get('API_PREFIX', 'api')}`);
}

bootstrap();
