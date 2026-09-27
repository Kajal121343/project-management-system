import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { User } from "../models/User.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-__v").sort({ createdAt: -1 });
  res.json({ users });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  const filter = q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(filter)
    .select("_id name email role")
    .limit(20)
    .sort({ name: 1 });

  res.json({ users });
});

export const promoteToAdmin = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: "ADMIN" },
    { new: true }
  ).select("-__v");
  if (!user) throw new AppError("User not found", 404);
  res.json({ user });
});