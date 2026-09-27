import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { logActivity } from "../services/activityService.js";

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    owner: req.user._id,
    members: req.body.members || [],
  });

  await logActivity({
    project: project._id,
    actor: req.user._id,
    action: "PROJECT_CREATED",
    message: `${req.user.name} created the project`,
    targetType: "PROJECT",
    targetId: project._id,
  });

  res.status(201).json({ project });
});

export const getProjects = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === "ADMIN"
      ? {}
      : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

  const projects = await Project.find(filter)
    .populate("owner", "name email")
    .populate("members", "name email")
    .sort({ createdAt: -1 });

  res.json({ projects });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.project._id)
    .populate("owner", "name email")
    .populate("members", "name email");
  res.json({ project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const wasArchived = req.project.status === "ARCHIVED";
  const project = await Project.findByIdAndUpdate(req.project._id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("owner", "name email")
    .populate("members", "name email");

  const isNowArchived = req.body.status === "ARCHIVED" && !wasArchived;

  await logActivity({
    project: project._id,
    actor: req.user._id,
    action: isNowArchived ? "PROJECT_ARCHIVED" : "PROJECT_UPDATED",
    message: isNowArchived
      ? `${req.user.name} archived the project`
      : `${req.user.name} updated the project`,
    targetType: "PROJECT",
    targetId: project._id,
  });

  res.json({ project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  await Project.findByIdAndDelete(req.project._id);
  res.json({ message: "Project deleted" });
});

export const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (req.project.members.some((m) => m.toString() === userId)) {
    throw new AppError("User already a member", 400);
  }

  req.project.members.push(userId);
  await req.project.save();

  await createNotification({
    user: userId,
    type: "PROJECT_ADDED",
    message: `You were added to project "${req.project.name}"`,
    link: `/projects/${req.project._id}`,
  });

  await logActivity({
    project: req.project._id,
    actor: req.user._id,
    action: "MEMBER_ADDED",
    message: `${req.user.name} added ${user.name} to the project`,
    targetType: "USER",
    targetId: userId,
  });

  const populated = await Project.findById(req.project._id)
    .populate("owner", "name email")
    .populate("members", "name email");

  res.json({ project: populated });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const removedUser = await User.findById(userId).select("name");

  req.project.members = req.project.members.filter(
    (m) => m.toString() !== userId
  );
  await req.project.save();

  await logActivity({
    project: req.project._id,
    actor: req.user._id,
    action: "MEMBER_REMOVED",
    message: `${req.user.name} removed ${
      removedUser?.name || "a member"
    } from the project`,
    targetType: "USER",
    targetId: userId,
  });

  const populated = await Project.findById(req.project._id)
    .populate("owner", "name email")
    .populate("members", "name email");

  res.json({ project: populated });
});