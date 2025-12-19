import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { NotificationsController } from './modules/controllers/notifications.controller';
import { NotificationsService } from './modules/services/notifications.service';
import { Notification } from './modules/entities/notifications.entity';
import { NotificationRepository } from './modules/repositories/notifications.repository';
import { LoggerService } from './modules/logger';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ClientsModule.register([
      {
        name: 'GATEWAY_NOTIFICATIONS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL!],
          queue: 'gateway_notifications_queue',
          queueOptions: { durable: true },
        },
      },
    ]),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
    }),

    TypeOrmModule.forFeature([Notification]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationRepository,
    {
      provide: LoggerService,
      useValue: new LoggerService({ service: 'NotificationsService' }),
    },
  ],
})
export class NotificationsModule {}
