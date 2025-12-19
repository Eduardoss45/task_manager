import { NotificationsGateway } from '../notifications-gateway/notifications.gateway';
import { ClientProxy } from '@nestjs/microservices';
import { Injectable, Inject } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class HealthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('TASKS_SERVICE') private readonly tasksClient: ClientProxy,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly logger: LoggerService,
  ) {}

  async checkReadiness() {
    const auth = await this.checkAuth(this.authClient);
    const deps = await this.checkTasks(this.tasksClient);

    return {
      auth,
      tasks: deps.tasks,
      notifications: deps.notifications,
      audits: deps.audits,
      gateway: this.notificationsGateway.server ? 'up' : 'down',
    };
  }

  private async checkAuth(client: ClientProxy) {
    try {
      const response = await firstValueFrom(
        client.send({ cmd: 'auth-start' }, {}).pipe(timeout(2000)),
      );

      return response === 'up' ? 'up' : 'down';
    } catch (error) {
      this.logger.error('Auth service health check failed');
      return 'down';
    }
  }

  private async checkTasks(client: ClientProxy) {
    try {
      return await firstValueFrom<{
        tasks: 'up' | 'down';
        notifications: 'up' | 'down';
        audits: 'up' | 'down';
      }>(client.send({ cmd: 'tasks-start' }, {}).pipe(timeout(2000)));
    } catch (error) {
      this.logger.error('Tasks service health check failed');

      return {
        tasks: 'down',
        notifications: 'down',
        audits: 'down',
      };
    }
  }
}
