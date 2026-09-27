import { Notification } from "../models/Notification.js";
export const createNotification = async ({ user, type, message, link }) => {
  try { return await Notification.create({ user, type, message, link }); }
  catch (err) { console.error("Notification create failed:", err.message); return null; }
};
