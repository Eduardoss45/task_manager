import { z } from "zod";

const uuidV4 = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, "UUID inválido");

export const priorityEnum = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const statusEnum = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

export type TaskPriority = (typeof priorityEnum)[number];
export type TaskStatus = (typeof statusEnum)[number];

export const editTaskSchema = z.object({
  title: z.string().min(3, "Título obrigatório"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(priorityEnum).optional(),
  status: z.enum(statusEnum).optional(),
  assignedUserIds: z
    .array(
      z.object({
        userId: uuidV4,
        username: z.string(),
      })
    )
    .optional(),
});
