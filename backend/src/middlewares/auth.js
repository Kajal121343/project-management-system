import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

/**
 * Verifies JWT from Authorization header.
 * Attaches req.user (fresh from DB) so role changes take effect immediately.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  }

  if (!token) throw new AppError("Not authorized, no token", 401);

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError("User no longer exists", 401);

  req.user = user;
  next();
});

/**
 * Only allows the listed roles to proceed.
 * Usage: restrictTo("ADMIN") or restrictTo("ADMIN", "USER")
 */
export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("Forbidden: insufficient permissions", 403)
      );
    }
    next();
  };