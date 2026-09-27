import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Search, X, CalendarDays } from "lucide-react";
import { setFilter, resetFilters } from "../../features/tasks/tasksSlice.js";

export default function TaskFilters() {
  const dispatch = useDispatch();
  const filters = useSelector((s) => s.tasks.filters);
  const project = useSelector((s) => s.projects.current);
  const [search, setSearch] = useState(filters.search);
  const [showDates, setShowDates] = useState(
    Boolean(filters.dueBefore || filters.dueAfter)
  );

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== filters.search) dispatch(setFilter({ search }));
    }, 400);
    return () => clearTimeout(t);
  }, [search, dispatch, filters.search]);

  const activeCount = [
    filters.search,
    filters.status,
    filters.priority,
    filters.assignedTo,
    filters.dueBefore,
    filters.dueAfter,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        {/* Search */}
        <div className="flex-1 min-w-[220px]">
          <label className="label">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={filters.status}
            onChange={(e) => dispatch(setFilter({ status: e.target.value }))}
          >
            <option value="">All</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="REVIEW">REVIEW</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="label">Priority</label>
          <select
            className="input"
            value={filters.priority}
            onChange={(e) => dispatch(setFilter({ priority: e.target.value }))}
          >
            <option value="">All</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className="label">Assignee</label>
          <select
            className="input"
            value={filters.assignedTo}
            onChange={(e) => dispatch(setFilter({ assignedTo: e.target.value }))}
          >
            <option value="">All</option>
            {project?.members?.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="label">Sort</label>
          <select
            className="input"
            value={filters.sort}
            onChange={(e) => dispatch(setFilter({ sort: e.target.value }))}
          >
            <option value="createdAt">Newest</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due date</option>
          </select>
        </div>

        {/* Toggle due date panel */}
        <button
          className={`btn btn-secondary ${
            showDates ? "bg-brand-50 text-brand-700" : ""
          }`}
          onClick={() => setShowDates((s) => !s)}
        >
          <CalendarDays className="w-4 h-4" />
          Due date
        </button>

        {/* Clear all */}
        {activeCount > 0 && (
          <button
            className="btn btn-ghost text-red-600 hover:bg-red-50"
            onClick={() => {
              dispatch(resetFilters());
              setSearch("");
            }}
          >
            <X className="w-4 h-4" />
            Clear ({activeCount})
          </button>
        )}
      </div>

      {/* Due date range panel */}
      {showDates && (
        <div className="flex flex-wrap gap-3 items-end p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div>
            <label className="label">Due after</label>
            <input
              type="datetime-local"
              className="input"
              value={filters.dueAfter || ""}
              onChange={(e) =>
                dispatch(setFilter({ dueAfter: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Due before</label>
            <input
              type="datetime-local"
              className="input"
              value={filters.dueBefore || ""}
              onChange={(e) =>
                dispatch(setFilter({ dueBefore: e.target.value }))
              }
            />
          </div>
          {(filters.dueAfter || filters.dueBefore) && (
            <button
              className="btn btn-secondary"
              onClick={() =>
                dispatch(setFilter({ dueAfter: "", dueBefore: "" }))
              }
            >
              Clear dates
            </button>
          )}
        </div>
      )}
    </div>
  );
}