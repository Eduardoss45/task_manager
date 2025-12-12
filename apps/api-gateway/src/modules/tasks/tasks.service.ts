import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateCommentDto, UpdateTaskDto, CreateTaskDto } from '@jungle/dtos';

@Injectable()
export class TasksService {
  constructor(@Inject('TASKS_SERVICE') private client: ClientProxy) {}

  async getTasks(page: number, size: number) {
    return firstValueFrom(
      this.client.send({ cmd: 'getTasks' }, { page, size }),
    );
  }

  async createTask(task: CreateTaskDto) {
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
