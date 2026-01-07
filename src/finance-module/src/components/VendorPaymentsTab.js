/**
 * Vendor Payments Tab Component
 * Section 1: Vendor Payments - Pending Finance Approval
 */

import React, { useState } from 'react';
import DataTable from '../../../components/DataTable';
import { formatDateTime, formatCurrency, getPaymentStatusBadge, getSLAStatus } from '../utils/helpers';
import { PAYMENT_STATUS } from '../utils/constants';

const VendorPaymentsTab = ({ payments = [], kpis = {}, onApprove, onReturn }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [returnReason, setReturnReason] = useState('');

  // KPI Tiles
  const kpiTiles = [
    {
      label: 'Total Pending Approval',
      value: kpis.count || 0,
      icon: '⏳',
      color: '#f59e0b'
    },
    {
      label: 'Total Amount',
      value: formatCurrency(kpis.amount || 0),
      icon: '💰',
      color: '#3b82f6'
    },
    {
      label: 'SLA Breached',
      value: kpis.slaBreached || 0,
      icon: '⚠️',
      color: '#ef4444'
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
      key: 'paymentType',
      label: 'Payment Type',
      sortable: true,
      render: (value) => value?.replace(/_/g, ' ').toUpperCase() || '-'
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => formatCurrency(value)
    },
    {
      key: 'submissionDate',
      label: 'Submission Date',
      sortable: true,
      render: (value) => formatDateTime(value)
    },
    {
      key: 'paymentStatus',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const badge = getPaymentStatusBadge(value);
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
        const slaStatus = getSLAStatus(row.submissionDate, 'PAYMENT_APPROVAL');
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
          {row.paymentStatus === PAYMENT_STATUS.PENDING_FINANCE_APPROVAL && (
            <>
              <button
                className="btn btn-sm btn-success"
                onClick={() => handleApproveClick(row)}
                title="Approve Payment"
              >
                ✅ Approve
              </button>
              <button
                className="btn btn-sm btn-warning"
                onClick={() => handleReturnClick(row)}
                title="Return Payment"
              >
                ↩️ Return
              </button>
            </>
          )}
          {row.paymentStatus === PAYMENT_STATUS.RETURNED && (
            <span className="status-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              Awaiting Resubmission
            </span>
          )}
          {row.paymentStatus === PAYMENT_STATUS.RESUBMITTED && (
            <>
              <button
                className="btn btn-sm btn-success"
                onClick={() => handleApproveClick(row)}
                title="Approve Payment"
              >
                ✅ Approve
              </button>
              <button
                className="btn btn-sm btn-warning"
                onClick={() => handleReturnClick(row)}
                title="Return Payment"
              >
                ↩️ Return
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  const handleApproveClick = (payment) => {
    setSelectedPayment(payment);
    setRemarks('');
    setShowApproveModal(true);
  };

  const handleReturnClick = (payment) => {
    setSelectedPayment(payment);
    setReturnReason('');
    setShowReturnModal(true);
  };

  const handleApproveSubmit = () => {
    if (selectedPayment) {
      onApprove(selectedPayment, remarks);
      setShowApproveModal(false);
      setSelectedPayment(null);
      setRemarks('');
    }
  };

  const handleReturnSubmit = () => {
    if (selectedPayment && returnReason.trim()) {
      onReturn(selectedPayment, returnReason);
      setShowReturnModal(false);
      setSelectedPayment(null);
      setReturnReason('');
    } else {
      alert('Return reason is mandatory');
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={payments}
        emptyMessage="No pending payments found"
      />

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Approve Payment</h3>
              <button className="modal-close" onClick={() => setShowApproveModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Call Number:</strong> {selectedPayment?.callNumber}</p>
              <p><strong>Vendor:</strong> {selectedPayment?.vendor?.name}</p>
              <p><strong>Amount:</strong> {formatCurrency(selectedPayment?.amount)}</p>
              <div className="form-group">
                <label className="form-label">Remarks (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter any remarks..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowApproveModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleApproveSubmit}>Approve Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Return Payment</h3>
              <button className="modal-close" onClick={() => setShowReturnModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Call Number:</strong> {selectedPayment?.callNumber}</p>
              <p><strong>Vendor:</strong> {selectedPayment?.vendor?.name}</p>
              <p><strong>Amount:</strong> {formatCurrency(selectedPayment?.amount)}</p>
              <div className="form-group">
                <label className="form-label required">Return Reason</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Enter reason for returning payment (mandatory)..."
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
              <button className="btn btn-warning" onClick={handleReturnSubmit}>Return Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPaymentsTab;

