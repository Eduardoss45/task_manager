import { HealthStatus } from "./health-status.type";

export type TasksHealthResponse = {
  tasks: HealthStatus;
  notifications: HealthStatus;
};
