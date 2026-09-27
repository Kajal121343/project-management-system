import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  CheckCircle2,
  Archive,
  Activity as ActivityIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "../../services/api.js";
import Avatar from "../common/Avatar.jsx";
import EmptyState from "../common/EmptyState.jsx";
import ErrorState from "../common/ErrorState.jsx";
import { ListSkeleton } from "../common/Skeleton.jsx";

const actionIcon = {
  PROJECT_CREATED: { Icon: Plus, color: "text-brand-600 bg-brand-50" },
  PROJECT_UPDATED: { Icon: Pencil, color: "text-blue-600 bg-blue-50" },
  PROJECT_ARCHIVED: { Icon: Archive, color: "text-amber-600 bg-amber-50" },
  MEMBER_ADDED: { Icon: UserPlus, color: "text-emerald-600 bg-emerald-50" },
  MEMBER_REMOVED: { Icon: UserMinus, color: "text-red-600 bg-red-50" },
  TASK_CREATED: { Icon: Plus, color: "text-brand-600 bg-brand-50" },
  TASK_UPDATED: { Icon: Pencil, color: "text-blue-600 bg-blue-50" },
  TASK_COMPLETED: { Icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  TASK_DELETED: { Icon: Trash2, color: "text-red-600 bg-red-50" },
  TASK_ASSIGNED: { Icon: UserPlus, color: "text-violet-600 bg-violet-50" },
};

export default function ActivityFeed({ projectId }) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: [],
  });

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { data } = await api.get(`/projects/${projectId}/activities`);
      setState({ loading: false, error: null, data: data.data });
    } catch (err) {
      setState({
        loading: false,
        error: err.response?.data?.message || "Unable to load activity.",
        data: [],
      });
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  if (state.loading) return <ListSkeleton rows={4} />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;
  if (state.data.length === 0)
    return <EmptyState message="No activity yet." />;

  return (
    <div className="space-y-1">
      {state.data.map((a) => {
        const cfg = actionIcon[a.action] || {
          Icon: ActivityIcon,
          color: "text-slate-600 bg-slate-50",
        };
        const { Icon, color } = cfg;

        return (
          <div
            key={a._id}
            className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition"
          >
            <div className={`p-2 rounded-full flex-shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800">{a.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <Avatar name={a.actor?.name || "?"} size="xs" />
                <span className="text-xs text-slate-500">
                  {a.actor?.name} ·{" "}
                  {formatDistanceToNow(new Date(a.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}