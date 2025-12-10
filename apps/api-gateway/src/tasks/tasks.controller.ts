import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Controller('tasks')
export class TasksController {
  private client: ClientProxy;
  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
        queue: 'task_queue',
        queueOptions: { durable: false },
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getTasks(@Body() body: any) {
    return this.client.send('get_tasks', body).toPromise();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createTask(@Body() body: any) {
    return this.client.send('create_task', body).toPromise();
  }
}
