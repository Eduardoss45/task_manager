import { CreateTaskDto, UpdateTaskDto } from "@task_manager/dtos";

export type CreateTaskCommand = CreateTaskDto & {
  authorId: string;
  authorName: string;
};

export type UpdateTaskCommand = UpdateTaskDto & {
  actorId: string;
  actorName: string;
};

export type HealthStatus = "up" | "down";

export type TasksHealthResponse = {
  tasks: HealthStatus;
  notifications: HealthStatus;
};
