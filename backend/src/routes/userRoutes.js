import { Router } from "express";
import {
  getAllUsers,
  promoteToAdmin,
  searchUsers,
} from "../controllers/userController.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = Router();

// Any authenticated user — for member picker
router.get("/search", protect, searchUsers);

// ADMIN only
router.get("/", protect, restrictTo("ADMIN"), getAllUsers);
router.patch("/:id/promote", protect, restrictTo("ADMIN"), promoteToAdmin);

export default router;