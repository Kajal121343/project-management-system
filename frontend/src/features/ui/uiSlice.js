import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    // Fall back to system preference
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  } catch {
    // ignore
  }
  return "light";
};

const uiSlice = createSlice({
  name: "ui",
  initialState: { theme: getInitialTheme() },
  reducers: {
    // Pure reducer — no side effects
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = uiSlice.actions;
export default uiSlice.reducer;