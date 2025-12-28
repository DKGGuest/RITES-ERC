/**
 * CMIEWorkloadTab Component
 * IE workload monitoring and assignment control
 */

import React from 'react';
import useCMData from '../../../hooks/cm/useCMData';
import DataTable from '../../../components/DataTable';

const CMIEWorkloadTab = () => {
  const { ies, loading } = useCMData();

  const columns = [
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'name', label: 'IE Name' },
    { key: 'assignedCalls', label: 'Assigned Calls' },
    { key: 'pendingInspections', label: 'Pending Inspections' },
    { key: 'underInspection', label: 'Under Inspection' },
    { key: 'icPending', label: 'IC Pending' },
    { key: 'completedThisMonth', label: 'Completed (Month)' },
    { 
      key: 'workloadStatus', 
      label: 'Workload Status',
      render: (val) => {
        let color = '#22c55e';
        let bgColor = '#f0fdf4';
        let borderColor = '#bbf7d0';
        
        if (val === 'Overloaded') {
          color = '#ef4444';
          bgColor = '#fef2f2';
          borderColor = '#fecaca';
        } else if (val === 'High') {
          color = '#f59e0b';
          bgColor = '#fffbeb';
          borderColor = '#fde68a';
        }
        
        return (
          <span style={{
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            background: bgColor,
            color: color,
            border: `1px solid ${borderColor}`
          }}>
            {val}
          </span>
        );
      }
    },
  ];

  const actions = (row) => (
    <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
      <button className="btn btn-sm btn-secondary">View Details</button>
      <button className="btn btn-sm btn-secondary">Reassign Calls</button>
    </div>
  );

  if (loading) {
    return <div>Loading IE workload data...</div>;
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-label">Total IEs</div>
          <div className="stat-value">{ies.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overloaded IEs</div>
          <div className="stat-value">
            {ies.filter(ie => ie.workloadStatus === 'Overloaded').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Pending per IE</div>
          <div className="stat-value">
            {ies.length > 0 
              ? Math.round(ies.reduce((sum, ie) => sum + (ie.pendingInspections || 0), 0) / ies.length)
              : 0
            }
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Pending Calls</div>
          <div className="stat-value">
            {ies.reduce((sum, ie) => sum + (ie.pendingInspections || 0), 0)}
          </div>
        </div>
      </div>

      {/* IE Workload Table */}
      <DataTable
        columns={columns}
        data={ies}
        actions={actions}
        selectable={false}
      />
    </div>
  );
};

export default CMIEWorkloadTab;

