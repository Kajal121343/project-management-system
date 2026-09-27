import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Plus,
  Users,
  LayoutGrid,
  List,
  Calendar,
  Trash2,
  ArrowLeft,
  X,
  UserPlus,
  Pencil,
  History,
  Activity as ActivityIcon,
  CheckSquare,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import {
  fetchProject,
  addMember,
  removeMember,
  clearCurrent,
} from "../features/projects/projectsSlice.js";
import {
  fetchTasks,
  setPage,
  updateTaskOptimistic,
  deleteTask,
} from "../features/tasks/tasksSlice.js";
import api from "../services/api.js";
import Loader from "../components/common/Loader.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import Modal from "../components/common/Modal.jsx";
import Pagination from "../components/common/Pagination.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import TaskForm from "../components/tasks/TaskForm.jsx";
import TaskFilters from "../components/tasks/TaskFilters.jsx";
import KanbanBoard from "../components/tasks/KanbanBoard.jsx";
import Avatar from "../components/common/Avatar.jsx";
import { StatusBadge, PriorityBadge } from "../components/common/Badges.jsx";
import EditProjectModal from "../components/projects/EditProjectModal.jsx";
import ActivityFeed from "../components/projects/ActivityFeed.jsx";

export default function ProjectDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    current: project,
    loading: pLoading,
    error: pError,
  } = useSelector((s) => s.projects);

  const {
    list: tasks,
    loading: tLoading,
    error: tError,
    filters,
    pagination,
  } = useSelector((s) => s.tasks);

  const authUser = useSelector((s) => s.auth.user);

  const [tab, setTab] = useState("tasks"); // "tasks" | "activity" | "members"
  const [taskView, setTaskView] = useState("list");
  const [taskModal, setTaskModal] = useState(false);
  const [confirmTask, setConfirmTask] = useState(null);
  const [editProjectModal, setEditProjectModal] = useState(false);

  useEffect(() => {
    dispatch(fetchProject(id));
    return () => dispatch(clearCurrent());
  }, [id, dispatch]);

  useEffect(() => {
    if (tab === "tasks") {
      dispatch(fetchTasks({ projectId: id, params: filters }));
    }
  }, [id, filters, dispatch, tab]);

  const isOwner = project && authUser && project.owner?._id === authUser._id;
  const isAdmin = authUser?.role === "ADMIN";
  const canManage = isOwner || isAdmin;

  const canDeleteTask = (t) =>
    isAdmin ||
    isOwner ||
    t.assignedTo?._id === authUser?._id ||
    t.createdBy?._id === authUser?._id;

  const handleStatusChange = async (task, status) => {
    const action = await dispatch(updateTaskOptimistic({ id: task._id, status }));
    if (updateTaskOptimistic.rejected.match(action)) {
      toast.error(action.payload);
    } else {
      toast.success("Task updated");
      dispatch(fetchTasks({ projectId: id, params: filters }));
    }
  };

  const handleDeleteTask = async () => {
    if (!confirmTask) return;
    const action = await dispatch(deleteTask(confirmTask._id));
    if (deleteTask.fulfilled.match(action)) {
      toast.success("Task deleted");
      setConfirmTask(null);
    } else {
      toast.error(action.payload);
    }
  };

  if (pLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader text="Loading project..." />
      </div>
    );
  }

  if (pError) {
    return (
      <ErrorState
        message={pError}
        onRetry={() => dispatch(fetchProject(id))}
      />
    );
  }

  if (!project) {
    return <EmptyState message="Project not found." />;
  }

  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const progress =
    tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  const tabs = [
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "activity", label: "Activity", icon: ActivityIcon },
    { id: "members", label: "Members", icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-3 dark:text-slate-400"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>

        <div className="card p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {project.name}
                </h1>
                <StatusBadge status={project.status} />
                <PriorityBadge priority={project.priority} />
              </div>

              <p className="text-sm text-slate-600 mb-4 dark:text-slate-400">
                {project.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-xs">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Start</p>
                    <p className="text-slate-700 font-medium dark:text-slate-200">
                      {format(new Date(project.startDate), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Due</p>
                    <p className="text-slate-700 font-medium dark:text-slate-200">
                      {format(new Date(project.dueDate), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Avatar name={project.owner?.name || "?"} size="xs" className="mt-0.5" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Owner</p>
                    <p className="text-slate-700 font-medium dark:text-slate-200">
                      {project.owner?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Users className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Members</p>
                    <p className="text-slate-700 font-medium dark:text-slate-200">
                      {project.members?.length || 0} member(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <History className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Created</p>
                    <p className="text-slate-700 font-medium dark:text-slate-200">
                      {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <History className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Last updated</p>
                    <p className="text-slate-700 font-medium dark:text-slate-200">
                      {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-xs text-slate-500 mb-2 dark:text-slate-400">
                  <span>Progress</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {completed}/{tasks.length} · {progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden dark:bg-slate-800">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-brand-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {canManage && (
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditProjectModal(true)}
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={clsx(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition",
              tab === tabId
                ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* TASKS TAB */}
      {tab === "tasks" && (
        <div className="card">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Tasks
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
                  {tasks.length} task{tasks.length === 1 ? "" : "s"} in this project
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 rounded-lg p-1 dark:bg-slate-800">
                  <button
                    onClick={() => setTaskView("list")}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition",
                      taskView === "list"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    )}
                  >
                    <List className="w-3.5 h-3.5" />
                    List
                  </button>
                  <button
                    onClick={() => setTaskView("board")}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition",
                      taskView === "board"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    )}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Board
                  </button>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setTaskModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>
            </div>

            {taskView === "list" && <TaskFilters />}
          </div>

          <div className="p-5">
            {tLoading && <Loader text="Loading tasks..." />}

            {tError && (
              <ErrorState
                message={tError}
                onRetry={() =>
                  dispatch(fetchTasks({ projectId: id, params: filters }))
                }
              />
            )}

            {!tLoading && !tError && tasks.length === 0 && (
              <EmptyState message="No tasks found. Create your first task." />
            )}

            {!tLoading && !tError && tasks.length > 0 && taskView === "list" && (
              <div className="space-y-3">
                {tasks.map((t) => {
                  const overdue =
                    t.dueDate &&
                    new Date(t.dueDate) < new Date() &&
                    t.status !== "COMPLETED";

                  return (
                    <div
                      key={t._id}
                      className="border border-slate-200 rounded-lg p-4 hover:border-brand-300 transition-colors dark:border-slate-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-medium text-slate-900 dark:text-white">
                              {t.title}
                            </h3>
                            <PriorityBadge priority={t.priority} />
                            {overdue && (
                              <span className="badge bg-red-100 text-red-700">
                                Overdue
                              </span>
                            )}
                          </div>

                          {t.description && (
                            <p className="text-sm text-slate-600 mb-3 dark:text-slate-400">
                              {t.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                            {t.assignedTo ? (
                              <div className="flex items-center gap-1.5">
                                <Avatar name={t.assignedTo.name} size="xs" />
                                {t.assignedTo.name}
                              </div>
                            ) : (
                              <span>Unassigned</span>
                            )}

                            {t.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(t.dueDate), "MMM d, yyyy")}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <select
                            className="input text-xs py-1.5 min-w-[130px]"
                            value={t.status}
                            onChange={(e) => handleStatusChange(t, e.target.value)}
                          >
                            <option value="TODO">TODO</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="REVIEW">REVIEW</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>

                          {canDeleteTask(t) && (
                            <button
                              className="text-red-600 text-xs hover:underline flex items-center gap-1"
                              onClick={() => setConfirmTask(t)}
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!tLoading && !tError && tasks.length > 0 && taskView === "board" && (
              <KanbanBoard tasks={tasks} />
            )}

            {taskView === "list" && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalRecords={pagination.totalRecords}
                onPageChange={(page) => dispatch(setPage(page))}
              />
            )}
          </div>
        </div>
      )}

      {/* ACTIVITY TAB */}
      {tab === "activity" && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Activity
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Recent project updates
            </span>
          </div>
          <ActivityFeed projectId={id} />
        </div>
      )}

      {/* MEMBERS TAB */}
      {tab === "members" && (
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Members
          </h2>
          {canManage ? (
            <MemberManager
              project={project}
              onAdd={async (userId) => {
                const action = await dispatch(addMember({ projectId: id, userId }));
                if (addMember.fulfilled.match(action)) toast.success("Member added");
                else toast.error(action.payload);
              }}
              onRemove={async (userId) => {
                const action = await dispatch(removeMember({ projectId: id, userId }));
                if (removeMember.fulfilled.match(action)) toast.success("Member removed");
                else toast.error(action.payload);
              }}
            />
          ) : (
            <ul className="space-y-2">
              {project.members?.length === 0 ? (
                <p className="text-sm text-slate-500 italic dark:text-slate-400">
                  No members yet.
                </p>
              ) : (
                project.members.map((m) => (
                  <li key={m._id} className="flex items-center gap-2 p-2">
                    <Avatar name={m.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">
                        {m.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {m.email}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="New Task">
        <TaskForm
          projectId={id}
          members={project.members || []}
          onSuccess={() => {
            setTaskModal(false);
            dispatch(fetchTasks({ projectId: id, params: filters }));
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!confirmTask}
        onClose={() => setConfirmTask(null)}
        onConfirm={handleDeleteTask}
        message={`Delete task "${confirmTask?.title}"?`}
      />

      <EditProjectModal
        open={editProjectModal}
        onClose={() => setEditProjectModal(false)}
        project={project}
      />
    </div>
  );
}

function MemberManager({ project, onAdd, onRemove }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const authUser = useSelector((s) => s.auth.user);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const url = authUser?.role === "ADMIN" ? "/users" : "/users/search";
        const { data } = await api.get(url);
        if (mounted) setUsers(data.users);
      } catch {}
      finally {
        if (mounted) setLoadingUsers(false);
      }
    })();
    return () => { mounted = false; };
  }, [authUser]);

  useEffect(() => {
    if (authUser?.role === "ADMIN") return;
    let mounted = true;
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/users/search?q=${search}`);
        if (mounted) setUsers(data.users);
      } catch {}
    }, 350);
    return () => { mounted = false; clearTimeout(t); };
  }, [search, authUser]);

  const memberIds = project.members?.map((m) => m._id) || [];
  const candidates = users.filter(
    (u) => !memberIds.includes(u._id) && u._id !== project.owner?._id
  );

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3 dark:text-slate-200">
          Current Members ({project.members?.length || 0})
        </h4>
        {project.members?.length === 0 ? (
          <p className="text-sm text-slate-500 italic dark:text-slate-400">
            No members yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {project.members.map((m) => (
              <li key={m._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="flex items-center gap-2">
                  <Avatar name={m.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                      {m.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {m.email}
                    </p>
                  </div>
                </div>
                <button
                  className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                  onClick={() => onRemove(m._id)}
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5 dark:text-slate-200">
          <UserPlus className="w-4 h-4" />
          Add Member
        </h4>

        <input
          className="input mb-2"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loadingUsers ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading users...
          </p>
        ) : candidates.length === 0 ? (
          <p className="text-sm text-slate-500 italic dark:text-slate-400">
            {search ? "No matching users found." : "All available users are already members."}
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 dark:border-slate-800 dark:divide-slate-800">
            {candidates.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar name={u.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate dark:text-white">
                      {u.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                      {u.email}
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-primary text-xs px-3 py-1"
                  onClick={() => {
                    onAdd(u._id);
                    setSearch("");
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}