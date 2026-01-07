/**
 * CMCallMonitoringTab Component
 * Call monitoring tab with KPI tiles and inspection calls table
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCMData from '../../../hooks/cm/useCMData';
import DataTable from '../../../components/DataTable';
import { formatDate } from '../../../utils/helpers';
import { CALL_STATUS_CONFIG } from '../../../utils/cm/constants';
import { ROUTES } from '../../../routes';

const CMCallMonitoringTab = ({ dashboardKPIs }) => {
  const navigate = useNavigate();
  const { inspectionCalls } = useCMData();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // KPI Tiles
  const kpiTiles = [
    {
      label: 'Total Inspection Calls',
      value: dashboardKPIs.totalCalls || 0,
      description: 'All calls assigned to IEs',
      onClick: () => {}
    },
    {
      label: 'Pending Inspections',
      value: dashboardKPIs.pendingInspections || 0,
      description: 'Assigned + Not Started',
      onClick: () => {}
    },
    {
      label: 'Under Inspection',
      value: dashboardKPIs.underInspection || 0,
      description: 'Currently in progress',
      onClick: () => {}
    },
    {
      label: 'Pending ICs',
      value: dashboardKPIs.pendingICs || 0,
      description: 'Awaiting IC issuance',
      onClick: () => {}
    },
    {
      label: 'Calls Under Billing',
      value: dashboardKPIs.callsUnderBilling || 0,
      description: 'In billing stage',
      onClick: () => {}
    },
    {
      label: 'Pending Approvals',
      value: dashboardKPIs.pendingApprovals || 0,
      description: 'CM Action Required',
      onClick: () => navigate(ROUTES.CM_APPROVALS)
    },
    {
      label: 'SLA Breached Calls',
      value: dashboardKPIs.slaBreachedCalls || 0,
      description: 'Requires immediate attention',
      onClick: () => {}
    },
  ];

  // Table columns
  const columns = [
    { key: 'callNumber', label: 'Call No.' },
    { key: 'vendor', label: 'Vendor Name', render: (val) => val?.name || '-' },
    { key: 'product', label: 'Product Type' },
    { key: 'stage', label: 'Stage' },
    { key: 'ie', label: 'IE Assigned', render: (val) => val?.name || '-' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (val) => {
        const config = CALL_STATUS_CONFIG[val] || {};
        return (
          <span style={{
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            background: config.bgColor || '#f3f4f6',
            color: config.color || '#1f2937',
            border: `1px solid ${config.borderColor || '#e5e7eb'}`
          }}>
            {config.label || val}
          </span>
        );
      }
    },
    { key: 'scheduledDate', label: 'Scheduled Date', render: (val) => formatDate(val) },
    { key: 'daysPending', label: 'Days Pending' },
  ];

  return (
    <div>
      {/* KPI Tiles Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {kpiTiles.map((tile, index) => (
          <div 
            key={index} 
            className="stat-card" 
            style={{ 
              cursor: tile.onClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease'
            }}
            onClick={tile.onClick}
          >
            <div className="stat-label">{tile.label}</div>
            <div className="stat-value">{tile.value}</div>
            {tile.description && (
              <div style={{ 
                fontSize: 'var(--font-size-xs)', 
                color: 'var(--color-text-secondary)',
                marginTop: 'var(--space-4)'
              }}>
                {tile.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filters Button */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-12)',
        marginBottom: 'var(--space-16)',
        alignItems: 'center'
      }}>
        <button
          className="btn btn-secondary"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={inspectionCalls}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        selectable={false}
      />
    </div>
  );
};

export default CMCallMonitoringTab;

