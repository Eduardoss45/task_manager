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
import {
  CreateCommentCommand,
  CreateTaskCommand,
  UpdateTaskCommand,
} from '@task_manager/types';
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
  async createTask(@Body() dto: CreateTaskDto, @Req() req: any) {
    const command: CreateTaskCommand = {
      ...dto,
      authorId: req.user.userId,
      authorName: req.user.username,
    };

    return this.tasksService.createTask(command);
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
    @Body() dto: UpdateTaskDto,
    @Req() req: any,
  ) {
    const command: UpdateTaskCommand = {
      ...dto,
      actorId: req.user.userId,
      actorName: req.user.username,
    };

    return this.tasksService.updateTask(id, command);
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
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    const command: CreateCommentCommand = {
      ...dto,
      authorId: req.user.userId,
      authorName: req.user.username,
    };

    return this.tasksService.createComment(id, command);
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
