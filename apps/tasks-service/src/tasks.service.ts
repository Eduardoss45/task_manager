import {
  Injectable,
  NotFoundException,
  BadRequestException,
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

@Injectable()
export class TasksService {
  constructor(private readonly repo: TasksRepository) {}

  private assertUUID(id: string, field: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(`${field} must be a valid UUID`);
    }
  }

  private normalizeDate(date?: string): Date | undefined {
    return date ? new Date(date) : undefined;
  }

  private mapPriority(priority?: TaskPriority): Priority | undefined {
    if (!priority) return undefined;
    return Priority[priority as keyof typeof Priority];
  }

  private mapStatus(status?: TaskStatus): Status | undefined {
    if (!status) return undefined;
    return Status[status as keyof typeof Status];
  }

  async getTasks(page: number, size: number) {
    return this.repo.findTasks(page, size);
  }

  async createTask(task: CreateTaskDto) {
    const assignedUserIds = task.assignees ?? [];

    const duplicates = assignedUserIds.filter((v, i, a) => a.indexOf(v) !== i);
    if (duplicates.length > 0) {
      throw new BadRequestException(
        `Assigned users cannot contain duplicates: ${duplicates.join(', ')}`,
      );
    }

    const taskEntity: Partial<Task> = {
      ...task,
      dueDate: this.normalizeDate(task.dueDate),
      priority: this.mapPriority(task.priority) ?? Priority.MEDIUM,
      status: this.mapStatus(task.status) ?? Status.TODO,
      assignedUserIds,
    };

    return this.repo.createTask(taskEntity);
  }

  async getTask(id: string) {
    this.assertUUID(id, 'Task ID');

    const task = await this.repo.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async updateTask(id: string, updates: UpdateTaskDto) {
    this.assertUUID(id, 'Task ID');

    const task = await this.repo.findTaskById(id);
    if (!task) throw new NotFoundException('Task not found');

    const updatesEntity: Partial<Task> = {
      ...updates,
      dueDate: this.normalizeDate(updates.dueDate),
      priority: this.mapPriority(updates.priority),
      status: this.mapStatus(updates.status),
      assignedUserIds: updates.assignees ?? undefined,
    };

    if (updatesEntity.assignedUserIds) {
      const duplicates = updatesEntity.assignedUserIds.filter(
        (v, i, a) => a.indexOf(v) !== i,
      );
      if (duplicates.length > 0) {
        throw new BadRequestException(
          `Assigned users cannot contain duplicates: ${duplicates.join(', ')}`,
        );
      }
    }

    return this.repo.updateTask(id, updatesEntity);
  }

  async deleteTask(id: string) {
    this.assertUUID(id, 'Task ID');

    const task = await this.repo.findTaskById(id);
    if (!task) throw new NotFoundException('Task not found');

    return this.repo.deleteTask(id);
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

    return this.repo.createComment(commentEntity);
  }

  async getComments(taskId: string, page: number, size: number) {
    this.assertUUID(taskId, 'Task ID');

    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    return this.repo.findComments(taskId, page, size);
  }
}
