import { z } from "zod";

const projectBaseSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(5).max(2000),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  startDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  members: z.array(z.string()).optional(),
});

export const createProjectSchema = projectBaseSchema.refine(
  (d) => d.dueDate >= d.startDate,
  {
    message: "dueDate must be after startDate",
    path: ["dueDate"],
  }
);

export const updateProjectSchema = projectBaseSchema.partial();

export const addMemberSchema = z.object({
  userId: z.string().min(1),
});