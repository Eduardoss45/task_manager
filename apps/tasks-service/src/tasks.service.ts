import { CreateTaskDto, UpdateTaskDto, CreateCommentDto } from '@jungle/dtos';
import { TaskPriority, TaskStatus, TaskAuditAction } from '@jungle/enums';
import { ClientProxy } from '@nestjs/microservices';
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TasksRepository } from './entity/repository/tasks.repository';
import { Task } from './entity/task.entity';
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

  private mapPriorityOrThrow(
    priority?: TaskPriority,
  ): TaskPriority | undefined {
    if (!priority) return undefined;

    const mapped = TaskPriority[priority as keyof typeof TaskPriority];
    if (!mapped) {
      throw new BadRequestException(`Invalid priority value: ${priority}`);
    }

    return mapped;
  }

  private mapStatusOrThrow(status?: TaskStatus): TaskStatus | undefined {
    if (!status) return undefined;

    const mapped = TaskStatus[status as keyof typeof TaskStatus];
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
    const assignedUserIds = task.assignedUserIds ?? [];
    this.assertNoDuplicates(assignedUserIds, 'Assigned users');

    const priority =
      this.mapPriorityOrThrow(task.priority) ?? TaskPriority.MEDIUM;
    const status = this.mapStatusOrThrow(task.status) ?? TaskStatus.TODO;

    const taskEntity: Partial<Task> = {
      ...task,
      dueDate: this.normalizeDate(task.dueDate),
      priority,
      status,
      assignedUserIds,
      authorId: task.authorId,
    };

    const created = await this.repo.createTask(taskEntity);

    await this.audit.log(
      TaskAuditAction.TASK_CREATED,
      created.id,
      null,
      {
        id: created.id,
        title: created.title,
        status: created.status,
        priority: created.priority,
        dueDate: created.dueDate,
      },
      task.authorId,
    );

    const payload = {
      event: 'task.created',
      actorId: task.authorId,
      task: {
        id: created.id,
        title: created.title,
        ownerId: created.authorId,
        assignedUserIds: created.assignedUserIds,
      },
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

    const audit = await this.audit.getByTask(id, 5);

    return { ...task, audit };
  }

  async updateTask(id: string, updates: UpdateTaskDto & { actorId?: string }) {
    this.assertUUID(id, 'Task ID');

    const before = await this.repo.findTaskById(id);
    if (!before) throw new NotFoundException('Task not found');

    const { actorId, ...taskUpdates } = updates;

    const newPriority = this.mapPriorityOrThrow(taskUpdates.priority);
    const newStatus = this.mapStatusOrThrow(taskUpdates.status);

    const updatesEntity: Partial<Task> = {
      ...taskUpdates,
      dueDate: this.normalizeDate(taskUpdates.dueDate),
      priority: newPriority,
      status: newStatus,
      assignedUserIds: taskUpdates.assignedUserIds ?? undefined,
    };

    if (updatesEntity.assignedUserIds) {
      this.assertNoDuplicates(updatesEntity.assignedUserIds, 'Assigned users');
    }

    await this.repo.updateTask(id, updatesEntity);
    const after = await this.repo.findTaskById(id);

    if (!after) throw new NotFoundException('Task not found after update');

    const changes: Record<string, { before: any; after: any }> = {};

    for (const key of Object.keys(updatesEntity)) {
      if (
        updatesEntity[key] !== undefined &&
        before[key] !== updatesEntity[key]
      ) {
        changes[key] = {
          before: before[key],
          after: updatesEntity[key],
        };
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.audit.log(
        TaskAuditAction.TASK_UPDATED,
        id,
        Object.fromEntries(
          Object.entries(changes).map(([k, v]) => [k, v.before]),
        ),
        Object.fromEntries(
          Object.entries(changes).map(([k, v]) => [k, v.after]),
        ),
        actorId ?? 'system',
      );
    }

    const payload = {
      event: 'task.updated',
      actorId: actorId ?? 'system',
      task: {
        id: id,
        ownerId: before.authorId,
      },
      before: {
        status: before.status,
        assignedUserIds: before.assignedUserIds,
      },
      after: {
        status: after.status,
        assignedUserIds: after.assignedUserIds,
      },
    };

    if (Object.keys(changes).length > 0) {
      this.client
        .emit('task.updated', payload)
        .pipe(
          catchError((err) => {
            this.logger.error('Failed to emit task.updated', err);
            return of(null);
          }),
        )
        .subscribe();
    }

    return after;
  }

  async deleteTask(id: string) {
    this.assertUUID(id, 'Task ID');

    const before = await this.repo.findTaskById(id);
    if (!before) throw new NotFoundException('Task not found');

    await this.repo.deleteTask(id);

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
      TaskAuditAction.COMMENT_ADDED,
      taskId,
      null,
      {
        commentId: createdComment.id,
      },
      comment.authorId,
    );

    const payload = {
      event: 'task.comment.created',
      actorId: comment.authorId,
      task: {
        id: taskExists.id,
        ownerId: taskExists.authorId,
        assignedUserIds: taskExists.assignedUserIds,
      },
      comment: {
        id: createdComment.id,
        content: createdComment.content,
      },
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
