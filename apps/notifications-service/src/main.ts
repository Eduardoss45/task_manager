import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(NotificationsModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URL!],
      queue: 'notifications_queue',
      queueOptions: { durable: true },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen();
  console.log('Notifications microservice listening to RabbitMQ...');
}

bootstrap();
