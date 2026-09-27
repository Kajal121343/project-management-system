import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { LogIn, Mail, Lock } from "lucide-react";
import { login, clearError } from "../features/auth/authSlice.js";
import PasswordInput from "../components/common/PasswordInput.jsx";
import { toast } from "react-toastify";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error, loading } = useSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = (data) => dispatch(login(data));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-brand-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="card w-full max-w-md p-8 space-y-5"
      >
        <div className="text-center mb-2">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-600 flex items-center justify-center">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to your PM System account
          </p>
        </div>

        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
          </div>
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <PasswordInput
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="error-text">{errors.password.message}</p>
          )}
        </div>

        <button className="btn btn-primary w-full py-2.5" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-sm text-center text-slate-600">
          Don't have an account?{" "}
          <Link className="text-brand-600 font-medium hover:underline" to="/register">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}