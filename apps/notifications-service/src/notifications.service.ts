import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationRepository } from './entity/repository/notifications.repository';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notifications: NotificationRepository,

    @Inject('GATEWAY_NOTIFICATIONS_CLIENT')
    private readonly gatewayClient: ClientProxy,
  ) {}

  private async persistAndDispatch(userId: string, type: string, payload: any) {
    await this.notifications.create({
      userId,
      type,
      payload,
    });

    this.gatewayClient.emit('notification.dispatch', {
      userId,
      type,
      payload,
    });
  }

  async handleTaskCreated(event: any) {
    const { actorId, task } = event;

    const recipients = task.assignedUserIds.filter(
      (id: string) => id !== actorId,
    );

    await Promise.all(
      recipients.map((userId) =>
        this.persistAndDispatch(userId, 'task:created', event),
      ),
    );

    this.logger.log(`task.created → dispatched to ${recipients.join(', ')}`);
  }

  async handleTaskUpdated(event: any) {
    const { actorId, task, before, after } = event;

    const recipients = new Set<string>();

    const newAssignees = after.assignedUserIds.filter(
      (id: string) => !before.assignedUserIds.includes(id),
    );

    newAssignees.forEach((id) => recipients.add(id));

    if (before.status !== after.status) {
      recipients.add(task.ownerId);
    }

    recipients.delete(actorId);

    await Promise.all(
      [...recipients].map((userId) =>
        this.persistAndDispatch(userId, 'task:updated', event),
      ),
    );

    this.logger.log(
      `task.updated → dispatched to ${[...recipients].join(', ')}`,
    );
  }

  async handleCommentCreated(event: any) {
    const { actorId, task } = event;

    const recipients = new Set<string>([task.ownerId, ...task.assignedUserIds]);

    recipients.delete(actorId);

    await Promise.all(
      [...recipients].map((userId) =>
        this.persistAndDispatch(userId, 'comment:new', event),
      ),
    );

    this.logger.log(
      `comment.new → dispatched to ${[...recipients].join(', ')}`,
    );
  }
}
