import { asyncHandler } from "../utils/asyncHandler.js";
import { Notification } from "../models/Notification.js";
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  res.json({ notifications, unreadCount });
});
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true }, { new: true });
  res.json({ notification });
});
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: "All marked as read" });
});
