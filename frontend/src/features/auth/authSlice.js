import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../../services/api.js";

const token = localStorage.getItem("token");

export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("token", data.token);
    return data.user;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const register = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("token", data.token);
    return data.user;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data.user;
  } catch (err) { return rejectWithValue(getErrorMessage(err)); }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, token, isAuthenticated: !!token,
    loading: !!token, error: null, initialized: !token,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null; state.token = null;
      state.isAuthenticated = false; state.error = null;
      state.initialized = true;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const fulfilled = (state, action) => {
      state.loading = false; state.user = action.payload;
      state.isAuthenticated = true; state.initialized = true;
    };
    const rejected = (state, action) => {
      state.loading = false; state.error = action.payload; state.initialized = true;
    };
    builder
      .addCase(login.pending, pending).addCase(login.fulfilled, fulfilled).addCase(login.rejected, rejected)
      .addCase(register.pending, pending).addCase(register.fulfilled, fulfilled).addCase(register.rejected, rejected)
      .addCase(fetchMe.pending, pending).addCase(fetchMe.fulfilled, fulfilled)
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false; state.isAuthenticated = false;
        state.token = null; state.user = null; state.initialized = true;
        localStorage.removeItem("token");
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
