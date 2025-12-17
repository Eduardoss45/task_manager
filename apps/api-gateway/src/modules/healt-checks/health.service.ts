import { NotificationsGateway } from '../notifications-gateway/notifications.gateway';
import { ClientProxy } from '@nestjs/microservices';
import { Injectable, Inject } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class HealthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('TASKS_SERVICE') private readonly tasksClient: ClientProxy,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async checkReadiness() {
    return {
      auth: await this.checkAuth(this.authClient),
      tasks_and_notifications: await this.checkTasks(this.tasksClient),
      gateway: this.notificationsGateway.server ? 'up' : 'down',
    };
  }

  private async checkAuth(client: ClientProxy) {
    try {
      const response = await firstValueFrom(
        client.send({ cmd: 'auth-start' }, {}).pipe(timeout(2000)),
      );
      return response === 'up' ? 'up' : 'down';
    } catch {
      return 'down';
    }
  }

  private async checkTasks(client: ClientProxy) {
    try {
      const response = await firstValueFrom(
        client.send({ cmd: 'tasks-start' }, {}).pipe(timeout(2000)),
      );
      return response === 'up' ? 'up' : 'down';
    } catch {
      return 'down';
    }
  }
}
