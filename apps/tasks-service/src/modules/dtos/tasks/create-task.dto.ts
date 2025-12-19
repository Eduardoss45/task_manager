import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { IsFutureDate } from '../utils/is-future-date';
import { Transform } from 'class-transformer';
import { TaskPriority, TaskStatus } from '../../enums';
import { AssignedUserDto } from '../auth/assigned-user.dto';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({ example: 'Estudar NestJS', description: 'Título da tarefa' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  title: string = '';

  @ApiPropertyOptional({
    example: 'Ler documentação oficial',
    description: 'Descrição detalhada da tarefa',
  })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Data limite da tarefa (deve ser futura)',
  })
  @IsOptional()
  @IsDateString()
  @IsFutureDate({ message: 'A data de entrega deve ser no futuro' })
  dueDate?: string;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    description: 'Prioridade da tarefa',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.TODO,
    description: 'Status da tarefa',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    type: [AssignedUserDto],
    example: [
      { username: 'john_doe', userId: '987e6543-e21b-12d3-a456-426655440000' },
      { username: 'jane_doe', userId: '111e1111-e11b-12d3-a456-426614174001' },
    ],
    description: 'Usuários atribuídos à tarefa',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignedUserDto)
  assignedUserIds?: AssignedUserDto[];
}
