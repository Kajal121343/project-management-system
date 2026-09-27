import mongoose from "mongoose";
export const NOTIFICATION_TYPES = ["PROJECT_ADDED", "TASK_ASSIGNED", "TASK_COMPLETED", "TASK_DUE_SOON"];
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const Notification = mongoose.model("Notification", notificationSchema);
