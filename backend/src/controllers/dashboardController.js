import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { isTaskOverdue } from "../utils/taskHelpers.js";
export const getDashboard = asyncHandler(async (req, res) => {
  const projectFilter = req.user.role === "ADMIN" ? {} : { $or: [{ owner: req.user._id }, { members: req.user._id }] };
  const projects = await Project.find(projectFilter).select("_id name status");
  const projectIds = projects.map((p) => p._id);
  const tasks = await Task.find({ project: projectIds }).populate("assignedTo", "name").populate("project", "name").sort({ dueDate: 1 });
  const now = new Date();
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t, now));
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "IN_PROGRESS" || p.status === "PLANNING").length;
  const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityTasks = tasks.filter((t) => t.priority === "HIGH" || t.priority === "CRITICAL").length;
  const progressMap = {};
  tasks.forEach((t) => {
    const pid = t.project._id.toString();
    if (!progressMap[pid]) progressMap[pid] = { projectId: pid, name: t.project.name, total: 0, completed: 0 };
    progressMap[pid].total += 1;
    if (t.status === "COMPLETED") progressMap[pid].completed += 1;
  });
  const projectProgress = Object.values(progressMap).map((p) => ({ ...p, progress: p.total === 0 ? 0 : Math.round((p.completed / p.total) * 100) }));
  res.json({
    stats: { totalProjects, activeProjects, completedProjects, totalTasks, pendingTasks, completedTasks, overdueTasks: overdueTasks.length, highPriorityTasks },
    overdueTasks: overdueTasks.slice(0, 10),
    projectProgress,
  });
});
