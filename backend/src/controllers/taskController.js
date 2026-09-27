import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { Task } from "../models/Task.js";
import { buildTaskFilter, buildTaskSort } from "../utils/taskHelpers.js";
import { createNotification } from "../services/notificationService.js";
import { logActivity } from "../services/activityService.js";

export const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const task = await Task.create({
    ...req.body,
    project: projectId,
    createdBy: req.user._id,
  });

  await logActivity({
    project: task.project,
    actor: req.user._id,
    action: "TASK_CREATED",
    message: `${req.user.name} created task "${task.title}"`,
    targetType: "TASK",
    targetId: task._id,
  });

  if (
    task.assignedTo &&
    task.assignedTo.toString() !== req.user._id.toString()
  ) {
    await createNotification({
      user: task.assignedTo,
      type: "TASK_ASSIGNED",
      message: `You were assigned task "${task.title}"`,
      link: `/projects/${projectId}`,
    });

    await logActivity({
      project: task.project,
      actor: req.user._id,
      action: "TASK_ASSIGNED",
      message: `${req.user.name} assigned "${task.title}"`,
      targetType: "TASK",
      targetId: task._id,
    });
  }

  res.status(201).json({ task });
});

export const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const filter = buildTaskFilter(req.query, projectId);
  const sort = buildTaskSort(req.query.sort);

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    data: tasks,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1,
      totalRecords: total,
      limit,
    },
  });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  if (!task) throw new AppError("Task not found", 404);
  res.json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new AppError("Task not found", 404);

  const uid = req.user._id.toString();
  const isProjectOwner = req.isOwner;
  const isAssignee = task.assignedTo?.toString() === uid;
  const isAdmin = req.user.role === "ADMIN";

  if (!isProjectOwner && !isAdmin && !isAssignee) {
    throw new AppError("You can only update tasks assigned to you", 403);
  }

  const wasCompleted = task.status === "COMPLETED";
  const previousAssignee = task.assignedTo?.toString();

  Object.assign(task, req.body);
  await task.save();

  if (!wasCompleted && task.status === "COMPLETED") {
    await logActivity({
      project: task.project,
      actor: req.user._id,
      action: "TASK_COMPLETED",
      message: `${req.user.name} completed task "${task.title}"`,
      targetType: "TASK",
      targetId: task._id,
    });

    if (task.createdBy) {
      await createNotification({
        user: task.createdBy,
        type: "TASK_COMPLETED",
        message: `Task "${task.title}" was marked completed`,
        link: `/projects/${task.project}`,
      });
    }
  } else {
    await logActivity({
      project: task.project,
      actor: req.user._id,
      action: "TASK_UPDATED",
      message: `${req.user.name} updated task "${task.title}"`,
      targetType: "TASK",
      targetId: task._id,
    });
  }

  const newAssignee = task.assignedTo?.toString();
  if (newAssignee && newAssignee !== previousAssignee && newAssignee !== uid) {
    await createNotification({
      user: task.assignedTo,
      type: "TASK_ASSIGNED",
      message: `You were assigned task "${task.title}"`,
      link: `/projects/${task.project}`,
    });
  }

  const populated = await Task.findById(task._id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  res.json({ task: populated });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new AppError("Task not found", 404);

  const uid = req.user._id.toString();
  const isProjectOwner = req.isOwner;
  const isAdmin = req.user.role === "ADMIN";
  const isAssignee = task.assignedTo?.toString() === uid;
  const isCreator = task.createdBy?.toString() === uid;

  if (!isProjectOwner && !isAdmin && !isAssignee && !isCreator) {
    throw new AppError(
      "You can only delete tasks you created or are assigned to",
      403
    );
  }

  await logActivity({
    project: task.project,
    actor: req.user._id,
    action: "TASK_DELETED",
    message: `${req.user.name} deleted task "${task.title}"`,
    targetType: "TASK",
    targetId: task._id,
  });

  await task.deleteOne();
  res.json({ message: "Task deleted" });
});