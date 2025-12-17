import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URL!],
      queue: 'notifications_events_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.init();

  console.log('Notifications listening...');
}
bootstrap();
