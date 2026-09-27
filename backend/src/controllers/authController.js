import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";
import { User } from "../models/User.js";
const sendAuth = (res, user, statusCode = 200) => {
  const token = signToken(user._id);
  const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  res.status(statusCode).json({ token, user: safeUser });
};
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new AppError("Email already registered", 400);
  const user = await User.create({ name, email, password, role });
  sendAuth(res, user, 201);
});
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid credentials", 401);
  const ok = await user.comparePassword(password);
  if (!ok) throw new AppError("Invalid credentials", 401);
  sendAuth(res, user);
});
export const logout = asyncHandler(async (req, res) => res.json({ message: "Logged out" }));
export const getMe = asyncHandler(async (req, res) => res.json({ user: req.user }));
