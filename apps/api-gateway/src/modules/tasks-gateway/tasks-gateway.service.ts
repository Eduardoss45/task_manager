import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateCommentCommand, CreateTaskCommand, UpdateTaskCommand } from '@task_manager/types';
import {
  CreateCommentDto,
  UpdateTaskDto,
  CreateTaskDto,
} from '@task_manager/dtos';

@Injectable()
export class TasksGatewayService {
  constructor(@Inject('TASKS_SERVICE') private client: ClientProxy) {}

  async getTasks(page: number, size: number) {
    return firstValueFrom(
      this.client.send({ cmd: 'getTasks' }, { page, size }),
    );
  }

  async createTask(
    task: CreateTaskCommand & { authorId: string; authorName: string },
  ) {
    return firstValueFrom(this.client.send({ cmd: 'createTask' }, task));
  }

  async getTask(id: string) {
    return firstValueFrom(this.client.send({ cmd: 'getTask' }, { id }));
  }

  async updateTask(id: string, updates: UpdateTaskDto) {
    return firstValueFrom(
      this.client.send({ cmd: 'updateTask' }, { id, updates }),
    );
  }

  async deleteTask(id: string) {
    return firstValueFrom(this.client.send({ cmd: 'deleteTask' }, { id }));
  }

  async createComment(taskId: string, comment: CreateCommentDto) {
    return firstValueFrom(
      this.client.send({ cmd: 'createComment' }, { taskId, comment }),
    );
  }

  async getComments(taskId: string, page: number, size: number) {
    return firstValueFrom(
      this.client.send({ cmd: 'getComments' }, { taskId, page, size }),
    );
  }
}
