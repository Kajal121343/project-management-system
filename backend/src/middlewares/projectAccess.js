import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { Project } from "../models/Project.js";

/**
 * Loads a project and verifies the current user is:
 *  - the owner, OR
 *  - a member, OR
 *  - an admin
 * Sets:
 *  - req.project  (the project doc)
 *  - req.isOwner  (boolean)
 *  - req.isAdmin  (boolean)
 */
export const checkProjectAccess = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const project = await Project.findById(projectId);

  if (!project) throw new AppError("Project not found", 404);

  const uid = req.user._id.toString();
  const isOwner = project.owner.toString() === uid;
  const isMember = project.members.some((m) => m.toString() === uid);
  const isAdmin = req.user.role === "ADMIN";

  if (!isOwner && !isMember && !isAdmin) {
    throw new AppError("Not authorized for this project", 403);
  }

  req.project = project;
  req.isOwner = isOwner;
  req.isAdmin = isAdmin;
  next();
});

/**
 * Must be used AFTER checkProjectAccess.
 * Blocks anyone except the project owner or an admin.
 * Use for: edit project, delete project, add/remove members.
 */
export const requireProjectOwner = (req, res, next) => {
  if (!req.isOwner && !req.isAdmin) {
    return next(new AppError("Only the project owner can do this", 403));
  }
  next();
};