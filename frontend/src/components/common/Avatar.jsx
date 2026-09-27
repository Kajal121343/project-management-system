import clsx from "clsx";

const sizes = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

const colors = [
  "bg-brand-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-teal-500",
];

export default function Avatar({ name = "?", size = "md", className, title }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div
      title={title || name}
      className={clsx(
        "rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ring-2 ring-white",
        sizes[size],
        colors[colorIndex],
        className
      )}
    >
      {initials}
    </div>
  );
}

export function AvatarStack({ users = [], max = 3 }) {
  const visible = users.slice(0, max);
  const extra = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((u) => (
        <Avatar key={u._id} name={u.name} size="xs" />
      ))}
      {extra > 0 && (
        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">
          +{extra}
        </div>
      )}
    </div>
  );
}