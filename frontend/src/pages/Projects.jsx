import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  Plus,
  Calendar,
  Trash2,
  ArrowRight,
  Search,
  Pencil,
  Archive,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import {
  fetchProjects,
  createProject,
  deleteProject,
  updateProject,
} from "../features/projects/projectsSlice.js";
import { ListSkeleton } from "../components/common/Skeleton.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import Modal from "../components/common/Modal.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import { StatusBadge, PriorityBadge } from "../components/common/Badges.jsx";
import { AvatarStack } from "../components/common/Avatar.jsx";
import EditProjectModal from "../components/projects/EditProjectModal.jsx";

const schema = z
  .object({
    name: z.string().min(3, "Min 3 chars"),
    description: z.string().min(5, "Min 5 chars"),
    status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    startDate: z.string().min(1, "Start date is required"),
    dueDate: z.string().min(1, "Due date is required"),
  })
  .refine((d) => new Date(d.dueDate) >= new Date(d.startDate), {
    message: "Due date must be after start date",
    path: ["dueDate"],
  });

const priorityStrip = {
  LOW: "bg-slate-300",
  MEDIUM: "bg-blue-400",
  HIGH: "bg-amber-400",
};

export default function Projects() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((s) => s.projects);
  const authUser = useSelector((s) => s.auth.user);

  const [modal, setModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "PLANNING",
      priority: "MEDIUM",
      startDate: new Date().toISOString().slice(0, 16),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const canManageProject = (p) =>
    authUser?.role === "ADMIN" ||
    (p.owner?._id && authUser?._id && p.owner._id === authUser._id);

  const onSubmit = async (data) => {
    const action = await dispatch(createProject(data));
    if (createProject.fulfilled.match(action)) {
      toast.success("Project created");
      reset();
      setModal(false);
    } else {
      toast.error(action.payload);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const action = await dispatch(deleteProject(confirmDelete._id));
    setDeleting(false);
    if (deleteProject.fulfilled.match(action)) {
      toast.success("Project deleted");
      setConfirmDelete(null);
    } else {
      toast.error(action.payload);
    }
  };

  const handleArchive = async (project) => {
    const action = await dispatch(
      updateProject({ id: project._id, status: "ARCHIVED" })
    );
    if (updateProject.fulfilled.match(action)) {
      toast.success("Project archived");
    } else {
      toast.error(action.payload);
    }
  };

  const filtered = list.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Projects
          </h1>
          <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
            {list.length} project{list.length === 1 ? "" : "s"} total
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          className="input pl-9"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <ListSkeleton rows={4} />}

      {error && (
        <ErrorState
          message={error}
          onRetry={() => dispatch(fetchProjects())}
        />
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          message={
            search
              ? "No projects match your search."
              : "No projects yet. Create your first project to get started."
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p._id}
              className="card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group"
            >
              <div className={clsx("h-1", priorityStrip[p.priority])} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-slate-900 line-clamp-1 flex-1 dark:text-white">
                    {p.name}
                  </h3>
                  <StatusBadge status={p.status} />
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-4 min-h-[2.5rem] dark:text-slate-400">
                  {p.description}
                </p>

                <div className="flex items-center gap-3 mb-4">
                  <PriorityBadge priority={p.priority} />
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(new Date(p.dueDate), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <AvatarStack users={p.members || []} />

                  <div className="flex gap-1">
                    <Link
                      to={`/projects/${p._id}`}
                      className="btn btn-ghost p-2 text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-slate-800"
                      title="Open project"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {canManageProject(p) && (
                      <>
                        <button
                          className="btn btn-ghost p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          onClick={() => {
                            setEditingProject(p);
                            setEditModal(true);
                          }}
                          title="Edit project"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {p.status !== "ARCHIVED" && (
                          <button
                            className="btn btn-ghost p-2 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-slate-800"
                            onClick={() => handleArchive(p)}
                            title="Archive project"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          className="btn btn-ghost p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-800"
                          onClick={() => setConfirmDelete(p)}
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Project">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              placeholder="My awesome project"
              {...register("name")}
            />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="What is this project about?"
              {...register("description")}
            />
            {errors.description && (
              <p className="error-text">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select className="input" {...register("status")}>
                <option value="PLANNING">PLANNING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" {...register("priority")}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date & Time</label>
              <input
                type="datetime-local"
                className="input"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="error-text">{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="label">Due Date & Time</label>
              <input
                type="datetime-local"
                className="input"
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <p className="error-text">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        message={`Delete "${confirmDelete?.name}"? This will also delete all its tasks.`}
        loading={deleting}
      />

      <EditProjectModal
        open={editModal}
        onClose={() => {
          setEditModal(false);
          setEditingProject(null);
        }}
        project={editingProject}
      />
    </div>
  );
}