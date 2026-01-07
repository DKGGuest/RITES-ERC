import { useState, useEffect, useCallback, useMemo } from 'react';
import { MOCK_INSPECTION_CALLS, MOCK_PENDING_PROCESS_FINAL_CALLS } from '../data/mockData';
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
import { fetchUserPendingCalls, performTransitionAction, clearWorkflowCache } from '../services/workflowService';
import { markAsScheduled, isCallInitiated, getCallStatusData } from '../services/callStatusService';

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

  // State for unscheduled calls popup when trying to start
  const [showUnscheduledPopup, setShowUnscheduledPopup] = useState(false);
  const [unscheduledCallsInfo, setUnscheduledCallsInfo] = useState({ scheduledCalls: [], unscheduledCalls: [], refreshSchedules: null });
  const [, setAllSelectedForStart] = useState([]);

  // State for API-fetched pending calls from Azure workflow API
  const [pendingCalls, setPendingCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch pending workflow transitions for logged-in user from Azure API
  // PERFORMANCE OPTIMIZATION: Returns data immediately, fetches vendor names in background
  const fetchPendingData = useCallback(async (forceRefresh = false) => {
    const startTime = performance.now();
    setIsLoading(true);

    try {
      console.log('🚀 Starting data fetch from Azure...');

      // Fetch workflow transitions immediately (without waiting for vendor names)
      const apiCalls = await fetchUserPendingCalls(forceRefresh);

      const fetchTime = performance.now() - startTime;
      console.log(`⚡ Data loaded in ${fetchTime.toFixed(0)}ms`);

      setPendingCalls(apiCalls);
      setIsLoading(false);

      // Vendor names are being fetched in background and cached
      // They will be available on next refresh or when needed

    } catch (error) {
      console.error('❌ Error fetching pending calls from Azure API:', error);
      setPendingCalls([]);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Combine Real Raw Material calls from API with Mock Process/Final Product calls
  const combinedPendingCalls = useMemo(() => {
    console.log('🔄 Combining pending calls:');
    console.log('  📦 Raw Material calls from API:', pendingCalls.length);
    console.log('  🏭 Process/Final mock calls:', MOCK_PENDING_PROCESS_FINAL_CALLS.length);

    const combined = [...pendingCalls, ...MOCK_PENDING_PROCESS_FINAL_CALLS];
    console.log('  ✅ Total combined calls:', combined.length);

    return combined;
  }, [pendingCalls]);

  // Azure API data for pending tab; mock data for other tabs (completed, billing, etc.)
  const pendingCount = combinedPendingCalls.length;
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

  // State for already scheduled calls info (to display in modal)
  const [alreadyScheduledCallsInfo, setAlreadyScheduledCallsInfo] = useState([]);

  const handleBulkSchedule = (calls, options = {}) => {
    const { scheduledCallsWithInfo = [], refreshSchedules } = options;
    setSelectedCalls(calls);
    setAlreadyScheduledCallsInfo(scheduledCallsWithInfo);
    setIsBulkSchedule(true);
    setIsReschedule(false);
    setPreviousSchedule(null);
    setScheduleDate('');
    setRemarks('');
    // Store the refresh callback to call after successful scheduling
    setRefreshCallback(() => refreshSchedules);
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
    const userId = currentUser?.userId || 0;

    try {
      // Validate scheduled date is on or after desired inspection date
      const callsToValidate = isBulkSchedule ? selectedCalls : [selectedCallLocal];
      for (const call of callsToValidate) {
        if (call?.desired_inspection_date) {
          const scheduledDateObj = new Date(scheduleDate);
          const desiredDateObj = new Date(call.desired_inspection_date);
          if (scheduledDateObj < desiredDateObj) {
            showNotification(`Scheduled date cannot be before the Desired Inspection Date (${call.desired_inspection_date}) for call ${call.call_no}. Please select a later date.`, 'error');
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
            createdBy: userId
          };
          await scheduleInspection(scheduleData);
          // Mark call as scheduled in local storage
          markAsScheduled(call.call_no, scheduleDate);
        }
      } else {
        // Single call scheduling
        const scheduleData = {
          callNo: selectedCallLocal?.call_no,
          scheduleDate: scheduleDate,
          reason: remarks,
          createdBy: userId,
          updatedBy: userId
        };

        if (isReschedule) {
          await rescheduleInspection(scheduleData);
        } else {
          await scheduleInspection(scheduleData);
        }
        // Mark call as scheduled in local storage
        markAsScheduled(selectedCallLocal?.call_no, scheduleDate);
      }

      // Show success notification
      showNotification('Inspection scheduled successfully!', 'success');

      // Clear workflow cache to force fresh data on next fetch
      clearWorkflowCache();

      // Refresh the schedule list
      if (refreshCallback) {
        refreshCallback();
      }

      // Refresh the pending calls list to update status immediately (force refresh to bypass cache)
      await fetchPendingData(true);

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

  // Handle Start/Resume button - calls Azure API when status is IE_SCHEDULED
  const handleStart = async (call) => {
    console.log('🔍 handleStart called for:', call.call_no);
    console.log('🔍 Call status:', call.status);

    // TEMPORARY: Always route to inspection initiation page for VERIFY_PO_DETAILS status
    // This allows IE to review/edit inspection initiation data before going to dashboard
    if (call.status === 'VERIFY_PO_DETAILS') {
      console.log('🔄 VERIFY_PO_DETAILS status - routing to inspection initiation page');
      onStartInspection(call);
      return;
    }

    // Check if call is already initiated (has inspection data stored)
    const alreadyInitiated = isCallInitiated(call.call_no);
    console.log('📊 Already initiated?', alreadyInitiated);

    // If already initiated, navigate directly to dashboard (RESUME flow)
    if (alreadyInitiated) {
      console.log('✅ RESUME flow - navigating to dashboard');

      // Try to get shift and date from various storage locations
      let shiftOfInspection = sessionStorage.getItem('inspectionShift');
      let dateOfInspection = sessionStorage.getItem('inspectionDate');

      // If not in sessionStorage, try to get from initiation data
      if (!shiftOfInspection || !dateOfInspection) {
        const initiationKey = `inspection_initiation_${call.call_no}`;
        const initiationData = sessionStorage.getItem(initiationKey);
        if (initiationData) {
          try {
            const data = JSON.parse(initiationData);
            shiftOfInspection = data.shiftOfInspection;
            dateOfInspection = data.dateOfInspection;
            console.log('📝 Found shift/date in initiation data:', { shiftOfInspection, dateOfInspection });
          } catch (e) {
            console.error('Error parsing initiation data:', e);
          }
        }
      }

      // If not found, try from call status metadata
      if (!shiftOfInspection || !dateOfInspection) {
        const callData = getCallStatusData(call.call_no);
        if (callData?.metadata) {
          shiftOfInspection = callData.metadata.shiftOfInspection;
          dateOfInspection = callData.metadata.dateOfInspection;
          console.log('📝 Found shift/date in call status metadata:', { shiftOfInspection, dateOfInspection });
        }
      }

      // Store shift and date in sessionStorage for dashboard to use
      if (shiftOfInspection && dateOfInspection) {
        sessionStorage.setItem('inspectionShift', shiftOfInspection);
        sessionStorage.setItem('inspectionDate', dateOfInspection);
        console.log('💾 Stored shift/date in sessionStorage');
      }

      // Navigate directly to dashboard based on product type
      const productType = call.product_type;
      console.log('🚀 Navigating to dashboard for product type:', productType);
      console.log('📞 Call object:', call);
      console.log('🔧 setSelectedCall function:', typeof setSelectedCall);
      console.log('🔧 setCurrentPage function:', typeof setCurrentPage);

      // Set the selected call first
      setSelectedCall(call);
      console.log('✅ setSelectedCall called');

      // Then navigate based on product type (handle both formats)
      const productTypeLower = productType?.toLowerCase() || '';

      if (productTypeLower.includes('raw') || productType === 'ERC-RAW MATERIAL') {
        console.log('➡️ Calling setCurrentPage("rm-dashboard")');
        setCurrentPage('rm-dashboard');
        console.log('✅ setCurrentPage called for rm-dashboard');
      } else if (productTypeLower.includes('process') || productType === 'ERC-PROCESS MATERIAL') {
        console.log('➡️ Calling setCurrentPage("process-dashboard")');
        setCurrentPage('process-dashboard');
        console.log('✅ setCurrentPage called for process-dashboard');
      } else if (productTypeLower.includes('final') || productType === 'ERC-FINAL PRODUCT') {
        console.log('➡️ Calling setCurrentPage("final-dashboard")');
        setCurrentPage('final-dashboard');
        console.log('✅ setCurrentPage called for final-dashboard');
      } else {
        console.error('❌ Unknown product type:', productType);
      }
      return;
    }

    console.log('🆕 START flow - navigating to initiation page');

    // Not initiated yet - proceed with normal START flow
    // DO NOT mark as under inspection here - it will be marked when user enters shift/date

    // Only call Azure API if status is IE_SCHEDULED
    if (call.status === 'IE_SCHEDULED') {
      try {
        const currentUser = getStoredUser();
        const userId = currentUser?.userId || 0;

        const actionData = {
          workflowTransitionId: call.workflowTransitionId || call.id,
          requestId: call.call_no,
          action: 'INITIATE_INSPECTION',
          remarks: 'Starting inspection',
          actionBy: userId,
          pincode: '560001'
        };

        await performTransitionAction(actionData);
        showNotification('Inspection initiated successfully!', 'success');

        // Refresh the pending calls list (force refresh to get updated status)
        fetchPendingData(true);

        // Proceed to inspection page
        onStartInspection(call);
      } catch (error) {
        showNotification(error.message || 'Failed to initiate inspection', 'error');
      }
    } else {
      // For other statuses, just navigate (legacy behavior - commented out local API)
      // Local API call would go here
      onStartInspection(call);
    }
  };

  const handleBulkStart = (calls, scheduleInfo) => {
    const { unscheduledCalls, scheduledCalls, refreshSchedules } = scheduleInfo || {};

    // If there are unscheduled calls, show the popup
    if (unscheduledCalls && unscheduledCalls.length > 0) {
      setUnscheduledCallsInfo({ scheduledCalls, unscheduledCalls, refreshSchedules });
      setAllSelectedForStart(calls);
      setShowUnscheduledPopup(true);
      return;
    }

    // All calls are scheduled, proceed with start
    onStartMultipleInspections(calls);
  };

  // Handle scheduling from unscheduled popup
  const handleScheduleFromPopup = (callToSchedule) => {
    setSelectedCallLocal(callToSchedule);
    setSelectedCalls([callToSchedule]);
    setIsBulkSchedule(false);
    setIsReschedule(false);
    setPreviousSchedule(null);
    setScheduleDate('');
    setRemarks('');
    setRefreshCallback(() => unscheduledCallsInfo.refreshSchedules);
    setShowScheduleModal(true);
  };

  // Handle scheduling all unscheduled from popup
  const handleScheduleAllFromPopup = () => {
    setSelectedCalls(unscheduledCallsInfo.unscheduledCalls);
    setIsBulkSchedule(true);
    setIsReschedule(false);
    setPreviousSchedule(null);
    setScheduleDate('');
    setRemarks('');
    setRefreshCallback(() => unscheduledCallsInfo.refreshSchedules);
    setShowUnscheduledPopup(false);
    setShowScheduleModal(true);
  };

  // Proceed with all scheduled calls (ignore unscheduled)
  const handleProceedWithScheduledOnly = () => {
    if (unscheduledCallsInfo.scheduledCalls.length > 0) {
      setShowUnscheduledPopup(false);
      onStartMultipleInspections(unscheduledCallsInfo.scheduledCalls);
    } else {
      showNotification('No scheduled calls to start. Please schedule the calls first.', 'error');
    }
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

      {/* <div className="breadcrumb">
        <div className="breadcrumb-item breadcrumb-active">Landing Page</div>
      </div> */}

      <h1 style={{ marginBottom: 'var(--space-24)' }}>IE Dashboard</h1>
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {/* 1. List of Calls Pending - Combined: Real RM calls + Mock Process/Final calls */}
      {activeTab === 'pending' && (
        <PendingCallsTab
          calls={combinedPendingCalls}
          onSchedule={handleSchedule}
          onReschedule={handleReschedule}
          onStart={handleStart}
          onBulkSchedule={handleBulkSchedule}
          onBulkStart={handleBulkStart}
          isLoading={isLoading}
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
          <>
            {/* Already Scheduled Calls - Show first for reference */}
            {alreadyScheduledCallsInfo.length > 0 && (
              <div style={{
                marginBottom: 'var(--space-16)',
                padding: 'var(--space-12)',
                background: '#ecfdf5',
                borderRadius: 'var(--radius-base)',
                border: '1px solid #10b981'
              }}>
                <div style={{ fontWeight: '600', marginBottom: 'var(--space-12)', color: '#059669' }}>
                  ✓ Already Scheduled ({alreadyScheduledCallsInfo.length})
                </div>
                {alreadyScheduledCallsInfo.map((call, idx) => (
                  <div
                    key={call.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--space-8) 0',
                      borderBottom: idx < alreadyScheduledCallsInfo.length - 1 ? '1px solid #6ee7b7' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '500' }}>{call.call_no}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        PO: {call.po_no}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Scheduled Date</div>
                      <div style={{ fontWeight: '500', color: '#059669' }}>
                        {call.scheduleInfo?.scheduleDate
                          ? new Date(call.scheduleInfo.scheduleDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Unscheduled Calls - To be scheduled (shown below) */}
            <div style={{
              marginBottom: 'var(--space-16)',
              padding: 'var(--space-12)',
              background: '#fff8e1',
              borderRadius: 'var(--radius-base)',
              border: '1px solid #f59e0b'
            }}>
              <div style={{ fontWeight: '600', marginBottom: 'var(--space-12)', color: '#b45309' }}>
                ⚠️ Scheduling For: {selectedCalls.map(c => c.call_no).join(', ')}
              </div>
              {selectedCalls.map((call, idx) => (
                <div
                  key={call.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-8) 0',
                    borderBottom: idx < selectedCalls.length - 1 ? '1px solid #fcd34d' : 'none'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500' }}>{call.call_no}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      PO: {call.po_no}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Desired Date</div>
                    <div style={{ fontWeight: '500', color: '#f59e0b' }}>
                      {call.desired_inspection_date || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {!isBulkSchedule && (
          <div style={{ marginBottom: 'var(--space-16)', padding: 'var(--space-12)', background: 'var(--color-bg-1)', borderRadius: 'var(--radius-base)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600' }}>{selectedCallLocal?.call_no}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  PO: {selectedCallLocal?.po_no}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Desired Date</div>
                <div style={{ fontWeight: '500', color: '#f59e0b' }}>
                  {selectedCallLocal?.desired_inspection_date || 'N/A'}
                </div>
              </div>
            </div>
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
          <label className="form-label required">
            {isReschedule ? 'New Schedule Date' : 'Schedule Date'}
            {isBulkSchedule && selectedCalls.length > 0 && (
              <span style={{ fontWeight: 'normal', color: '#b45309', marginLeft: '8px' }}>
                for {selectedCalls.map(c => c.call_no).join(', ')}
              </span>
            )}
            {!isBulkSchedule && selectedCallLocal && (
              <span style={{ fontWeight: 'normal', color: '#b45309', marginLeft: '8px' }}>
                for {selectedCallLocal.call_no}
              </span>
            )}
          </label>
          <input
            type="date"
            className="form-control"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            disabled={isSubmitting}
            min={isBulkSchedule
              ? selectedCalls.reduce((maxDate, call) => {
                  if (call.desired_inspection_date && call.desired_inspection_date > maxDate) {
                    return call.desired_inspection_date;
                  }
                  return maxDate;
                }, '')
              : (selectedCallLocal?.desired_inspection_date || '')}
          />
          <small style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {isReschedule ? 'Select new date for inspection' : 'Select the date for inspection'}
            {(isBulkSchedule ? selectedCalls[0]?.desired_inspection_date : selectedCallLocal?.desired_inspection_date) && (
              <span style={{ color: '#f59e0b', marginLeft: '8px' }}>
                (Min: {isBulkSchedule
                  ? selectedCalls.reduce((maxDate, call) => {
                      if (call.desired_inspection_date && call.desired_inspection_date > maxDate) {
                        return call.desired_inspection_date;
                      }
                      return maxDate;
                    }, selectedCalls[0]?.desired_inspection_date || '')
                  : selectedCallLocal?.desired_inspection_date})
              </span>
            )}
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

      {/* Unscheduled Calls Popup */}
      <Modal
        isOpen={showUnscheduledPopup}
        onClose={() => setShowUnscheduledPopup(false)}
        title="Some Calls Are Not Scheduled"
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowUnscheduledPopup(false)}
            >
              Cancel
            </button>
            {unscheduledCallsInfo.scheduledCalls.length > 0 && (
              <button
                className="btn btn-outline"
                onClick={handleProceedWithScheduledOnly}
              >
                Start with Scheduled Only ({unscheduledCallsInfo.scheduledCalls.length})
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleScheduleAllFromPopup}
            >
              Schedule All ({unscheduledCallsInfo.unscheduledCalls.length})
            </button>
          </div>
        }
      >
        <div style={{ marginBottom: 'var(--space-16)' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-16)' }}>
            The following calls need to be scheduled before starting inspection:
          </p>

          {/* Unscheduled Calls List */}
          <div style={{
            background: '#fff8e1',
            padding: 'var(--space-16)',
            borderRadius: 'var(--radius-base)',
            border: '1px solid #f59e0b',
            marginBottom: 'var(--space-16)'
          }}>
            <div style={{ fontWeight: '600', marginBottom: 'var(--space-12)', color: '#b45309' }}>
              ⚠️ Unscheduled Calls ({unscheduledCallsInfo.unscheduledCalls.length})
            </div>
            {unscheduledCallsInfo.unscheduledCalls.map((call, idx) => (
              <div
                key={call.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-8) 0',
                  borderBottom: idx < unscheduledCallsInfo.unscheduledCalls.length - 1 ? '1px solid #fcd34d' : 'none'
                }}
              >
                <div>
                  <div style={{ fontWeight: '500' }}>{call.call_no}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    PO: {call.po_no} | Desired: {call.desired_inspection_date || 'N/A'}
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleScheduleFromPopup(call)}
                >
                  Schedule
                </button>
              </div>
            ))}
          </div>

          {/* Scheduled Calls List */}
          {unscheduledCallsInfo.scheduledCalls.length > 0 && (
            <div style={{
              background: '#ecfdf5',
              padding: 'var(--space-16)',
              borderRadius: 'var(--radius-base)',
              border: '1px solid #10b981'
            }}>
              <div style={{ fontWeight: '600', marginBottom: 'var(--space-12)', color: '#059669' }}>
                ✓ Scheduled Calls ({unscheduledCallsInfo.scheduledCalls.length})
              </div>
              {unscheduledCallsInfo.scheduledCalls.map((call, idx) => (
                <div
                  key={call.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-8) 0',
                    borderBottom: idx < unscheduledCallsInfo.scheduledCalls.length - 1 ? '1px solid #6ee7b7' : 'none'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500' }}>{call.call_no}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      PO: {call.po_no}
                    </div>
                  </div>
                  <span style={{ color: '#059669', fontWeight: '500' }}>Ready</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default IELandingPage;
