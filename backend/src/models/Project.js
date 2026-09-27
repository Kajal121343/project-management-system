import mongoose from "mongoose";
export const PROJECT_STATUS = ["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"];
export const PROJECT_PRIORITY = ["LOW", "MEDIUM", "HIGH"];
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { type: String, enum: PROJECT_STATUS, default: "PLANNING" },
    priority: { type: String, enum: PROJECT_PRIORITY, default: "MEDIUM" },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
projectSchema.index({ owner: 1 });
projectSchema.index({ members: 1 });
export const Project = mongoose.model("Project", projectSchema);
