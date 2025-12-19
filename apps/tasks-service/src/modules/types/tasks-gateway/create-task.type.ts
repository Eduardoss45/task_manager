import { CreateTaskDto } from '../../dtos';

export type CreateTaskCommand = CreateTaskDto & {
  authorId: string;
  authorName: string;
};
