import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchMe } from "./features/auth/authSlice.js";
import Layout from "./components/layout/Layout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";

export default function App() {
  const dispatch = useDispatch();
  const { token, initialized } = useSelector((s) => s.auth);
  useEffect(() => { if (token && !initialized) dispatch(fetchMe()); }, [token, initialized, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<Layout />}>
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
