import clsx from "clsx";
import {
  Circle,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Archive,
  PlayCircle,
} from "lucide-react";

const statusStyles = {
  // Task statuses
  TODO: { bg: "bg-slate-100", text: "text-slate-700", icon: Circle },
  IN_PROGRESS: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock },
  REVIEW: { bg: "bg-amber-100", text: "text-amber-700", icon: Eye },
  COMPLETED: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
  // Project statuses
  PLANNING: { bg: "bg-violet-100", text: "text-violet-700", icon: Circle },
  ARCHIVED: { bg: "bg-slate-100", text: "text-slate-600", icon: Archive },
  // shared
};

const priorityStyles = {
  LOW: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  MEDIUM: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  HIGH: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  CRITICAL: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

export function StatusBadge({ status }) {
  const s = statusStyles[status] || statusStyles.TODO;
  const Icon = s.icon;
  return (
    <span className={clsx("badge", s.bg, s.text)}>
      <Icon className="w-3 h-3" />
      {status.replace("_", " ")}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const p = priorityStyles[priority] || priorityStyles.MEDIUM;
  return (
    <span className={clsx("badge", p.bg, p.text)}>
      <span className={clsx("w-1.5 h-1.5 rounded-full", p.dot)} />
      {priority}
    </span>
  );
}

export function StatusDot({ status }) {
  const s = statusStyles[status] || statusStyles.TODO;
  return <span className={clsx("inline-block w-2 h-2 rounded-full", s.text.replace("text-", "bg-"))} />;
}