export const isTaskOverdue = (task, now = new Date()) => {
  if (!task.dueDate) return false;
  if (task.status === "COMPLETED") return false;
  return new Date(task.dueDate) < now;
};
export const buildTaskFilter = (query, projectId) => {
  const filter = { project: projectId };
  if (query.search) filter.title = { $regex: query.search, $options: "i" };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.dueBefore || query.dueAfter) {
    filter.dueDate = {};
    if (query.dueAfter) filter.dueDate.$gte = new Date(query.dueAfter);
    if (query.dueBefore) filter.dueDate.$lte = new Date(query.dueBefore);
  }
  return filter;
};
export const buildTaskSort = (sortKey) => {
  switch (sortKey) {
    case "priority": return { priority: -1 };
    case "dueDate": return { dueDate: 1 };
    default: return { createdAt: -1 };
  }
};
