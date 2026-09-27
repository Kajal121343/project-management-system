import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../../services/api.js";

export const fetchTasks = createAsyncThunk(
  "tasks/fetch",
  async ({ projectId, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/projects/${projectId}/tasks`, { params });
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async ({ projectId, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
      return data.task;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateTaskOptimistic = createAsyncThunk(
  "tasks/updateOptimistic",
  async ({ id, ...payload }, { dispatch, getState, rejectWithValue }) => {
    const prev = getState().tasks.list.find((t) => t._id === id);
    dispatch(tasksSlice.actions.applyOptimisticUpdate({ id, ...payload }));
    try {
      const { data } = await api.patch(`/tasks/${id}`, payload);
      return data.task;
    } catch (err) {
      if (prev) dispatch(tasksSlice.actions.replaceTask(prev));
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/tasks/${id}`, payload);
      return data.task;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const initialFilters = {
  search: "",
  status: "",
  priority: "",
  assignedTo: "",
  dueBefore: "",
  dueAfter: "",
  sort: "createdAt",
  page: 1,
  limit: 10,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    list: [],
    pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, limit: 10 },
    loading: false,
    error: null,
    filters: { ...initialFilters },
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = { ...initialFilters };
    },
    applyOptimisticUpdate: (state, action) => {
      const task = state.list.find((t) => t._id === action.payload.id);
      if (task) Object.assign(task, action.payload);
    },
    replaceTask: (state, action) => {
      const i = state.list.findIndex((t) => t._id === action.payload._id);
      if (i !== -1) state.list[i] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchTasks.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.data;
        s.pagination = a.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(createTask.fulfilled, (s, a) => {
        s.list.unshift(a.payload);
      })
      .addCase(updateTaskOptimistic.fulfilled, (s, a) => {
        const i = s.list.findIndex((t) => t._id === a.payload._id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(deleteTask.fulfilled, (s, a) => {
        s.list = s.list.filter((t) => t._id !== a.payload);
      });
  },
});

export const {
  setFilter,
  setPage,
  resetFilters,
  applyOptimisticUpdate,
  replaceTask,
} = tasksSlice.actions;

export default tasksSlice.reducer;