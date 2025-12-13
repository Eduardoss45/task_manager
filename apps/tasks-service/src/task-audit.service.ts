import { Injectable } from '@nestjs/common';
import { TaskAuditRepository } from './entity/repository/task-audit.repository';

@Injectable()
export class TaskAuditService {
  constructor(private readonly repo: TaskAuditRepository) {}

  async log(
    action: string,
    taskId: string,
    before: any,
    after: any,
    authorId?: string,
  ) {
    const record = {
      action,
      taskId,
      before: before ?? null,
      after: after ?? null,
      authorId: authorId ?? 'system',
    };
    return this.repo.create(record);
  }

  async getByTask(taskId: string, limit = 5) {
    return this.repo.findByTask(taskId, limit);
  }
}
