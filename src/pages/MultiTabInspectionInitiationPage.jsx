import React, { useState } from 'react';
import InspectionInitiationFormContent from '../components/InspectionInitiationFormContent';
import { saveInspectionInitiation } from '../services/vendorInspectionService';
import '../styles/inspectionInitiationPage.css';

// Reason options for withheld/cancel call
const CALL_ACTION_REASONS = [
  { value: '', label: 'Select Reason *' },
  { value: 'MATERIAL_NOT_AVAILABLE', label: 'Full quantity of material not available with firm at the time of inspection' },
  { value: 'PLACE_NOT_AS_PER_PO', label: 'Place of inspection is not as per the PO' },
  { value: 'VENDOR_WITHDRAWN', label: 'Vendor has withdrawn the inspection call' },
  { value: 'ANY_OTHER', label: 'Any other' },
];

// Responsive styles for mobile tabs
const responsiveStyles = `
  @media (max-width: 768px) {
    .multi-inspection-header h1 {
      font-size: 18px !important;
    }
    .multi-inspection-tabs {
      gap: 4px !important;
    }
    .multi-inspection-tabs > div {
      padding: 10px 12px !important;
      font-size: 13px !important;
    }
  }
`;

// Helper to get date options for Shift C (today and yesterday)
const getDateOptions = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return [
    { value: today.toISOString().split('T')[0], label: `Today (${today.toLocaleDateString('en-GB')})` },
    { value: yesterday.toISOString().split('T')[0], label: `Yesterday (${yesterday.toLocaleDateString('en-GB')})` },
  ];
};

const MultiTabInspectionInitiationPage = ({ calls, onProceed, onBack }) => {
  const [activeCallIndex, setActiveCallIndex] = useState(0);
  const [formDataByCall, setFormDataByCall] = useState(() => {
    const initialData = {};
    const today = new Date().toISOString().split('T')[0];
    calls.forEach(call => {
      initialData[call.id] = {
        shiftOfInspection: '',
        offeredQty: call.call_qty,
        cmApproval: false,
        dateOfInspection: today,
        multipleLinesActive: false,
        productionLines: [{ lineNumber: 1, icNumber: '', poNumber: '', rawMaterialICs: [], productType: '' }],
        sectionAVerified: false,
        sectionAStatus: '',
        sectionBVerified: false,
        sectionBStatus: '',
        sectionCVerified: false,
        sectionCStatus: '',
        sectionDVerified: false,
      };
    });
    return initialData;
  });

  // Modal states
  const [showCallActionModal, setShowCallActionModal] = useState(false);
  const [callActionType, setCallActionType] = useState('');
  const [callActionReason, setCallActionReason] = useState('');
  const [callActionRemarks, setCallActionRemarks] = useState('');
  const [callActionError, setCallActionError] = useState('');
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [initiateShift, setInitiateShift] = useState('');
  const [initiateDate, setInitiateDate] = useState(new Date().toISOString().split('T')[0]);
  const [initiateError, setInitiateError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentCall = calls[activeCallIndex];
  const currentFormData = formDataByCall[currentCall.id];

  const updateFormData = (callId, updates) => {
    setFormDataByCall(prev => ({
      ...prev,
      [callId]: { ...prev[callId], ...updates }
    }));
  };

  const handleTabChange = (index) => {
    setActiveCallIndex(index);
  };

  // Open call action modal (withheld/cancel)
  const handleOpenCallActionModal = (actionType) => {
    setCallActionType(actionType);
    setCallActionReason('');
    setCallActionRemarks('');
    setCallActionError('');
    setShowCallActionModal(true);
  };

  // Close call action modal
  const handleCloseCallActionModal = () => {
    setShowCallActionModal(false);
    setCallActionType('');
    setCallActionReason('');
    setCallActionRemarks('');
    setCallActionError('');
  };

  // Submit call action for current call
  const handleSubmitCallAction = async () => {
    if (!callActionReason) {
      setCallActionError('Please select a reason');
      return;
    }
    if (callActionReason === 'ANY_OTHER' && !callActionRemarks.trim()) {
      setCallActionError('Please provide remarks for "Any other" reason');
      return;
    }

    setIsSaving(true);
    try {
      const actionData = {
        inspectionRequestId: currentCall.api_id || null,
        callNo: currentCall.call_no,
        poNo: currentCall.po_no,
        actionType: callActionType,
        reason: callActionReason,
        remarks: callActionRemarks.trim(),
        status: callActionType,
        actionDate: new Date().toISOString()
      };
      await saveInspectionInitiation(actionData);
      alert(`Call ${currentCall.call_no} ${callActionType === 'WITHHELD' ? 'withheld' : 'cancelled'} successfully`);
      handleCloseCallActionModal();
      onBack();
    } catch (error) {
      console.error('Error saving call action:', error);
      setCallActionError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Open initiate inspection modal
  const handleOpenInitiateModal = () => {
    // Validate all forms before opening modal
    const invalidCalls = calls.filter(call => {
      const data = formDataByCall[call.id];
      const isSectionCRequired = call.product_type === 'Raw Material' || call.product_type?.includes('Process');
      return !data.sectionAVerified || !data.sectionBVerified || (isSectionCRequired && !data.sectionCVerified);
    });

    if (invalidCalls.length > 0) {
      alert(`Please verify all sections for: ${invalidCalls.map(c => c.call_no).join(', ')}`);
      return;
    }

    setInitiateShift('');
    setInitiateDate(new Date().toISOString().split('T')[0]);
    setInitiateError('');
    setShowInitiateModal(true);
  };

  // Close initiate modal
  const handleCloseInitiateModal = () => {
    setShowInitiateModal(false);
    setInitiateShift('');
    setInitiateError('');
  };

  // Submit initiation for all calls
  const handleSubmitInitiation = async () => {
    if (!initiateShift) {
      setInitiateError('Please select a shift');
      return;
    }

    setIsSaving(true);
    try {
      // Save initiation for all calls
      const savedCalls = [];
      for (const call of calls) {
        const initiationData = {
          inspectionRequestId: call.api_id || null,
          callNo: call.call_no,
          poNo: call.po_no,
          shiftOfInspection: initiateShift,
          dateOfInspection: initiateDate,
          status: 'INITIATED',
          initiatedDate: new Date().toISOString()
        };
        console.log('Saving initiation for call:', call.call_no, initiationData);
        const result = await saveInspectionInitiation(initiationData);
        console.log('Saved successfully:', call.call_no, result);
        savedCalls.push(call.call_no);
      }

      alert(`Successfully initiated ${savedCalls.length} inspection(s): ${savedCalls.join(', ')}`);
      handleCloseInitiateModal();
      onProceed(calls[0].product_type, initiateShift, initiateDate);
    } catch (error) {
      console.error('Error saving inspection initiation:', error);
      setInitiateError(`Failed to save: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Inject responsive styles */}
      <style>{responsiveStyles}</style>

      <div className="breadcrumb">
        <div className="breadcrumb-item" onClick={onBack} style={{ cursor: 'pointer' }}>Landing Page</div>
        <span className="breadcrumb-separator">/</span>
        <div className="breadcrumb-item breadcrumb-active">Inspection Initiation (Multiple Calls)</div>
      </div>

      <div className="multi-inspection-header" style={{ marginBottom: 'var(--space-24)' }}>
        <h1>Inspection Initiation - Multiple Calls</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-8)' }}>
          Fill out inspection details for {calls.length} inspection calls. Switch between tabs to enter data for each call.
        </p>
      </div>

      {/* Call Tabs */}
      <div className="multi-inspection-tabs" style={{
        display: 'flex',
        gap: 'var(--space-8)',
        marginBottom: 'var(--space-24)',
        borderBottom: '2px solid var(--color-border)',
        overflowX: 'auto',
        flexWrap: 'wrap',
        WebkitOverflowScrolling: 'touch'
      }}>
        {calls.map((call, index) => {
          const isValid = formDataByCall[call.id].shiftOfInspection &&
            (formDataByCall[call.id].offeredQty === call.call_qty ||
             (formDataByCall[call.id].offeredQty > call.call_qty && formDataByCall[call.id].cmApproval));

          return (
            <div
              key={call.id}
              onClick={() => handleTabChange(index)}
              style={{
                padding: 'var(--space-12) var(--space-16)',
                cursor: 'pointer',
                borderBottom: activeCallIndex === index ? '3px solid var(--color-primary)' : '3px solid transparent',
                fontWeight: activeCallIndex === index ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                color: activeCallIndex === index ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-8)',
                whiteSpace: 'nowrap',
                minHeight: '44px'
              }}
            >
              <span>{call.call_no}</span>
              {isValid && <span style={{ color: 'var(--color-success)' }}>✓</span>}
            </div>
          );
        })}
      </div>

      {/* Render the form for the active call */}
      <InspectionInitiationFormContent
        call={currentCall}
        formData={currentFormData}
        onFormDataChange={(updates) => updateFormData(currentCall.id, updates)}
      />

      <div className="inspection-action-buttons" style={{ marginTop: 'var(--space-24)' }}>
        <button className="btn btn-secondary inspection-action-buttons__btn" onClick={onBack} disabled={isSaving}>
          Back to Landing Page
        </button>
        <div className="inspection-action-buttons__group">
          {activeCallIndex > 0 && (
            <button className="btn btn-outline inspection-action-buttons__btn" onClick={() => setActiveCallIndex(activeCallIndex - 1)} disabled={isSaving}>
              ← Previous Call
            </button>
          )}
          {activeCallIndex < calls.length - 1 && (
            <button className="btn btn-outline inspection-action-buttons__btn" onClick={() => setActiveCallIndex(activeCallIndex + 1)} disabled={isSaving}>
              Next Call →
            </button>
          )}
          <button
            type="button"
            className="btn btn-warning inspection-action-buttons__btn"
            onClick={() => handleOpenCallActionModal('WITHHELD')}
            disabled={isSaving}
          >
            Withheld Call
          </button>
          <button
            type="button"
            className="btn btn-danger inspection-action-buttons__btn"
            onClick={() => handleOpenCallActionModal('CANCELLED')}
            disabled={isSaving}
          >
            Cancel Call
          </button>
          {activeCallIndex === calls.length - 1 && (
            <button
              className="btn btn-success inspection-action-buttons__btn"
              onClick={handleOpenInitiateModal}
              disabled={isSaving}
            >
              Initiate All Inspections
            </button>
          )}
        </div>
      </div>

      {/* Call Action Modal (Withheld/Cancel) */}
      {showCallActionModal && (
        <div className="modal-overlay" onClick={handleCloseCallActionModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {callActionType === 'WITHHELD' ? 'Withheld Call' : 'Cancel Call'} - {currentCall.call_no}
              </h3>
              <button className="modal-close" onClick={handleCloseCallActionModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Reason <span className="required">*</span></label>
                <select
                  className="modal-select"
                  value={callActionReason}
                  onChange={(e) => { setCallActionReason(e.target.value); setCallActionError(''); }}
                >
                  {CALL_ACTION_REASONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {callActionReason === 'ANY_OTHER' && (
                <div className="modal-field">
                  <label className="modal-label">Remarks <span className="required">*</span></label>
                  <textarea
                    className="modal-textarea"
                    placeholder="Please provide details..."
                    value={callActionRemarks}
                    onChange={(e) => { setCallActionRemarks(e.target.value); setCallActionError(''); }}
                  />
                </div>
              )}

              {callActionError && <div className="modal-error">{callActionError}</div>}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary modal-actions__btn" onClick={handleCloseCallActionModal} disabled={isSaving}>
                Cancel
              </button>
              <button type="button" className={`${callActionType === 'WITHHELD' ? 'btn btn-warning' : 'btn btn-danger'} modal-actions__btn`} onClick={handleSubmitCallAction} disabled={isSaving}>
                {isSaving ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initiate All Inspections Modal */}
      {showInitiateModal && (
        <div className="modal-overlay" onClick={handleCloseInitiateModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Initiate All Inspections ({calls.length} Calls)</h3>
              <button className="modal-close" onClick={handleCloseInitiateModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Calls to Initiate</label>
                <div style={{ padding: 'var(--space-8)', background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-sm)' }}>
                  {calls.map(call => (
                    <div key={call.id} style={{ padding: 'var(--space-4) 0' }}>
                      <strong>{call.call_no}</strong> - {call.po_no}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Shift of Inspection <span className="required">*</span></label>
                <select
                  className="modal-select"
                  value={initiateShift}
                  onChange={(e) => {
                    setInitiateShift(e.target.value);
                    setInitiateError('');
                    if (e.target.value && e.target.value !== 'C') {
                      setInitiateDate(new Date().toISOString().split('T')[0]);
                    }
                  }}
                >
                  <option value="">Select Shift</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="modal-field">
                <label className="modal-label">Date of Inspection <span className="required">*</span></label>
                {initiateShift === 'C' ? (
                  <select
                    className="modal-select"
                    value={initiateDate}
                    onChange={(e) => { setInitiateDate(e.target.value); setInitiateError(''); }}
                  >
                    {getDateOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="modal-input"
                    value={initiateDate ? new Date(initiateDate).toLocaleDateString('en-GB') : ''}
                    disabled
                  />
                )}
                <span className="modal-hint">
                  {initiateShift === 'C' ? 'Shift C: Select today or yesterday' : 'Auto-set to today for shifts A, B, General'}
                </span>
              </div>

              {initiateError && <div className="modal-error">{initiateError}</div>}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary modal-actions__btn" onClick={handleCloseInitiateModal} disabled={isSaving}>
                Cancel
              </button>
              <button type="button" className="btn btn-success modal-actions__btn" onClick={handleSubmitInitiation} disabled={isSaving}>
                {isSaving ? 'Initiating...' : 'Confirm & Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiTabInspectionInitiationPage;
