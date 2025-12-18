import { CreateTaskDto } from "@task_manager/dtos";

export type CreateTaskCommand = CreateTaskDto & {
  authorId: string;
  authorName: string;
};
