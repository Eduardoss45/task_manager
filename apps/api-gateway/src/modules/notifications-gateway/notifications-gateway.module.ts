import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsGatewayController } from './notifications-gateway.controller';

@Module({
  controllers: [NotificationsGatewayController],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
