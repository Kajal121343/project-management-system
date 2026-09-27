import Modal from "./Modal.jsx";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  loading,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-slate-700 dark:text-slate-300">{message}</p>
      <div className="flex justify-end gap-2 mt-6">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Deleting..." : "Confirm"}
        </button>
      </div>
    </Modal>
  );
}