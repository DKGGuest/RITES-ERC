import React, { useState } from 'react';
import { MOCK_INSPECTION_CALLS } from '../data/mockData';
import Tabs from '../components/Tabs';
import PendingCallsTab from '../components/PendingCallsTab';
import CompletedCallsTab from '../components/CompletedCallsTab';
import IssuanceOfICTab from '../components/IssuanceOfICTab';
import BillingStageTab from '../components/BillingStageTab';
import PerformanceDashboard from '../components/PerformanceDashboard';
import Modal from '../components/Modal';
import Notification from '../components/Notification';
import { scheduleInspection, rescheduleInspection, getScheduleByCallNo, validateScheduleLimit, MAX_CALLS_PER_DAY } from '../services/scheduleService';
import { raiseBill, updateBillingStatus, approvePayment, BILLING_STATUS } from '../services/billingService';
import { getStoredUser } from '../services/authService';

const IELandingPage = ({ onStartInspection, onStartMultipleInspections, setSelectedCall, setCurrentPage, initialTab = 'pending' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCallLocal, setSelectedCallLocal] = useState(null);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isBulkSchedule, setIsBulkSchedule] = useState(false);
  const [isReschedule, setIsReschedule] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshCallback, setRefreshCallback] = useState(null);
  const [previousSchedule, setPreviousSchedule] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: 'error' });

  const pendingCount = MOCK_INSPECTION_CALLS.filter(call => call.status === 'Pending').length;
  const completedCount = MOCK_INSPECTION_CALLS.filter(call => call.status === 'Completed').length;
  const billingCount = MOCK_INSPECTION_CALLS.filter(call =>
    call.ic_issued === true &&
    call.billing_status &&
    call.billing_status !== BILLING_STATUS.PAYMENT_DONE
  ).length;

  const tabs = [
    { id: 'pending', label: 'List of Calls Pending', description: `${pendingCount} pending` },
    { id: 'certificates', label: 'Issuance of IC', description: `${completedCount} ready for IC` },
    { id: 'billing', label: 'Billing Stage', description: `${billingCount} in billing` },
    { id: 'completed', label: 'Calls Completed', description: `${completedCount} completed` },
    { id: 'performance', label: 'Performance', description: 'KPI overview' },
  ];

  // Handle schedule button click (first time scheduling)
  const handleSchedule = (call, refreshFn) => {
    setSelectedCallLocal(call);
    setSelectedCalls([call]);
    setIsBulkSchedule(false);
    setIsReschedule(false);
    setPreviousSchedule(null);
    setScheduleDate('');
    setRemarks('');
    setRefreshCallback(() => refreshFn);
    setShowScheduleModal(true);
  };

  // Handle reschedule button click - fetch existing schedule data
  const handleReschedule = async (call, refreshFn) => {
    setSelectedCallLocal(call);
    setSelectedCalls([call]);
    setIsBulkSchedule(false);
    setIsReschedule(true);
    setRefreshCallback(() => refreshFn);
    setPreviousSchedule(null);

    // Fetch existing schedule data to prefill the form
    try {
      const existingSchedule = await getScheduleByCallNo(call.call_no);
      if (existingSchedule) {
        // Store previous schedule for display
        setPreviousSchedule(existingSchedule);
        // Prefill schedule date
        if (existingSchedule.scheduleDate) {
          setScheduleDate(existingSchedule.scheduleDate);
        }
        // Prefill reason/remarks
        if (existingSchedule.reason) {
          setRemarks(existingSchedule.reason);
        }
      }
    } catch (error) {
      console.error('Error fetching existing schedule:', error);
    }

    setShowScheduleModal(true);
  };

  const handleBulkSchedule = (calls) => {
    setSelectedCalls(calls);
    setIsBulkSchedule(true);
    setIsReschedule(false);
    setPreviousSchedule(null);
    setScheduleDate('');
    setRemarks('');
    setShowScheduleModal(true);
  };

  // Helper to show notification
  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
  };

  // Submit schedule/reschedule to backend API
  const handleScheduleSubmit = async () => {
    if (!scheduleDate) {
      showNotification('Please select a schedule date', 'warning');
      return;
    }

    setIsSubmitting(true);
    const currentUser = getStoredUser();
    const userName = currentUser?.userName || 'System';

    try {
      // Validate scheduled date is before or on desired inspection date
      const callsToValidate = isBulkSchedule ? selectedCalls : [selectedCallLocal];
      for (const call of callsToValidate) {
        if (call?.desired_inspection_date) {
          const scheduledDateObj = new Date(scheduleDate);
          const desiredDateObj = new Date(call.desired_inspection_date);
          if (scheduledDateObj > desiredDateObj) {
            showNotification(`Scheduled date cannot be after the Desired Inspection Date (${call.desired_inspection_date}) for call ${call.call_no}. Please select an earlier date.`, 'error');
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Validate schedule limit (5 calls per day) - only for new schedules, not reschedules
      if (!isReschedule) {
        const callsToSchedule = isBulkSchedule ? selectedCalls.length : 1;
        const validation = await validateScheduleLimit(scheduleDate, callsToSchedule);

        if (!validation.canSchedule) {
          showNotification(`Cannot schedule ${callsToSchedule} call(s) for this date. Maximum ${MAX_CALLS_PER_DAY} calls allowed per day. Currently ${validation.currentCount} call(s) scheduled, ${validation.remaining} slot(s) remaining.`, 'error');
          setIsSubmitting(false);
          return;
        }
      }

      if (isBulkSchedule) {
        // Bulk scheduling
        for (const call of selectedCalls) {
          const scheduleData = {
            callNo: call.call_no,
            scheduleDate: scheduleDate,
            reason: remarks,
            createdBy: userName
          };
          await scheduleInspection(scheduleData);
        }
      } else {
        // Single call scheduling
        const scheduleData = {
          callNo: selectedCallLocal?.call_no,
          scheduleDate: scheduleDate,
          reason: remarks,
          createdBy: userName,
          updatedBy: userName
        };

        if (isReschedule) {
          await rescheduleInspection(scheduleData);
        } else {
          await scheduleInspection(scheduleData);
        }
      }

      // Show success notification
      showNotification('Inspection scheduled successfully!', 'success');

      // Refresh the schedule list
      if (refreshCallback) {
        refreshCallback();
      }

      // Reset modal state
      setShowScheduleModal(false);
      setScheduleDate('');
      setRemarks('');
      setSelectedCallLocal(null);
      setSelectedCalls([]);
      setIsBulkSchedule(false);
      setIsReschedule(false);
    } catch (error) {
      showNotification(error.message || 'Failed to schedule inspection', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStart = (call) => {
    onStartInspection(call);
  };

  const handleBulkStart = (calls) => {
    onStartMultipleInspections(calls);
  };

  // Billing Stage Handlers
  const handleRaiseBill = async (call) => {
    // TODO: Open modal to collect bill details
    const billNo = `BILL-${Date.now()}`;
    const billDate = new Date().toISOString().split('T')[0];
    const billAmount = call.call_qty * call.rate;

    try {
      await raiseBill({
        callNo: call.call_no,
        billNo,
        billDate,
        billAmount,
        createdBy: getStoredUser()?.userName || 'System'
      });
      showNotification('Bill raised successfully!', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to raise bill', 'error');
    }
  };

  const handleUpdateBillingStatus = async (call, newStatus) => {
    try {
      await updateBillingStatus({
        callNo: call.call_no,
        billing_status: newStatus,
        updatedBy: getStoredUser()?.userName || 'System'
      });
      showNotification(`Status updated to "${newStatus}"`, 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to update status', 'error');
    }
  };

  const handleApprovePayment = async (call) => {
    try {
      await approvePayment({
        callNo: call.call_no,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentRef: `PAY-${Date.now()}`,
        approvedBy: getStoredUser()?.userName || 'System'
      });
      showNotification('Payment approved! Call moved to Completed.', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to approve payment', 'error');
    }
  };

  return (
    <div>
      {/* In-app Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        autoClose={true}
        autoCloseDelay={5000}
        onClose={() => setNotification({ message: '', type: 'error' })}
      />

      <div className="breadcrumb">
        <div className="breadcrumb-item breadcrumb-active">Landing Page</div>
      </div>

      <h1 style={{ marginBottom: 'var(--space-24)' }}>IE Landing Page</h1>
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {/* 1. List of Calls Pending - First */}
      {activeTab === 'pending' && (
        <PendingCallsTab
          calls={MOCK_INSPECTION_CALLS}
          onSchedule={handleSchedule}
          onReschedule={handleReschedule}
          onStart={handleStart}
          onBulkSchedule={handleBulkSchedule}
          onBulkStart={handleBulkStart}
        />
      )}

      {/* 2. Issuance of IC - Second */}
      {activeTab === 'certificates' && (
        <IssuanceOfICTab
          calls={MOCK_INSPECTION_CALLS}
          setSelectedCall={setSelectedCall}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* 3. Billing Stage - Third */}
      {activeTab === 'billing' && (
        <BillingStageTab
          calls={MOCK_INSPECTION_CALLS}
          onRaiseBill={handleRaiseBill}
          onUpdateStatus={handleUpdateBillingStatus}
          onApprovePayment={handleApprovePayment}
        />
      )}

      {/* 4. Calls Completed - Fourth */}
      {activeTab === 'completed' && (
        <CompletedCallsTab calls={MOCK_INSPECTION_CALLS} />
      )}

      {/* 5. Performance - Fifth (Last) */}
      {activeTab === 'performance' && (
        <PerformanceDashboard />
      )}

      <Modal
        isOpen={showScheduleModal}
        onClose={() => !isSubmitting && setShowScheduleModal(false)}
        title={isBulkSchedule
          ? `Schedule ${selectedCalls.length} Inspection Calls`
          : isReschedule
            ? "Reschedule Inspection"
            : "Schedule Inspection"}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setShowScheduleModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleScheduleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Confirm'}
            </button>
          </>
        }
      >
        {isBulkSchedule && (
          <div style={{ marginBottom: 'var(--space-16)', padding: 'var(--space-12)', background: 'var(--color-bg-1)', borderRadius: 'var(--radius-base)' }}>
            <strong>Selected Calls:</strong> {selectedCalls.map(c => c.call_no).join(', ')}
          </div>
        )}
        {!isBulkSchedule && (
          <div style={{ marginBottom: 'var(--space-16)', padding: 'var(--space-12)', background: 'var(--color-bg-1)', borderRadius: 'var(--radius-base)' }}>
            <strong>Call Number:</strong> {selectedCallLocal?.call_no}
          </div>
        )}

        {/* Show previous schedule info when rescheduling */}
        {isReschedule && previousSchedule && (
          <div style={{
            marginBottom: 'var(--space-16)',
            padding: 'var(--space-12)',
            background: '#fff8e1',
            borderRadius: 'var(--radius-base)',
            border: '1px solid #ffcc02'
          }}>
            <div style={{ fontWeight: '600', marginBottom: 'var(--space-8)', color: '#b8860b' }}>
              Previous Schedule Details
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-24)', flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Scheduled Date:
                </span>
                <div style={{ fontWeight: '500' }}>
                  {previousSchedule.scheduleDate
                    ? new Date(previousSchedule.scheduleDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : '-'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Previous Remark:
                </span>
                <div style={{ fontWeight: '500' }}>
                  {previousSchedule.reason || '-'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label required">{isReschedule ? 'New Schedule Date' : 'Schedule Date'}</label>
          <input
            type="date"
            className="form-control"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            disabled={isSubmitting}
          />
          <small style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {isReschedule ? 'Select new date for inspection' : 'Select the date for inspection'}
          </small>
        </div>
        <div className="form-group">
          <label className="form-label">{isReschedule ? 'Reason for Reschedule' : 'Remarks'}</label>
          <textarea
            className="form-control"
            rows="3"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={isReschedule ? "Enter reason for rescheduling..." : "Enter remarks for scheduling..."}
            disabled={isSubmitting}
          />
        </div>
      </Modal>
    </div>
  );
};

export default IELandingPage;
