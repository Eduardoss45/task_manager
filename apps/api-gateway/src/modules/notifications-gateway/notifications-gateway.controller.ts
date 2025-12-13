import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsGateway } from './notifications.gateway';

@Controller()
export class NotificationsGatewayController {
  constructor(private readonly gateway: NotificationsGateway) {}

  @EventPattern('notification.dispatch')
  handleNotification(@Payload() data: any) {
    const { userId, type, payload } = data;

    this.gateway.emitToUser(userId, 'notification', {
      type,
      payload,
    });
  }
}
