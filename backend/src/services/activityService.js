import { Activity } from "../models/Activity.js";

/**
 * Fire-and-forget: never fails the parent request.
 */
export const logActivity = async ({
  project,
  actor,
  action,
  message,
  targetType,
  targetId,
}) => {
  try {
    return await Activity.create({
      project,
      actor,
      action,
      message,
      targetType,
      targetId,
    });
  } catch (err) {
    console.error("Activity log failed:", err.message);
    return null;
  }
};