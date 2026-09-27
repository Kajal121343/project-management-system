import { Router } from "express";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { checkProjectAccess } from "../middlewares/projectAccess.js";
import { validate } from "../middlewares/validate.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../validators/taskValidator.js";
import { protect } from "../middlewares/auth.js";
import { Task } from "../models/Task.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Middleware: for /api/tasks/:id routes.
 * Loads the parent project, runs checkProjectAccess on it,
 * then restores params so controllers receive the task id.
 * This sets req.isOwner / req.isAdmin for RBAC in the controller.
 */
const loadTaskProjectAccess = asyncHandler(async (req, res, next) => {
  const taskId = req.params.id;
  const task = await Task.findById(taskId);
  if (!task) throw new AppError("Task not found", 404);

  const originalParams = { ...req.params };
  req.params.id = task.project.toString();

  return checkProjectAccess(req, res, () => {
    req.params = originalParams;
    next();
  });
});

// ─── Router #1: nested under /api/projects/:projectId/tasks ───
const projectRouter = Router({ mergeParams: true });
projectRouter
  .route("/")
  .get(checkProjectAccess, getTasks)
  .post(checkProjectAccess, validate(createTaskSchema), createTask);

// ─── Router #2: mounted at /api/tasks ───
const taskRouter = Router();
taskRouter.use(protect);
taskRouter
  .route("/:id")
  .get(loadTaskProjectAccess, getTask)
  .patch(loadTaskProjectAccess, validate(updateTaskSchema), updateTask)
  .delete(loadTaskProjectAccess, deleteTask);

export { projectRouter };
export default taskRouter;