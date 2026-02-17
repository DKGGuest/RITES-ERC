import React, { useState, useMemo } from 'react';
import { mockIEMappings, REGIONS } from './utils/mockData';
import { filterBySearch, paginate } from './utils/helpers';
import { DEFAULT_PAGE_SIZE } from './utils/constants';

export const IEMapping = ({ onEdit, onDelete, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  const filteredMappings = useMemo(() => {
    let result = mockIEMappings;

    if (searchTerm) {
      result = filterBySearch(result, searchTerm, ['ieName', 'poiName', 'cm']);
    }

    if (filterRegion) {
      result = result.filter(mapping => mapping.rio === filterRegion);
    }

    return result;
  }, [searchTerm, filterRegion]);

  const paginatedMappings = useMemo(() => {
    return paginate(filteredMappings, currentPage, pageSize);
  }, [filteredMappings, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredMappings.length / pageSize);
  const ieToCMMappings = mockIEMappings.filter(m => m.mappingType === 'IE to CM').length;
  const ieToPOIMappings = mockIEMappings.filter(m => m.mappingType === 'IE to POI').length;
  const totalMappings = mockIEMappings.length;

  return (
    <div>
      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="metric-card">
          <div className="metric-label">Total Mappings</div>
          <div className="metric-value">{totalMappings}</div>
          <div className="metric-status">All mappings</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">IE to CM</div>
          <div className="metric-value">{ieToCMMappings}</div>
          <div className="metric-status">CM mappings</div>
        </div>
        <div className="metric-card highlight">
          <div className="metric-label">IE to POI</div>
          <div className="metric-value">{ieToPOIMappings}</div>
          <div className="metric-status">POI mappings</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Regions</div>
          <div className="metric-value">{REGIONS.length}</div>
          <div className="metric-status">Available regions</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">IE Mapping List</h2>
            <p className="card-subtitle">Manage IE to CM and IE to POI mappings</p>
          </div>
          <button className="btn btn-primary" onClick={onCreateNew}>
            + Create Mapping
          </button>
        </div>

        <div className="search-filter-bar">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="filter-select">
            <select
              value={filterRegion}
              onChange={(e) => {
                setFilterRegion(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Regions</option>
              {REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Region (RIO)</th>
                <th>Controlling Manager</th>
                <th>Inspecting Engineer</th>
                <th>IE Name</th>
                <th>POI Code</th>
                <th>POI Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMappings.map(mapping => (
                <tr key={mapping.id}>
                  <td>{mapping.rio}</td>
                  <td>{mapping.cm}</td>
                  <td>{mapping.ie}</td>
                  <td>{mapping.ieName}</td>
                  <td>{mapping.poiCode}</td>
                  <td>{mapping.poiName}</td>
                  <td>
                    <span className={`badge badge-${mapping.status === 'Active' ? 'success' : 'danger'}`}>
                      {mapping.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => onEdit(mapping)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => onDelete(mapping.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <div className="pagination-info">
            Showing {paginatedMappings.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredMappings.length)} of {filteredMappings.length} mappings
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span style={{ fontSize: '12px', color: '#666' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
