import { Payload } from '@nestjs/microservices';
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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateCommentDto,
  UpdateTaskDto,
  CreateTaskDto,
} from '@task_manager/dtos';
import { CreateTaskCommand, UpdateTaskCommand } from '@task_manager/types';
import { TasksGatewayService } from './tasks-gateway.service';
import { JwtAuthGuard } from '../guards/jwt.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksGatewayController {
  constructor(private readonly tasksService: TasksGatewayService) {}

  @Get()
  @ApiOperation({ summary: 'Lista tarefas com paginação' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de tarefas retornada' })
  async getTasks(@Query('page') page: number, @Query('size') size: number) {
    return this.tasksService.getTasks(page, size);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova tarefa' })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
  async createTask(@Body() body: CreateTaskDto, @Req() req: any) {
    const payload: CreateTaskCommand = {
      ...body,
      authorId: req.user.userId,
      authorName: req.user.username,
    };

    return this.tasksService.createTask(payload);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém detalhes de uma tarefa' })
  @ApiParam({ name: 'id', example: 'uuid-da-tarefa' })
  @ApiResponse({ status: 200, description: 'Detalhes da tarefa' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async getTask(@Param('id') id: string) {
    return this.tasksService.getTask(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma tarefa existente' })
  @ApiParam({ name: 'id', example: 'uuid-da-tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada' })
  async updateTask(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @Req() req: any,
  ) {
    const payload: UpdateTaskCommand = {
      ...body,
      actorId: req.user.userId,
      actorName: req.user.username,
    };

    return this.tasksService.updateTask(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma tarefa' })
  @ApiParam({ name: 'id', example: 'uuid-da-tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa removida' })
  async deleteTask(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Cria um comentário em uma tarefa' })
  @ApiParam({ name: 'id', example: 'uuid-da-tarefa' })
  @ApiResponse({ status: 201, description: 'Comentário criado' })
  async createComment(
    @Param('id') id: string,
    @Body() body: CreateCommentDto,
    @Req() req: any,
  ) {
    const payload: CreateCommentDto = {
      ...body,
      authorId: req.user.userId,
      authorName: req.user.username,
    };

    return this.tasksService.createComment(id, payload);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Lista comentários de uma tarefa' })
  @ApiParam({ name: 'id', example: 'uuid-da-tarefa' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de comentários' })
  async getComments(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    return this.tasksService.getComments(id, page, size);
  }
}
