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

  private normalizeUserIds(
    users: Array<string | { userId: string }>,
  ): string[] {
    return users.map((u) => (typeof u === 'string' ? u : u.userId));
  }

  async handleTaskCreated(event: any) {
    const { actorId, task } = event;

    const assignedIds = this.normalizeUserIds(task.assignedUserIds ?? []);

    const recipients = assignedIds.filter((id) => id !== actorId);

    await Promise.all(
      recipients.map((userId) =>
        this.persistAndDispatch(userId, 'task:created', event),
      ),
    );

    this.logger.log(`task.created → dispatched to ${recipients.join(', ')}`);
  }

  async handleTaskUpdated(event: any) {
    const { actorId, task, before, after } = event;

    const beforeAssignedIds = this.normalizeUserIds(
      before.assignedUserIds ?? [],
    );

    const afterAssignedIds = this.normalizeUserIds(after.assignedUserIds ?? []);

    const recipients = new Set<string>();

    const newAssignees = afterAssignedIds.filter(
      (id) => !beforeAssignedIds.includes(id),
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

    const assignedIds = this.normalizeUserIds(task.assignedUserIds ?? []);

    const recipients = new Set<string>([task.ownerId, ...assignedIds]);

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
