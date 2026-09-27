import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { UserPlus, User as UserIcon, Mail } from "lucide-react";
import { register as registerUser, clearError } from "../features/auth/authSlice.js";
import PasswordInput from "../components/common/PasswordInput.jsx";
import { toast } from "react-toastify";

const schema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string().min(6, "Minimum 6 characters"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Register() {
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

  const onSubmit = (data) => {
    const { confirmPassword, ...payload } = data;
    dispatch(registerUser(payload));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            TaskTracky
          </h1>
          <p className="text-sm text-slate-500 mt-2 dark:text-slate-400">
            Get organized in seconds.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card p-8 space-y-5"
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Create your account
            </h2>
            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
              Free forever. No credit card needed.
            </p>
          </div>

          <div>
            <label className="label">Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="Your full name"
                autoComplete="name"
                {...register("name")}
              />
            </div>
            {errors.name && <p className="error-text">{errors.name.message}</p>}
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
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <PasswordInput
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            className="btn btn-primary w-full py-2.5 shadow-lg shadow-brand-500/25"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-sm text-center text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              className="text-brand-600 font-medium hover:underline dark:text-brand-400"
              to="/login"
            >
              Sign in
            </Link>
          </p>
        </form>

        <p className="text-xs text-center text-slate-400 mt-6 dark:text-slate-500">
          © 2026 TaskTracky
        </p>
      </div>
    </div>
  );
}