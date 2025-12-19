import { UpdateTaskDto } from '../../dtos';

export type UpdateTaskCommand = UpdateTaskDto & {
  actorId: string;
  actorName: string;
};
