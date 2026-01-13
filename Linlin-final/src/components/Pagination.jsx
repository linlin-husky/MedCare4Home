import "./Pagination.css";

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="pagination-controls">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      <span className="Pagination-content">
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
