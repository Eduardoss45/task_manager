import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('tasks')
export class TasksController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getTasks() {
    return [
      {
        id: 1,
        title: 'Tarefa de teste',
        status: 'TODO',
        assignedTo: ['user-id-123'],
      },
    ];
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createTask(@Body() body: { title: string; status?: string }) {
    return {
      id: Math.floor(Math.random() * 1000),
      title: body.title,
      status: body.status || 'TODO',
    };
  }
}
