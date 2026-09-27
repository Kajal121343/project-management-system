import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
console.log("API baseURL =", baseURL);

const api = axios.create({ baseURL });

// Fix: prepend baseURL to relative URLs that start with "/"
api.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith("/")) {
      config.url = config.url.slice(1);
    }
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const getErrorMessage = (err) =>
  err?.response?.data?.message || err.message || "Something went wrong";

export default api;