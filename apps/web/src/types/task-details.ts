import type { Task } from "./task";

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface TaskAudit {
  id: string;
  taskId: string;
  action: string;
  before: Record<string, any> | null;
  after: Record<string, any> | null;
  actorId: string;
  actorName: string;
  createdAt: string;
}

export interface TaskDetails extends Task {
  comments?: TaskComment[];
  audit?: TaskAudit[];
}
