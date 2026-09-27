import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { User as UserIcon, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  register as registerUser,
  clearError,
} from "../features/auth/authSlice.js";
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
    <div className="min-h-screen grid lg:grid-cols-5 bg-white dark:bg-slate-950">
      {/* LEFT — Hero panel */}
      <div className="hidden lg:flex lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 text-white w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5"
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
            <span className="font-bold tracking-tight text-lg">TaskTracky</span>
          </div>

          <div className="max-w-md">
            <h2 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
              Get organized in seconds. Free forever.
            </h2>
            <p className="text-sm text-white/70 mt-4 leading-relaxed">
              Create projects, assign tasks, track progress, and collaborate
              with your team — all in one place.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Free forever, no credit card",
                "Unlimited projects & tasks",
                "Invite team members",
                "Dark mode included",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/85">
                  <CheckCircle2 className="w-4 h-4 text-brand-200 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/50 tracking-wide">
            © 2026 TaskTracky · Built with MERN Stack
          </p>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="lg:col-span-3 flex items-center justify-center p-6 sm:p-10 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/25">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
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
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              TaskTracky
            </span>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="card p-7 sm:p-8 space-y-4"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-[11px] font-medium tracking-wide uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Get started
              </span>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                Create your account
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <PasswordInput
                placeholder="Create a password"
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
                placeholder="Confirm your password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="error-text">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 shadow-md shadow-brand-500/20 group"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <p className="text-sm text-center text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                className="text-brand-600 font-medium hover:underline underline-offset-2 dark:text-brand-400"
                to="/login"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}