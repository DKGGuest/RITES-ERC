/**
 * Bills Cleared Tab Component
 * Section 4: Bills Cleared (Read-only)
 */

import React from 'react';
import DataTable from '../../../components/DataTable';
import { formatDateTime, formatCurrency, getBillStatusBadge } from '../utils/helpers';

const BillsClearedTab = ({ bills = [], kpis = {} }) => {
  // KPI Tiles
  const kpiTiles = [
    {
      label: 'Total Bills Cleared',
      value: kpis.count || 0,
      icon: '✅',
      color: '#22c55e'
    },
    {
      label: 'Total Amount',
      value: formatCurrency(kpis.amount || 0),
      icon: '💰',
      color: '#3b82f6'
    },
    {
      label: 'This Month',
      value: kpis.thisMonth || 0,
      icon: '📅',
      color: '#8b5cf6'
    }
  ];

  // Table columns
  const columns = [
    {
      key: 'billNumber',
      label: 'Bill Number',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'callNumber',
      label: 'Call Number',
      sortable: true
    },
    {
      key: 'vendor',
      label: 'Vendor Name',
      sortable: true,
      render: (value) => value?.name || '-'
    },
    {
      key: 'poNumber',
      label: 'PO Number',
      sortable: true
    },
    {
      key: 'billDate',
      label: 'Bill Date',
      sortable: true,
      render: (value) => formatDateTime(value)
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      sortable: true,
      render: (value) => formatCurrency(value)
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
      sortable: true,
      render: (value) => formatDateTime(value)
    },
    {
      key: 'paymentReference',
      label: 'Payment Reference',
      sortable: true
    },
    {
      key: 'clearedDate',
      label: 'Cleared Date',
      sortable: true,
      render: (value) => formatDateTime(value)
    },
    {
      key: 'billStatus',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const badge = getBillStatusBadge(value);
        return (
          <span
            className="status-badge"
            style={{
              backgroundColor: badge.bgColor,
              color: badge.color,
              border: `1px solid ${badge.borderColor}`
            }}
          >
            {badge.label}
          </span>
        );
      }
    }
  ];

  return (
    <div className="tab-content">
      {/* KPI Tiles */}
      <div className="kpi-grid">
        {kpiTiles.map((kpi, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ color: kpi.color }}>
              {kpi.icon}
            </div>
            <div className="stat-content">
              <div className="stat-label">{kpi.label}</div>
              <div className="stat-value" style={{ color: kpi.color }}>
                {kpi.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Message */}
      <div className="info-message" style={{ marginBottom: '16px' }}>
        <span className="info-icon">ℹ️</span>
        <span>This is a read-only view of cleared bills for reference and audit purposes.</span>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={bills}
        emptyMessage="No cleared bills found"
      />
    </div>
  );
};

export default BillsClearedTab;

