import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../../services/api.js";

export const fetchProjects = createAsyncThunk("projects/fetchAll", async (_, { rejectWithValue }) => {
  try { const { data } = await api.get("/projects"); return data.projects; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const fetchProject = createAsyncThunk("projects/fetchOne", async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/projects/${id}`); return data.project; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const createProject = createAsyncThunk("projects/create", async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post("/projects", payload); return data.project; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const updateProject = createAsyncThunk("projects/update", async ({ id, ...payload }, { rejectWithValue }) => {
  try { const { data } = await api.patch(`/projects/${id}`, payload); return data.project; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const deleteProject = createAsyncThunk("projects/delete", async (id, { rejectWithValue }) => {
  try { await api.delete(`/projects/${id}`); return id; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const addMember = createAsyncThunk("projects/addMember", async ({ projectId, userId }, { rejectWithValue }) => {
  try { const { data } = await api.post(`/projects/${projectId}/members`, { userId }); return data.project; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});
export const removeMember = createAsyncThunk("projects/removeMember", async ({ projectId, userId }, { rejectWithValue }) => {
  try { const { data } = await api.delete(`/projects/${projectId}/members/${userId}`); return data.project; }
  catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

const projectsSlice = createSlice({
  name: "projects",
  initialState: { list: [], current: null, loading: false, error: null },
  reducers: { clearCurrent: (state) => { state.current = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProjects.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchProjects.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProject.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProject.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(fetchProject.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createProject.fulfilled, (s, a) => { s.list.unshift(a.payload); })
      .addCase(updateProject.fulfilled, (s, a) => {
        const i = s.list.findIndex((p) => p._id === a.payload._id);
        if (i !== -1) s.list[i] = a.payload;
        if (s.current?._id === a.payload._id) s.current = a.payload;
      })
      .addCase(deleteProject.fulfilled, (s, a) => {
        s.list = s.list.filter((p) => p._id !== a.payload);
        if (s.current?._id === a.payload) s.current = null;
      })
      .addCase(addMember.fulfilled, (s, a) => {
        if (s.current?._id === a.payload._id) s.current = a.payload;
        const i = s.list.findIndex((p) => p._id === a.payload._id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(removeMember.fulfilled, (s, a) => {
        if (s.current?._id === a.payload._id) s.current = a.payload;
        const i = s.list.findIndex((p) => p._id === a.payload._id);
        if (i !== -1) s.list[i] = a.payload;
      });
  },
});
export const { clearCurrent } = projectsSlice.actions;
export default projectsSlice.reducer;
