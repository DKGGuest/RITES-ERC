/**
 * CMApprovalsTab Component
 * Approvals queue for CM with action buttons
 */

import React, { useState } from 'react';
import useCMData from '../../../hooks/cm/useCMData';
import useApprovals from '../../../hooks/cm/useApprovals';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import { formatDate } from '../../../utils/helpers';
import { APPROVAL_TYPES } from '../../../utils/cm/constants';

const CMApprovalsTab = () => {
  const { approvals, loading } = useCMData();
  const { approveRequest, rejectRequest, forwardRequest } = useApprovals();
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [remarks, setRemarks] = useState('');

  const safeApprovals = approvals || [];

  const handleAction = (approval, action) => {
    setSelectedApproval(approval);
    setActionType(action);
    setShowModal(true);
    setRemarks('');
  };

  const handleSubmitAction = async () => {
    if (!selectedApproval) return;

    try {
      if (actionType === 'approve') {
        await approveRequest(selectedApproval.id, remarks);
      } else if (actionType === 'reject') {
        await rejectRequest(selectedApproval.id, remarks);
      } else if (actionType === 'forward') {
        await forwardRequest(selectedApproval.id, remarks);
      }
      setShowModal(false);
      setSelectedApproval(null);
      setRemarks('');
    } catch (error) {
      console.error('Error processing approval:', error);
    }
  };

  const columns = [
    { key: 'callNumber', label: 'Call Number' },
    { 
      key: 'type', 
      label: 'Trigger Type',
      render: (val) => APPROVAL_TYPES[val]?.label || val
    },
    { key: 'ie', label: 'IE Name', render: (val) => val?.name || '-' },
    { key: 'vendor', label: 'Vendor', render: (val) => val?.name || '-' },
    { key: 'product', label: 'Product & Stage' },
    { key: 'requestedDate', label: 'Requested Date', render: (val) => formatDate(val) },
  ];

  const actions = (row) => (
    <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
      <button className="btn btn-sm btn-secondary" onClick={() => handleAction(row, 'view')}>
        View
      </button>
      <button className="btn btn-sm btn-primary" onClick={() => handleAction(row, 'approve')}>
        Approve
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => handleAction(row, 'reject')}>
        Reject
      </button>
      <button className="btn btn-sm btn-secondary" onClick={() => handleAction(row, 'forward')}>
        Forward
      </button>
    </div>
  );

  if (loading) {
    return <div>Loading approvals...</div>;
  }

  return (
    <div>
      <DataTable
        columns={columns}
        data={safeApprovals}
        actions={actions}
        selectable={false}
      />

      <Modal
        isOpen={showModal}
        title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Approval`}
        onClose={() => setShowModal(false)}
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-12)', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmitAction}>
              Submit
            </button>
          </div>
        }
      >
        <p><strong>Call Number:</strong> {selectedApproval?.callNumber}</p>
        <p><strong>Type:</strong> {APPROVAL_TYPES[selectedApproval?.type]?.label}</p>

        <div style={{ marginTop: 'var(--space-16)' }}>
          <label className="form-label">Remarks</label>
          <textarea
            className="form-input"
            rows="4"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default CMApprovalsTab;

