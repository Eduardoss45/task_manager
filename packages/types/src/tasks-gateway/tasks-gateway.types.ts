import { CreateTaskDto } from "@jungle/dtos";

export type CreateTaskCommand = CreateTaskDto & {
  authorId: string;
};
