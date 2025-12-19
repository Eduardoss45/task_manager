import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TasksService } from '../services/tasks.service';
import { TaskAuditService } from '../services/task-audit.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
} from '../dtos';
import { LoggerService } from '../logger';

@Controller()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly auditService: TaskAuditService,
    private readonly logger: LoggerService,
  ) {}

  @MessagePattern({ cmd: 'getTasks' })
  getTasks(data: { page: number; size: number }) {
    this.logger.info('Controller: getTasks', data);
    return this.tasksService.getTasks(data.page, data.size);
  }

  @MessagePattern({ cmd: 'createTask' })
  createTask(task: CreateTaskDto & { authorId: string; authorName: string }) {
    this.logger.info('Controller: createTask', {
      authorId: task.authorId,
      title: task.title,
    });
    return this.tasksService.createTask(task);
  }

  @MessagePattern({ cmd: 'getTask' })
  getTask(data: { id: string }) {
    this.logger.info('Controller: getTask', { id: data.id });
    return this.tasksService.getTask(data.id);
  }

  @MessagePattern({ cmd: 'updateTask' })
  updateTask(data: { id: string; updates: UpdateTaskDto }) {
    this.logger.info('Controller: updateTask', { id: data.id });
    return this.tasksService.updateTask(data.id, data.updates);
  }

  @MessagePattern({ cmd: 'deleteTask' })
  deleteTask(data: { id: string }) {
    this.logger.info('Controller: deleteTask', { id: data.id });
    return this.tasksService.deleteTask(data.id);
  }

  @MessagePattern({ cmd: 'createComment' })
  createComment(data: {
    taskId: string;
    authorName: string;
    comment: CreateCommentDto;
  }) {
    this.logger.info('Controller: createComment', { taskId: data.taskId });
    return this.tasksService.createComment(data.taskId, data.comment);
  }

  @MessagePattern({ cmd: 'getComments' })
  getComments(data: { taskId: string; page: number; size: number }) {
    this.logger.info('Controller: getComments', { taskId: data.taskId });
    return this.tasksService.getComments(data.taskId, data.page, data.size);
  }

  @MessagePattern({ cmd: 'tasks-start' })
  async tasksHealthCheck() {
    this.logger.info('Controller: tasksHealthCheck');
    const tasksRes = await this.tasksService.healthCheckTasksDatabase();
    const auditsRes = await this.auditService.healthCheckAuditDatabase();

    return {
      tasks: tasksRes.tasks,
      notifications: tasksRes.notifications,
      audits: auditsRes,
    };
  }
}
