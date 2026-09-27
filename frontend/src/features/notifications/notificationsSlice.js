import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

export const fetchNotifications = createAsyncThunk("notifications/fetch", async () => {
  const { data } = await api.get("/notifications");
  return data;
});
export const markRead = createAsyncThunk("notifications/markRead", async (id) => {
  await api.patch(`/notifications/${id}/read`);
  return id;
});
export const markAllRead = createAsyncThunk("notifications/markAllRead", async () => {
  await api.patch("/notifications/read-all");
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (s) => { s.loading = true; })
      .addCase(fetchNotifications.fulfilled, (s, a) => { s.loading = false; s.list = a.payload.notifications; s.unreadCount = a.payload.unreadCount; })
      .addCase(fetchNotifications.rejected, (s) => { s.loading = false; })
      .addCase(markRead.fulfilled, (s, a) => {
        const n = s.list.find((x) => x._id === a.payload);
        if (n && !n.isRead) { n.isRead = true; s.unreadCount = Math.max(0, s.unreadCount - 1); }
      })
      .addCase(markAllRead.fulfilled, (s) => {
        s.list.forEach((n) => (n.isRead = true));
        s.unreadCount = 0;
      });
  },
});
export default notificationsSlice.reducer;
