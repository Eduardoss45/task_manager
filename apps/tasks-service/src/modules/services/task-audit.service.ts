import { Injectable } from '@nestjs/common';
import { TaskAuditRepository } from '../repositories/task-audit.repository';
import { TaskAuditAction } from '../enums';
import { LoggerService } from '../logger';

@Injectable()
export class TaskAuditService {
  constructor(
    private readonly repo: TaskAuditRepository,
    private readonly logger: LoggerService,
  ) {}

  async log(
    action: TaskAuditAction,
    taskId: string,
    before: any,
    after: any,
    actorId?: string,
    actorName?: string,
  ) {
    this.logger.info('Logging audit action', {
      action,
      taskId,
      actorId,
      actorName,
    });

    return this.repo.create({
      action,
      taskId,
      before,
      after,
      actorId: actorId ?? 'system',
      actorName: actorName ?? 'system',
    });
  }

  async getByTask(taskId: string, limit = 5) {
    this.logger.info('Fetching audit logs', { taskId, limit });
    return this.repo.findByTask(taskId, limit);
  }

  async healthCheckAuditDatabase(): Promise<'up' | 'down'> {
    this.logger.info('Checking audit DB health');
    const dbAuditStatus = await this.repo.checkDatabaseHealthAudit();
    const status = dbAuditStatus ? 'up' : 'down';
    this.logger.info('Audit DB health status', { status });
    return status;
  }
}
