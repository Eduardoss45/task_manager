import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString,
} from "class-validator";
import { Transform } from "class-transformer";
import { TaskPriority, TaskStatus } from "@TaskManager/enums";
import { AssignedUserDto } from "../auth/assigned-user.dto";
import { Type } from "class-transformer";

export class CreateTaskDto {
  @ApiProperty({ example: "Estudar NestJS" })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  title: string = "";

  @ApiPropertyOptional({ example: "Ler documentação oficial" })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: "2025-12-31",
    description: "Data limite da tarefa",
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    type: [AssignedUserDto],
    example: [
      { username: "john_doe", userId: "uuid-user-1" },
      { username: "jane_doe", userId: "uuid-user-2" },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignedUserDto)
  assignedUserIds?: AssignedUserDto[];
}
