import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, CreateCommentDto } from '@jungle/dtos';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern({ cmd: 'getTasks' })
  getTasks(data: { page: number; size: number }) {
    return this.tasksService.getTasks(data.page, data.size);
  }

  @MessagePattern({ cmd: 'createTask' })
  createTask(task: CreateTaskDto & { authorId: string; authorName: string }) {
    return this.tasksService.createTask(task);
  }

  @MessagePattern({ cmd: 'getTask' })
  getTask(data: { id: string }) {
    return this.tasksService.getTask(data.id);
  }

  @MessagePattern({ cmd: 'updateTask' })
  updateTask(data: { id: string; updates: UpdateTaskDto }) {
    return this.tasksService.updateTask(data.id, data.updates);
  }

  @MessagePattern({ cmd: 'deleteTask' })
  deleteTask(data: { id: string }) {
    return this.tasksService.deleteTask(data.id);
  }

  @MessagePattern({ cmd: 'createComment' })
  createComment(data: {
    taskId: string;
    authorName: string;
    comment: CreateCommentDto;
  }) {
    return this.tasksService.createComment(data.taskId, data.comment);
  }

  @MessagePattern({ cmd: 'getComments' })
  getComments(data: { taskId: string; page: number; size: number }) {
    return this.tasksService.getComments(data.taskId, data.page, data.size);
  }
}
