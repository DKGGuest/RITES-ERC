import React, { useState, useMemo } from 'react';

// Helper function to recursively search through nested objects and arrays
const deepSearch = (obj, searchText) => {
  if (obj === null || obj === undefined) {
    return false;
  }

  // If it's a primitive value, convert to string and search
  if (typeof obj !== 'object') {
    return String(obj).toLowerCase().includes(searchText);
  }

  // If it's an array, search each element
  if (Array.isArray(obj)) {
    return obj.some(item => deepSearch(item, searchText));
  }

  // If it's an object, search all values recursively
  return Object.values(obj).some(val => deepSearch(val, searchText));
};

const DataTable = ({ columns, data, onRowClick, actions, selectable, selectedRows, onSelectionChange, hideSearch = false, emptyMessage = 'No data available' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const searchText = searchTerm.toLowerCase();
      result = result.filter(row => deepSearch(row, searchText));
    }

    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = paginatedData.map(row => row.id);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (rowId) => {
    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter(id => id !== rowId));
    } else {
      onSelectionChange([...selectedRows, rowId]);
    }
  };

  const isAllSelected = selectable && paginatedData.length > 0 && paginatedData.every(row => selectedRows.includes(row.id));

  return (
    <div className="data-table-wrapper">
      <div className="table-controls">
        {!hideSearch && (
          <input
            type="text"
            className="form-control search-box"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
        <select
          className="form-control"
          style={{ width: '120px' }}
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      <div className="data-table-container">
        <table className="data-table">
        <thead>
          <tr>
            {selectable && (
              <th style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            {columns.map(col => (
              <th key={col.key} onClick={() => handleSort(col.key)}>
                {col.label} {sortColumn === col.key && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, idx) => (
            <tr key={idx} onClick={() => onRowClick && onRowClick(row)}>
              {selectable && (
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                  />
                </td>
              )}
              {columns.map(col => (
                <td key={col.key} data-label={col.label}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && <td data-label="Actions">{actions(row)}</td>}
            </tr>
          ))}
          {paginatedData.length === 0 && (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>

      <div className="table-pagination">
        <div className="pagination-info">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </div>
        <div className="pagination-controls">
          <button
            className="btn btn-sm btn-outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className="btn btn-sm btn-outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
