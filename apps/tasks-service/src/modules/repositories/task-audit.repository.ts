import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskAuditLog } from '../entities/task-audit-log.entity';

@Injectable()
export class TaskAuditRepository {
  constructor(
    @InjectRepository(TaskAuditLog)
    private readonly repo: Repository<TaskAuditLog>,
  ) {}

  create(record: Partial<TaskAuditLog>) {
    return this.repo.save(this.repo.create(record));
  }

  findByTask(taskId: string, limit: number) {
    return this.repo.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async checkDatabaseHealthAudit(): Promise<boolean> {
    try {
      await this.repo.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}
