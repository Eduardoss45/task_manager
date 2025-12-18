import { CreateCommentDto } from "@task_manager/dtos";

export type CreateCommentCommand = CreateCommentDto & {
  content: string;
  authorId: string;
  authorName: string;
};
