import { CreateTaskDto, UpdateTaskDto } from "@jungle/dtos";

export type CreateTaskCommand = CreateTaskDto & {
  authorId: string;
  authorName: string;
};

export type UpdateTaskCommand = UpdateTaskDto & {
  actorId: string;
  actorName: string;
};
