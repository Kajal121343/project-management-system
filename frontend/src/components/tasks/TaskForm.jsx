import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { createTask } from "../../features/tasks/tasksSlice.js";

const schema = z.object({
  title: z.string().min(2, "Min 2 chars"),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  dueDate: z.string().optional(),
});

export default function TaskForm({ projectId, members, onSuccess }) {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "TODO",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 86400000)
        .toISOString()
        .slice(0, 16),
    },
  });

  const onSubmit = async (data) => {
    const action = await dispatch(
      createTask({
        projectId,
        ...data,
      })
    );

    if (createTask.fulfilled.match(action)) {
      toast.success("Task created");
      onSuccess?.();
    } else {
      toast.error(action.payload);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3"
    >
      <div>
        <label className="label">Title</label>

        <input
          className="input"
          {...register("title")}
        />

        {errors.title && (
          <p className="error-text">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="label">Description</label>

        <textarea
          className="input"
          rows={3}
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Assigned To</label>

          <select
            className="input"
            {...register("assignedTo")}
          >
            <option value="">Unassigned</option>

            {members.map((m) => (
              <option
                key={m._id}
                value={m._id}
              >
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Due Date & Time</label>

          <input
            type="datetime-local"
            className="input"
            {...register("dueDate")}
          />

          {errors.dueDate && (
            <p className="error-text">
              {errors.dueDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Status</label>

          <select
            className="input"
            {...register("status")}
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="REVIEW">REVIEW</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        <div>
          <label className="label">Priority</label>

          <select
            className="input"
            {...register("priority")}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Task"}
        </button>
      </div>
    </form>
  );
}