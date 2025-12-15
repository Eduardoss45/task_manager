export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export interface AssignedUser {
  userId: string;
  username: string;
}

export interface Task {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedUserIds: AssignedUser[];
  createdAt: string;
  updatedAt: string;
}
