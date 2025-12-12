import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsDateString,
} from "class-validator";
import { Transform } from "class-transformer";

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE",
}

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
  @Transform(({ value }) => value.map((v: string) => v.trim()))
  assignees?: string[];
}
