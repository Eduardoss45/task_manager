import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  OnModuleInit,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Controller('tasks')
export class TasksController implements OnModuleInit {
  private client!: ClientProxy;

  onModuleInit() {
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
  getTasks(@Query('page') page = 1, @Query('size') size = 10) {
    // Mock
    const tasks = Array.from({ length: +size }, (_, i) => ({
      id: i + 1 + (+page - 1) * +size,
      title: `Tarefa ${i + 1}`,
      status: 'TODO',
      assignedTo: ['user-id-123'],
    }));

    return { page: +page, size: +size, tasks };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createTask(@Body() body: { title: string; status?: string }) {
    const task = {
      id: Math.floor(Math.random() * 1000),
      title: body.title,
      status: body.status || 'TODO',
    };

    // Publica evento no RabbitMQ
    this.client.emit('task.created', task);

    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getTask(@Param('id') id: string) {
    // Mock
    return {
      id,
      title: `Tarefa ${id}`,
      status: 'IN_PROGRESS',
      assignedTo: ['user-id-123'],
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateTask(
    @Param('id') id: string,
    @Body() body: { title?: string; status?: string },
  ) {
    const updatedTask = {
      id,
      title: body.title || `Tarefa ${id}`,
      status: body.status || 'TODO',
    };

    this.client.emit('task.updated', updatedTask);

    return updatedTask;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    this.client.emit('task.deleted', { id });
    return { message: `Tarefa ${id} deletada` };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  addComment(
    @Param('id') taskId: string,
    @Body() body: { text: string; author: string },
  ) {
    const comment = {
      id: Math.floor(Math.random() * 1000),
      taskId,
      text: body.text,
      author: body.author,
      createdAt: new Date(),
    };

    this.client.emit('task.comment.created', comment);

    return comment;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/comments')
  getComments(
    @Param('id') taskId: string,
    @Query('page') page = 1,
    @Query('size') size = 10,
  ) {
    const comments = Array.from({ length: +size }, (_, i) => ({
      id: i + 1 + (+page - 1) * +size,
      taskId,
      text: `Comentário ${i + 1}`,
      author: 'user-id-123',
      createdAt: new Date(),
    }));

    return { page: +page, size: +size, comments };
  }
}
