import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import projectsReducer from "../features/projects/projectsSlice.js";
import tasksReducer from "../features/tasks/tasksSlice.js";
import notificationsReducer from "../features/notifications/notificationsSlice.js";
import uiReducer from "../features/ui/uiSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
  },
});