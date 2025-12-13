import { CreateTaskDto, UpdateTaskDto } from "@jungle/dtos";

export type CreateTaskCommand = CreateTaskDto & {
  authorId: string;
};

export type UpdateTaskCommand = UpdateTaskDto & {
  actorId: string;
};
