import { Inbox } from "lucide-react";

export default function EmptyState({ message = "Nothing here yet.", action }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
        <Inbox className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <p className="text-sm text-slate-500 max-w-sm mx-auto dark:text-slate-400">
        {message}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}