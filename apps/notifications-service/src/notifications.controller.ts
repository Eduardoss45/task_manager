import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

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
}
