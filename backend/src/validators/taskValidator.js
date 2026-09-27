import { z } from "zod";
export const createTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  assignedTo: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  dueDate: z.coerce.date().optional(),
});
export const updateTaskSchema = createTaskSchema.partial();
