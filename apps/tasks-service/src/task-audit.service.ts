import { Injectable } from '@nestjs/common';
import { TaskAuditRepository } from './entity/repository/task-audit.repository';
import { TaskAuditAction } from '@TaskManager/enums';

@Injectable()
export class TaskAuditService {
  constructor(private readonly repo: TaskAuditRepository) {}

  async log(
    action: TaskAuditAction,
    taskId: string,
    before: any,
    after: any,
    actorId?: string,
    actorName?: string,
  ) {
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
    return this.repo.findByTask(taskId, limit);
  }
}
