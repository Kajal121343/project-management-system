import mongoose from "mongoose";

export const ACTIVITY_ACTIONS = [
  // Project
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "PROJECT_ARCHIVED",
  // Members
  "MEMBER_ADDED",
  "MEMBER_REMOVED",
  // Tasks
  "TASK_CREATED",
  "TASK_UPDATED",
  "TASK_COMPLETED",
  "TASK_DELETED",
  "TASK_ASSIGNED",
];

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ACTIVITY_ACTIONS,
      required: true,
    },
    // Free-form message + metadata
    message: { type: String, required: true },
    // Optional reference to the affected entity
    targetType: {
      type: String,
      enum: ["PROJECT", "TASK", "USER"],
      default: "PROJECT",
    },
    targetId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

// Fast "recent activities for a project" queries
activitySchema.index({ project: 1, createdAt: -1 });

export const Activity = mongoose.model("Activity", activitySchema);