import mongoose from "mongoose";
export const TASK_STATUS = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];
export const TASK_PRIORITY = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: TASK_STATUS, default: "TODO" },
    priority: { type: String, enum: TASK_PRIORITY, default: "MEDIUM" },
    dueDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });
export const Task = mongoose.model("Task", taskSchema);
