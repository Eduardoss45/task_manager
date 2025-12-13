import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsGatewayController } from './notifications-gateway.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_RMQ',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL!],
          queue: 'gateway_notifications_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [NotificationsGatewayController],
  providers: [NotificationsGateway],
})
export class NotificationsModule {}
