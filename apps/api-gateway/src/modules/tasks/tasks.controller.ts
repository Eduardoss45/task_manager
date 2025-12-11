import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  // GET /api/tasks?page=&size=
  @Get()
  getTasks(@Query('page') page: number, @Query('size') size: number) {
    return {
      message: 'Lista de tarefas',
      page: page || 1,
      size: size || 10,
      data: [],
    };
  }

  // POST /api/tasks
  @Post()
  createTask(@Body() body: any) {
    return {
      message: 'task.created',
      task: body,
    };
  }

  // GET /api/tasks/:id
  @Get(':id')
  getTask(@Param('id') id: string) {
    return {
      message: 'Detalhe da tarefa',
      taskId: id,
    };
  }

  // PUT /api/tasks/:id
  @Put(':id')
  updateTask(@Param('id') id: string, @Body() body: any) {
    return {
      message: 'task.updated',
      taskId: id,
      updates: body,
    };
  }

  // DELETE /api/tasks/:id
  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return {
      message: 'task.deleted',
      taskId: id,
    };
  }

  // POST /api/tasks/:id/comments
  @Post(':id/comments')
  createComment(@Param('id') id: string, @Body() body: any) {
    return {
      message: 'task.comment.created',
      taskId: id,
      comment: body,
    };
  }

  // GET /api/tasks/:id/comments?page=&size=
  @Get(':id/comments')
  getComments(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    return {
      message: 'Lista de comentários',
      taskId: id,
      page: page || 1,
      size: size || 10,
      data: [],
    };
  }
}
