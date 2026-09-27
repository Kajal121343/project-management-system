import { Router } from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from "../controllers/projectController.js";
import { protect } from "../middlewares/auth.js";
import {
  checkProjectAccess,
  requireProjectOwner,
} from "../middlewares/projectAccess.js";
import { validate } from "../middlewares/validate.js";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from "../validators/projectValidator.js";
import { projectRouter as taskRoutes } from "./taskRoutes.js";
import { getProjectActivities } from "../controllers/activityController.js";

const router = Router();
router.use(protect);

// List + Create (any authenticated user)
router
  .route("/")
  .get(getProjects)
  .post(validate(createProjectSchema), createProject);

// Single project — view for owner/member/admin, edit+delete for owner/admin only
router
  .route("/:id")
  .get(checkProjectAccess, getProject)
  .patch(
    checkProjectAccess,
    requireProjectOwner,
    validate(updateProjectSchema),
    updateProject
  )
  .delete(checkProjectAccess, requireProjectOwner, deleteProject);

// Members — owner/admin only
router.post(
  "/:id/members",
  checkProjectAccess,
  requireProjectOwner,
  validate(addMemberSchema),
  addMember
);
router.delete(
  "/:id/members/:userId",
  checkProjectAccess,
  requireProjectOwner,
  removeMember
);

// Nested task routes: /api/projects/:projectId/tasks
router.use("/:projectId/tasks", taskRoutes);
// Activity feed — any project member can view
router.get("/:id/activities", checkProjectAccess, getProjectActivities);

export default router;