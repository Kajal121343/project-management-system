import { AppError } from "../utils/AppError.js";
export const notFound = (req, res, next) => next(new AppError(`Route ${req.originalUrl} not found`, 404));
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";
  if (err.name === "CastError") { statusCode = 400; message = "Invalid ID format"; }
  if (err.code === 11000) { statusCode = 400; message = `Duplicate value for: ${Object.keys(err.keyValue).join(", ")}`; }
  if (err.name === "ValidationError") { statusCode = 400; message = Object.values(err.errors).map((e) => e.message).join(", "); }
  if (process.env.NODE_ENV !== "test") console.error(`[${statusCode}] ${message}`);
  res.status(statusCode).json({ message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });
};
