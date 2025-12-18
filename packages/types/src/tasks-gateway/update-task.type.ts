import { UpdateTaskDto } from "@task_manager/dtos";

export type UpdateTaskCommand = UpdateTaskDto & {
  actorId: string;
  actorName: string;
};
