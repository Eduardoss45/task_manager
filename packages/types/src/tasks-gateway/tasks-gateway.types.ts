import { CreateTaskDto, UpdateTaskDto } from "@TaskManager/dtos";

export type CreateTaskCommand = CreateTaskDto & {
  authorId: string;
  authorName: string;
};

export type UpdateTaskCommand = UpdateTaskDto & {
  actorId: string;
  actorName: string;
};
