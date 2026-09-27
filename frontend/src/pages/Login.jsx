import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Soft gradient glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-300/20 dark:bg-brand-500/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo + Brand */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="absolute inset-0 rounded-2xl bg-brand-500/30 blur-xl" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-7 h-7 text-white"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-4">
            TaskTracky
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 tracking-wide">
            Manage projects. Ship faster.
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card p-7 sm:p-8 space-y-5 backdrop-blur-sm"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-[11px] font-medium tracking-wide uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              Sign in
            </span>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter your credentials to continue
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
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="label">Password</label>
            <PasswordInput
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 shadow-md shadow-brand-500/20 group"
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500">
                or
              </span>
            </div>
          </div>

          <p className="text-sm text-center text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              className="text-brand-600 font-medium hover:underline underline-offset-2 dark:text-brand-400"
              to="/register"
            >
              Create one
            </Link>
          </p>
        </form>

        <p className="text-[11px] text-center text-slate-400 mt-6 dark:text-slate-500 tracking-wide">
          © 2026 TaskTracky · Built with MERN Stack
        </p>
      </div>
    </div>
  );
}