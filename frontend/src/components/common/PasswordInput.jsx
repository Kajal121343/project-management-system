import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

const PasswordInput = forwardRef(({ className, ...props }, ref) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={show ? "text" : "password"}
        className={clsx("input pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;