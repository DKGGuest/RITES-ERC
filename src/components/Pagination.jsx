import React from "react";
import "./Pagination.css";

const Pagination = ({
  currentPage,
  totalPages,
  start,
  end,
  totalCount,
  onPageChange,
  rows,
  onRowsChange
}) => {
  return (
    <div className="pg-wrapper">

      {/* LEFT: Count */}
      <div className="pg-count">
        {start + 1}–{end} of {totalCount}
      </div>

      {/* MIDDLE: Rows Selector */}
      <div className="pg-rows">
        Rows:
        <select
          value={rows}
          onChange={(e) => onRowsChange(Number(e.target.value))}
        >
          <option value={10}>1</option>
          <option value={20}>2</option>
          <option value={30}>3</option>
          <option value={40}>4</option>
        </select>
      </div>

      {/* RIGHT: Pagination Buttons */}
      <div className="pg-buttons">
        <button
          className="pg-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          ‹ Prev
        </button>

        <button
          className="pg-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          Next ›
        </button>
      </div>

    </div>
  );
};

export default Pagination;
