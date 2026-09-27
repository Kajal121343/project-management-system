import { useEffect, useState } from "react";
import {
  FolderKanban,
  PlayCircle,
  CheckCircle2,
  ListTodo,
  Clock,
  AlertTriangle,
  Flag,
  TrendingUp,
} from "lucide-react";
import api from "../services/api.js";
import StatCard from "../components/common/StatCard.jsx";
import {
  StatCardSkeleton,
  ListSkeleton,
  Skeleton,
} from "../components/common/Skeleton.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  const load = async () => {
    setState({ loading: true, error: null, data: null });
    try {
      const { data } = await api.get("/dashboard");
      setState({ loading: false, error: null, data });
    } catch (err) {
      setState({
        loading: false,
        error: err.response?.data?.message || "Unable to load dashboard.",
        data: null,
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const { stats, overdueTasks, projectProgress } = state.data || {};

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
            Overview of your projects and tasks
          </p>
        </div>
        <button onClick={load} className="btn btn-secondary">
          <TrendingUp className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {state.loading ? (
          Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderKanban} color="brand" />
            <StatCard label="Active Projects" value={stats.activeProjects} icon={PlayCircle} color="blue" />
            <StatCard label="Completed" value={stats.completedProjects} icon={CheckCircle2} color="green" />
            <StatCard label="Total Tasks" value={stats.totalTasks} icon={ListTodo} color="slate" />
            <StatCard label="Pending" value={stats.pendingTasks} icon={Clock} color="yellow" />
            <StatCard label="Done" value={stats.completedTasks} icon={CheckCircle2} color="green" />
            <StatCard label="Overdue" value={stats.overdueTasks} icon={AlertTriangle} color="red" />
            <StatCard label="High Priority" value={stats.highPriorityTasks} icon={Flag} color="orange" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Project Progress
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {projectProgress?.length || 0} project(s)
            </span>
          </div>

          {state.loading ? (
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          ) : projectProgress?.length === 0 ? (
            <EmptyState message="No project data yet." />
          ) : (
            <div className="space-y-5">
              {projectProgress.map((p) => (
                <div key={p.projectId}>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium text-slate-700 truncate dark:text-slate-200">
                      {p.name}
                    </span>
                    <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                      {p.completed}/{p.total} · {p.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden dark:bg-slate-800">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 dark:text-white">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Overdue Tasks
            </h2>
            {overdueTasks?.length > 0 && (
              <span className="badge bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                {overdueTasks.length}
              </span>
            )}
          </div>

          {state.loading ? (
            <ListSkeleton rows={3} />
          ) : overdueTasks?.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center dark:bg-emerald-900/30">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                All caught up! 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {overdueTasks.map((t) => (
                <div
                  key={t._id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50 border border-red-100 hover:bg-red-50 transition dark:bg-red-900/20 dark:border-red-900/40 dark:hover:bg-red-900/30"
                >
                  <div className="w-1 h-full min-h-[40px] bg-red-500 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900 truncate dark:text-white">
                      {t.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate dark:text-slate-400">
                      {t.project?.name} ·{" "}
                      <span className="text-red-600 font-medium dark:text-red-400">
                        {formatDistanceToNow(new Date(t.dueDate), {
                          addSuffix: true,
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}