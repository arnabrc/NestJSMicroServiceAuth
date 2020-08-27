import {Transport} from '@nestjs/microservices/enums';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 4000
    }
  })

  await app.startAllMicroservicesAsync();
  await app.listen(3000);
  Logger.log('Auth microservice running');
}
bootstrap();
