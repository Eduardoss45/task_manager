import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationRepository } from '../repositories/notifications.repository';
import { LoggerService } from '../logger';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notifications: NotificationRepository,

    @Inject('GATEWAY_NOTIFICATIONS_CLIENT')
    private readonly gatewayClient: ClientProxy,

    private readonly logger: LoggerService,
  ) {}

  private async persistAndDispatch(userId: string, type: string, payload: any) {
    try {
      await this.notifications.create({ userId, type, payload });
      this.logger.info(`Notification persisted`, { userId, type });

      this.gatewayClient.emit('notification.dispatch', {
        userId,
        type,
        payload,
      });
      this.logger.info(`Notification dispatched`, { userId, type });
    } catch (err) {
      this.logger.error(
        `Failed to persist or dispatch notification`,
        err,
        `persistAndDispatch`,
      );
      throw err;
    }
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

    this.logger.info('Handling task.created event', {
      taskId: task.id,
      recipients,
    });

    await Promise.all(
      recipients.map((userId) =>
        this.persistAndDispatch(userId, 'task:created', event),
      ),
    );

    this.logger.info(`task.created dispatched`, {
      taskId: task.id,
      recipients,
    });
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

    this.logger.info('Handling task.updated event', {
      taskId: task.id,
      recipients,
    });

    await Promise.all(
      [...recipients].map((userId) =>
        this.persistAndDispatch(userId, 'task:updated', event),
      ),
    );

    this.logger.info(`task.updated dispatched`, {
      taskId: task.id,
      recipients: [...recipients],
    });
  }

  async handleCommentCreated(event: any) {
    const { actorId, task } = event;
    const assignedIds = this.normalizeUserIds(task.assignedUserIds ?? []);
    const recipients = new Set<string>([task.ownerId, ...assignedIds]);
    recipients.delete(actorId);

    this.logger.info('Handling comment.new event', {
      taskId: task.id,
      recipients,
    });

    await Promise.all(
      [...recipients].map((userId) =>
        this.persistAndDispatch(userId, 'comment:new', event),
      ),
    );

    this.logger.info(`comment.new dispatched`, {
      taskId: task.id,
      recipients: [...recipients],
    });
  }

  async healthCheckNotificationsDatabase(): Promise<'up' | 'down'> {
    this.logger.info('Running notifications DB health check');

    const requiredVars = ['RMQ_URL', 'DATABASE_URL'];
    const missingVars = requiredVars.filter((v) => !process.env[v]);

    if (missingVars.length > 0) {
      this.logger.warn(
        `Missing environment variables: ${missingVars.join(', ')}`,
      );
      return 'down';
    }

    try {
      const dbNotificationsStatus =
        await this.notifications.checkDatabaseHealthNotifications();
      this.logger.info('Notifications DB health check completed', {
        status: dbNotificationsStatus ? 'up' : 'down',
      });
      return dbNotificationsStatus ? 'up' : 'down';
    } catch (err) {
      this.logger.error(
        'Notifications DB health check failed',
        err,
        'healthCheckNotificationsDatabase',
      );
      return 'down';
    }
  }
}
