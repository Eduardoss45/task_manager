import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsGateway } from './notifications.gateway';
import { LoggerService } from '@task_manager/logger';

@Controller()
export class NotificationsGatewayController {
  constructor(
    private readonly gateway: NotificationsGateway,
    private readonly logger: LoggerService,
  ) {}

  @EventPattern('notification.dispatch')
  handleNotification(@Payload() data: any) {
    const { userId, type, payload } = data;

    this.logger.info('Notification dispatch received', {
      userId,
      type,
    });

    this.gateway.emitToUser(userId, 'notification', {
      type,
      payload,
    });
  }
}
