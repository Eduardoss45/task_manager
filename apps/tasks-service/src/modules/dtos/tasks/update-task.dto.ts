import { ApiPropertyOptional } from "@nestjs/swagger";
import { PartialType } from "@nestjs/mapped-types";
import { CreateTaskDto } from "./create-task.dto";

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({
    example: "Estudar NestJS Avançado",
    description: "Título atualizado da tarefa",
  })
  title?: string;
}
