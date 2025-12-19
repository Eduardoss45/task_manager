import { HealthStatus, TasksHealthResponse } from '../types';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  AssignedUserDto,
} from '../dtos';
import { TaskPriority, TaskStatus, TaskAuditAction } from '../enums';
import { ClientProxy } from '@nestjs/microservices';
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TasksRepository } from '../repositories/tasks.repository';
import { Task } from '../entities/task.entity';
import { validate as isUUID } from 'uuid';
import { TaskAuditService } from './task-audit.service';
import { catchError, of, firstValueFrom, timeout } from 'rxjs';
import { LoggerService } from '../logger';

@Injectable()
export class TasksService {
  constructor(
    private readonly repo: TasksRepository,
    private readonly audit: TaskAuditService,
    @Inject('NOTIFICATIONS_EVENTS') private readonly client: ClientProxy,
    private readonly logger: LoggerService,
  ) {}

  private assertAuthorNotAssigned(
    authorId: string | undefined,
    assignedUsers: AssignedUserDto[],
  ) {
    if (!authorId) return;

    const isAssigned = assignedUsers.some((u) => u.userId === authorId);

    if (isAssigned) {
      throw new BadRequestException(
        'Task author cannot be assigned to the task',
      );
    }
  }

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

  private validateAssignedUserIds(assignedUserIds: AssignedUserDto[]) {
    for (const user of assignedUserIds) {
      if (!user.username || !user.userId) {
        throw new BadRequestException(
          'Assigned user must have both username and userId',
        );
      }

      this.assertUUID(user.userId, 'Assigned user userId');
    }
  }

  async getTasks(page: number, size: number) {
    this.logger.info('Fetching tasks', { page, size });
    return this.repo.findTasks(page, size);
  }

  async createTask(
    task: CreateTaskDto & { authorId?: string; authorName?: string },
  ) {
    this.logger.info('Creating task', {
      authorId: task.authorId,
      title: task.title,
    });

    const assignedUserIds = task.assignedUserIds ?? [];

    this.validateAssignedUserIds(assignedUserIds);
    this.assertNoDuplicates(
      assignedUserIds.map((u) => u.userId),
      'Assigned users',
    );
    this.assertAuthorNotAssigned(task.authorId, assignedUserIds);

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
      authorName: task.authorName,
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
      task.authorName,
    );

    const payload = {
      event: 'task.created',
      actorId: task.authorId,
      task: {
        id: created.id,
        title: created.title,
        ownerId: created.authorId,
        ownerName: created.authorName,
        assignedUserIds: created.assignedUserIds,
      },
    };

    this.client
      .emit('task.created', payload)
      .pipe(
        catchError((err) => {
          this.logger.info('Failed to emit task.created', { error: err });
          return of(null);
        }),
      )
      .subscribe();

    return created;
  }

  async getTask(id: string) {
    this.assertUUID(id, 'Task ID');

    const task = await this.repo.findTaskById(id);
    if (!task) throw new NotFoundException('Task not found');

    const audit = await this.audit.getByTask(id, 5);
    return { ...task, audit };
  }

  async updateTask(
    id: string,
    updates: UpdateTaskDto & { actorId?: string; actorName?: string },
  ) {
    this.assertUUID(id, 'Task ID');

    const before = await this.repo.findTaskById(id);
    if (!before) throw new NotFoundException('Task not found');

    const { actorId, actorName, ...taskUpdates } = updates;

    const updatesEntity: Partial<Task> = {
      ...taskUpdates,
      dueDate: this.normalizeDate(taskUpdates.dueDate),
      priority: this.mapPriorityOrThrow(taskUpdates.priority),
      status: this.mapStatusOrThrow(taskUpdates.status),
      assignedUserIds: taskUpdates.assignedUserIds ?? undefined,
    };

    if (updatesEntity.assignedUserIds !== undefined) {
      this.validateAssignedUserIds(updatesEntity.assignedUserIds);
      this.assertNoDuplicates(
        updatesEntity.assignedUserIds.map((u) => u.userId),
        'Assigned users',
      );
      this.assertAuthorNotAssigned(
        before.authorId,
        updatesEntity.assignedUserIds,
      );
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
        actorName ?? 'system',
      );

      const payload = {
        event: 'task.updated',
        actorId: actorId ?? 'system',
        actorName: actorName ?? 'system',
        task: {
          id,
          ownerId: before.authorId,
          ownerName: before.authorName,
          title: before.title,
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

      this.client
        .emit('task.updated', payload)
        .pipe(
          catchError((err) => {
            this.logger.info('Failed to emit task.updated', { error: err });
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
    comment: CreateCommentDto & { authorId?: string; authorName?: string },
  ) {
    this.assertUUID(taskId, 'Task ID');

    const taskExists = await this.repo.findTaskById(taskId);
    if (!taskExists) throw new NotFoundException('Task not found');

    const createdComment = await this.repo.createComment({
      content: comment.content,
      authorId: comment.authorId!,
      authorName: comment.authorName!,
      task: taskExists,
    });

    await this.audit.log(
      TaskAuditAction.COMMENT_ADDED,
      taskId,
      null,
      { commentId: createdComment.id },
      comment.authorId,
      comment.authorName,
    );

    const payload = {
      event: 'task.comment.created',
      actorId: comment.authorId,
      actorName: comment.authorName,
      task: {
        id: taskExists.id,
        ownerId: taskExists.authorId,
        ownerName: taskExists.authorName,
        assignedUserIds: taskExists.assignedUserIds,
        title: taskExists.title,
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
          this.logger.info('Failed to emit task.comment.created', {
            error: err,
          });
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

  async healthCheckTasksDatabase(): Promise<TasksHealthResponse> {
    const requiredVars = ['RMQ_URL', 'DATABASE_URL'];
    const missingVars = requiredVars.filter((v) => !process.env[v]);

    if (missingVars.length > 0) {
      this.logger.info('Missing environment variables', { missingVars });
      return { tasks: 'down', notifications: 'down' };
    }

    let notifications: HealthStatus = 'down';

    try {
      notifications = await firstValueFrom(
        this.client
          .send({ cmd: 'notifications-start' }, {})
          .pipe(timeout(2000)),
      );
    } catch (err) {
      this.logger.info('Notifications health check failed', { error: err });
    }

    const tasksDbOk = await this.repo.checkDatabaseHealthTasksAndComments();

    return {
      tasks: tasksDbOk ? 'up' : 'down',
      notifications,
    };
  }
}
