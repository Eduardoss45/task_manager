import { CreateCommentDto } from '../../dtos';

export type CreateCommentCommand = CreateCommentDto & {
  content: string;
  authorId: string;
  authorName: string;
};
