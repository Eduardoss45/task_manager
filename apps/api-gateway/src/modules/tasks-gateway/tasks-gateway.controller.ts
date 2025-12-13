import { CreateCommentDto, UpdateTaskDto, CreateTaskDto } from '@jungle/dtos';
import { CreateTaskCommand, UpdateTaskCommand } from '@jungle/types';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks-gateway.service';
import { JwtAuthGuard } from '../security/jwt.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(@Query('page') page: number, @Query('size') size: number) {
    return this.tasksService.getTasks(page, size);
  }

  @Post()
  async createTask(@Body() body: CreateTaskDto, @Req() req: any) {
    const payload: CreateTaskCommand = { ...body, authorId: req.user.userId };
    return this.tasksService.createTask(payload);
  }

  @Get(':id')
  async getTask(@Param('id') id: string) {
    return this.tasksService.getTask(id);
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @Req() req: any,
  ) {
    const payload: UpdateTaskCommand = { ...body, actorId: req.user.userId };
    return this.tasksService.updateTask(id, payload);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }

  @Post(':id/comments')
  async createComment(
    @Param('id') id: string,
    @Body() body: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.tasksService.createComment(id, {
      ...body,
      authorId: req.user.userId,
    });
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    return this.tasksService.getComments(id, page, size);
  }
}
