export default function Pagination({ currentPage, totalPages, totalRecords, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
      <div>Page {currentPage} of {totalPages} - {totalRecords} total</div>
      <div className="flex gap-2">
        <button className="btn btn-secondary" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Previous</button>
        <button className="btn btn-secondary" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
      </div>
    </div>
  );
}
