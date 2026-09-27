import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { AlertTriangle, Calendar, User as UserIcon } from "lucide-react";
import { isPast, formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import Avatar from "../common/Avatar.jsx";
import { PriorityBadge } from "../common/Badges.jsx";
import { updateTaskOptimistic } from "../../features/tasks/tasksSlice.js";

const COLUMNS = [
  { id: "TODO", label: "To Do", color: "bg-slate-500", ring: "ring-slate-200" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500", ring: "ring-blue-200" },
  { id: "REVIEW", label: "Review", color: "bg-amber-500", ring: "ring-amber-200" },
  { id: "COMPLETED", label: "Completed", color: "bg-emerald-500", ring: "ring-emerald-200" },
];

export default function KanbanBoard({ tasks, onTaskClick }) {
  const dispatch = useDispatch();

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {});

  const onDragEnd = async (result) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    const action = await dispatch(
      updateTaskOptimistic({ id: draggableId, status: newStatus })
    );

    if (updateTaskOptimistic.rejected.match(action)) {
      toast.error(action.payload || "Failed to move task");
    } else {
      toast.success(`Moved to ${newStatus.replace("_", " ")}`);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={clsx("w-2.5 h-2.5 rounded-full", col.color)} />
                <h3 className="font-semibold text-sm text-slate-700">{col.label}</h3>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {grouped[col.id].length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={clsx(
                    "flex-1 min-h-[200px] rounded-xl p-2 space-y-2 transition-colors",
                    snapshot.isDraggingOver
                      ? "bg-brand-50 ring-2 ring-brand-200"
                      : "bg-slate-100/50"
                  )}
                >
                  {grouped[col.id].map((task, index) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      index={index}
                      onClick={() => onTaskClick?.(task)}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

function TaskCard({ task, index, onClick }) {
  const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "COMPLETED";

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={clsx(
            "bg-white rounded-lg border border-slate-200 p-3 cursor-pointer select-none transition-shadow",
            snapshot.isDragging
              ? "shadow-lg ring-2 ring-brand-400 rotate-1"
              : "hover:shadow-md"
          )}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-sm text-slate-900 line-clamp-2 flex-1">
              {task.title}
            </h4>
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-3">
            <PriorityBadge priority={task.priority} />
            {overdue && (
              <span className="badge bg-red-100 text-red-700">
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              {task.assignedTo ? (
                <>
                  <Avatar name={task.assignedTo.name} size="xs" />
                  <span className="truncate max-w-[100px]">{task.assignedTo.name}</span>
                </>
              ) : (
                <>
                  <UserIcon className="w-3 h-3" />
                  <span>Unassigned</span>
                </>
              )}
            </div>

            {task.dueDate && (
              <div
                className={clsx(
                  "flex items-center gap-1 text-xs",
                  overdue ? "text-red-600 font-medium" : "text-slate-500"
                )}
                title={new Date(task.dueDate).toLocaleString()}
              >
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}