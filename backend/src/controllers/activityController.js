import { asyncHandler } from "../utils/asyncHandler.js";
import { Activity } from "../models/Activity.js";

export const getProjectActivities = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 30);
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find({ project: req.project._id })
      .populate("actor", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Activity.countDocuments({ project: req.project._id }),
  ]);

  res.json({
    data: activities,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1,
      totalRecords: total,
      limit,
    },
  });
});