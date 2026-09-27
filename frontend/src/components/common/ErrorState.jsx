import { AlertTriangle } from "lucide-react";

export default function ErrorState({
  message = "Something went wrong.",
  onRetry,
}) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center dark:bg-red-900/30">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <p className="text-sm text-red-600 max-w-sm mx-auto dark:text-red-400">
        {message}
      </p>
      {onRetry && (
        <button className="btn btn-secondary mt-4" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}