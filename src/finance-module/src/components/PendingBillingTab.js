/**
 * Pending Billing Tab Component
 * Section 2: Inspection Calls Pending Billing
 */

import React, { useState } from 'react';
import DataTable from '../../../components/DataTable';
import { formatDateTime, formatCurrency, getBillStatusBadge, getSLAStatus } from '../utils/helpers';
import { BILL_STATUS } from '../utils/constants';

const PendingBillingTab = ({ billingRecords = [], kpis = {}, onGenerateBill }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showGenerateBillModal, setShowGenerateBillModal] = useState(false);
  const [billAmount, setBillAmount] = useState('');

  // KPI Tiles
  const kpiTiles = [
    {
      label: 'Total Pending Billing',
      value: kpis.count || 0,
      icon: '📄',
      color: '#f59e0b'
    },
    {
      label: 'Total Amount',
      value: formatCurrency(kpis.amount || 0),
      icon: '💰',
      color: '#3b82f6'
    },
    {
      label: 'Under Suspense',
      value: kpis.underSuspense || 0,
      icon: '⚠️',
      color: '#dc2626'
    }
  ];

  // Table columns
  const columns = [
    {
      key: 'callNumber',
      label: 'Call Number',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
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
      key: 'productType',
      label: 'Product Type',
      sortable: true
    },
    {
      key: 'icNumber',
      label: 'IC Number',
      sortable: true
    },
    {
      key: 'icIssuedDate',
      label: 'IC Issued Date',
      sortable: true,
      render: (value) => formatDateTime(value)
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      render: (value) => formatCurrency(value)
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
    },
    {
      key: 'sla',
      label: 'SLA Status',
      render: (_, row) => {
        if (row.billStatus === BILL_STATUS.UNDER_SUSPENSE) {
          return <span style={{ color: '#dc2626', fontWeight: '500' }}>Suspended</span>;
        }
        const slaStatus = getSLAStatus(row.icIssuedDate, 'BILL_GENERATION');
        return (
          <span style={{ color: slaStatus.color, fontWeight: '500' }}>
            {slaStatus.status}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          {row.billStatus === BILL_STATUS.BILLING_PENDING && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleGenerateBillClick(row)}
              title="Generate Bill"
            >
              📄 Generate Bill
            </button>
          )}
          {row.billStatus === BILL_STATUS.UNDER_SUSPENSE && (
            <button
              className="btn btn-sm btn-warning"
              onClick={() => alert(`Suspense Reason: ${row.suspenseReason}`)}
              title="View Suspense Reason"
            >
              ⚠️ View Reason
            </button>
          )}
        </div>
      )
    }
  ];

  const handleGenerateBillClick = (record) => {
    setSelectedRecord(record);
    setBillAmount(record.totalAmount?.toString() || '');
    setShowGenerateBillModal(true);
  };

  const handleGenerateBillSubmit = () => {
    if (selectedRecord && billAmount && parseFloat(billAmount) > 0) {
      onGenerateBill(selectedRecord, {
        billAmount: parseFloat(billAmount)
      });
      setShowGenerateBillModal(false);
      setSelectedRecord(null);
      setBillAmount('');
    } else {
      alert('Please enter a valid bill amount');
    }
  };

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
        <span>
          <strong>Under Suspense:</strong> Inspection calls where IC is issued but billing is on hold due to pending payments or other issues.
        </span>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={billingRecords}
        emptyMessage="No pending billing records found"
      />

      {/* Generate Bill Modal */}
      {showGenerateBillModal && (
        <div className="modal-overlay" onClick={() => setShowGenerateBillModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Generate Bill</h3>
              <button className="modal-close" onClick={() => setShowGenerateBillModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Call Number:</strong> {selectedRecord?.callNumber}</p>
              <p><strong>IC Number:</strong> {selectedRecord?.icNumber}</p>
              <p><strong>Vendor:</strong> {selectedRecord?.vendor?.name}</p>
              <p><strong>PO Number:</strong> {selectedRecord?.poNumber}</p>
              
              <div className="details-grid" style={{ marginTop: '16px', marginBottom: '16px' }}>
                <div>
                  <strong>Inspection Amount:</strong>
                  <p>{formatCurrency(selectedRecord?.inspectionAmount)}</p>
                </div>
                <div>
                  <strong>Testing Amount:</strong>
                  <p>{formatCurrency(selectedRecord?.testingAmount)}</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Bill Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="Enter bill amount"
                  min="0"
                  step="0.01"
                  required
                />
                <small className="form-text">GST (18%) will be calculated automatically</small>
              </div>

              {billAmount && parseFloat(billAmount) > 0 && (
                <div className="alert alert-info" style={{ marginTop: '12px' }}>
                  <p><strong>Bill Amount:</strong> {formatCurrency(parseFloat(billAmount))}</p>
                  <p><strong>GST (18%):</strong> {formatCurrency(parseFloat(billAmount) * 0.18)}</p>
                  <p><strong>Total Amount:</strong> {formatCurrency(parseFloat(billAmount) * 1.18)}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowGenerateBillModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleGenerateBillSubmit}>Generate Bill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingBillingTab;

