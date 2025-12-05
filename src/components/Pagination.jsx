import React from "react";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, start, end, totalCount, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pg-container">
      <button
        className="pg-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        ‹ Prev
      </button>

      <span className="pg-info">
        Samples {start + 1}–{end} of {totalCount}
      </span>

      <button
        className="pg-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        Next ›
      </button>
    </div>
  );
};

export default Pagination;
