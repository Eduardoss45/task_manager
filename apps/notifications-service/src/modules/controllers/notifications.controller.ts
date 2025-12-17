import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { NotificationsService } from '../services/notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @EventPattern('task.created')
  onTaskCreated(data: any) {
    return this.service.handleTaskCreated(data);
  }

  @EventPattern('task.updated')
  onTaskUpdated(data: any) {
    return this.service.handleTaskUpdated(data);
  }

  @EventPattern('task.comment.created')
  onCommentCreated(data: any) {
    return this.service.handleCommentCreated(data);
  }

  @MessagePattern({ cmd: 'notifications-start' })
  notificationsHealthCheck() {
    return this.service.healthCheckNotificationsDatabase();
  }
}
