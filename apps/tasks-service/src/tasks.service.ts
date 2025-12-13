import { ClientProxy } from '@nestjs/microservices';
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TasksRepository } from './entity/repository/tasks.repository';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  TaskPriority,
  TaskStatus,
} from '@jungle/dtos';
import { Task, Priority, Status } from './entity/task.entity';
import { validate as isUUID } from 'uuid';
import { TaskAuditService } from './task-audit.service';
import { catchError, of } from 'rxjs';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly repo: TasksRepository,
    private readonly audit: TaskAuditService,
    @Inject('NOTIFICATIONS_SERVICE') private readonly client: ClientProxy,
  ) {}

  private assertUUID(id: string, field: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`${field} must be a valid UUID`);
    }
  }

  private normalizeDate(date?: string): Date | undefined {
    return date ? new Date(date) : undefined;
  }

  private mapPriorityOrThrow(priority?: TaskPriority): Priority | undefined {
    if (!priority) return undefined;

    const mapped = Priority[priority as keyof typeof Priority];
    if (!mapped) {
      throw new BadRequestException(`Invalid priority value: ${priority}`);
    }

    return mapped;
  }

  private mapStatusOrThrow(status?: TaskStatus): Status | undefined {
    if (!status) return undefined;

    const mapped = Status[status as keyof typeof Status];
    if (!mapped) {
      throw new BadRequestException(`Invalid status value: ${status}`);
    }

    return mapped;
  }

  private assertNoDuplicates(list: string[], field: string) {
    const duplicates = list.filter((v, i, a) => a.indexOf(v) !== i);
    if (duplicates.length > 0) {
      throw new BadRequestException(
        `${field} cannot contain duplicates: ${duplicates.join(', ')}`,
      );
    }
  }

  async getTasks(page: number, size: number) {
    return this.repo.findTasks(page, size);
  }

  async createTask(task: CreateTaskDto & { authorId?: string }) {
    const assignedUserIds = task.assignees ?? [];
    this.assertNoDuplicates(assignedUserIds, 'Assigned users');

    const priority = this.mapPriorityOrThrow(task.priority) ?? Priority.MEDIUM;
    const status = this.mapStatusOrThrow(task.status) ?? Status.TODO;

    const taskEntity: Partial<Task> = {
      ...task,
      dueDate: this.normalizeDate(task.dueDate),
      priority,
      status,
      assignedUserIds,
    };

    const created = await this.repo.createTask(taskEntity);

    await this.audit.log(
      'TASK_CREATED',
      created.id,
      null,
      created,
      task.authorId ?? 'system',
    );

    const payload = {
      taskId: created.id,
      after: JSON.parse(JSON.stringify(created)),
      actorId: task.authorId ?? 'system',
    };

    this.client
      .emit('task.created', payload)
      .pipe(
        catchError((err) => {
          this.logger.error('Failed to emit task.created', err);
          return of(null);
        }),
      )
      .subscribe();

    return created;
  }

  async getTask(id: string) {
    this.assertUUID(id, 'Task ID');

    const task = await this.repo.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async updateTask(id: string, updates: UpdateTaskDto & { authorId?: string }) {
    this.assertUUID(id, 'Task ID');
    const before = await this.repo.findTaskById(id);
    if (!before) throw new NotFoundException('Task not found');

    const newPriority = this.mapPriorityOrThrow(updates.priority);
    const newStatus = this.mapStatusOrThrow(updates.status);

    const updatesEntity: Partial<Task> = {
      ...updates,
      dueDate: this.normalizeDate(updates.dueDate),
      priority: newPriority,
      status: newStatus,
      assignedUserIds: updates.assignees ?? undefined,
    };

    if (updatesEntity.assignedUserIds) {
      this.assertNoDuplicates(updatesEntity.assignedUserIds, 'Assigned users');
    }

    await this.repo.updateTask(id, updatesEntity);
    const after = await this.repo.findTaskById(id);

    await this.audit.log(
      'TASK_UPDATED',
      id,
      before,
      after,
      updates.authorId ?? 'system',
    );

    const payload = {
      taskId: id,
      before: JSON.parse(JSON.stringify(before)),
      after: JSON.parse(JSON.stringify(after)),
      actorId: updates.authorId ?? 'system',
    };

    this.client
      .emit('task.updated', payload)
      .pipe(
        catchError((err) => {
          this.logger.error('Failed to emit task.updated', err);
          return of(null);
        }),
      )
      .subscribe();

    return after;
  }

  async deleteTask(id: string, authorId?: string) {
    this.assertUUID(id, 'Task ID');

    const before = await this.repo.findTaskById(id);
    if (!before) throw new NotFoundException('Task not found');

    await this.repo.deleteTask(id);
    await this.audit.log(
      'TASK_DELETED',
      id,
      before,
      null,
      authorId ?? 'system',
    );

    const payload = {
      taskId: id,
      before: JSON.parse(JSON.stringify(before)),
      actorId: authorId ?? 'system',
    };

    this.client
      .emit('task.deleted', payload)
      .pipe(
        catchError((err) => {
          this.logger.error('Failed to emit task.deleted', err);
          return of(null);
        }),
      )
      .subscribe();

    return { deleted: true };
  }

  async createComment(
    taskId: string,
    comment: CreateCommentDto & { authorId?: string },
  ) {
    this.assertUUID(taskId, 'Task ID');

    const taskExists = await this.repo.findTaskById(taskId);
    if (!taskExists) throw new NotFoundException('Task not found');

    const commentEntity = {
      content: comment.content,
      authorId: comment.authorId!,
      task: taskExists,
    };

    const createdComment = await this.repo.createComment(commentEntity);

    await this.audit.log(
      'COMMENT_ADDED',
      taskId,
      null,
      createdComment,
      comment.authorId ?? 'system',
    );

    const payload = {
      taskId,
      comment: JSON.parse(JSON.stringify(createdComment)),
      actorId: comment.authorId ?? 'system',
    };

    this.client
      .emit('task.comment.created', payload)
      .pipe(
        catchError((err) => {
          this.logger.error('Failed to emit task.comment.created', err);
          return of(null);
        }),
      )
      .subscribe();

    return createdComment;
  }

  async getComments(taskId: string, page: number, size: number) {
    this.assertUUID(taskId, 'Task ID');

    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    return this.repo.findComments(taskId, page, size);
  }
}
