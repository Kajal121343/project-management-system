import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateProject } from "../../features/projects/projectsSlice.js";
import Modal from "../common/Modal.jsx";

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

// Convert ISO date string → datetime-local format
const toLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const tzoffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
};

export default function EditProjectModal({ open, onClose, project }) {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      status: "PLANNING",
      priority: "MEDIUM",
      startDate: "",
      dueDate: "",
    },
  });

  // Reset form with the selected project's values whenever it changes
  useEffect(() => {
    if (project && open) {
      reset({
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: toLocal(project.startDate),
        dueDate: toLocal(project.dueDate),
      });
    }
  }, [project, open, reset]);

  const onSubmit = async (data) => {
    const action = await dispatch(
      updateProject({ id: project._id, ...data })
    );
    if (updateProject.fulfilled.match(action)) {
      toast.success("Project updated");
      onClose();
    } else {
      toast.error(action.payload);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Project">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input className="input" {...register("name")} />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} {...register("description")} />
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
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}