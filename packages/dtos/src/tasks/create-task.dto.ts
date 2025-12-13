import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsDateString,
  IsUUID,
} from "class-validator";
import { Transform } from "class-transformer";

import { TaskPriority, TaskStatus } from "@jungle/enums";

export class CreateTaskDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  title: string = "";

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.MEDIUM;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus = TaskStatus.TODO;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  assignedUserIds?: string[];
}
