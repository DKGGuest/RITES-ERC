/* eslint-disable unicode-bom */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { formatDate } from '../utils/helpers';
import { finishProcessInspection, pauseProcessInspection } from '../services/processInspectionService';
import { getAllProcessData, clearAllProcessData, saveToLocalStorage, loadFromLocalStorage } from '../services/processLocalStorageService';
import { fetchProcessInitiationData } from '../services/processInitiationDataService';
import { markAsPaused, markAsWithheld } from '../services/callStatusService';
import { fetchPendingWorkflowTransitions, performTransitionAction } from '../services/workflowService';
import { getStoredUser } from '../services/authService';
import { getQuantitySummary } from '../services/processMaterialService';
import InspectionInitiationFormContent from '../components/InspectionInitiationFormContent';
import Notification from '../components/Notification';

// Reason options for withheld/cancel call
const WITHHELD_REASONS = [
  { value: '', label: 'Select Reason *' },
  { value: 'MATERIAL_NOT_AVAILABLE', label: 'Full quantity of material not available with firm at the time of inspection' },
  { value: 'PLACE_NOT_AS_PER_PO', label: 'Place of inspection is not as per the PO' },
  { value: 'VENDOR_WITHDRAWN', label: 'Vendor has withdrawn the inspection call' },
  { value: 'ANY_OTHER', label: 'Any other' },
];

// Alias for consistency with InspectionInitiationPage
const CALL_ACTION_REASONS = WITHHELD_REASONS;

// localStorage key for dashboard draft data
const DASHBOARD_DRAFT_KEY = 'process_dashboard_draft_';

// Styles for the static data section and submodule session
const staticDataStyles = `
  .process-form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 20px;
  }

  .process-form-group {
    display: flex;
    flex-direction: column;
  }

  .process-form-label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
  }

  .process-form-input {
    padding: 10px 14px;
    font-size: 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background-color: #f9fafb;
    color: #374151;
  }

  /* Sub Module Session Styles - Same as Raw Material */
  .process-submodule-session {
    padding: 24px;
    background: linear-gradient(135deg, #fef7ed 0%, #fef3e2 100%);
    border-radius: 12px;
    border: 1px solid #f59e0b;
    margin-bottom: 24px;
  }

  .process-submodule-session-header {
    margin-bottom: 20px;
  }

  .process-submodule-session-title {
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 8px 0;
  }

  .process-submodule-session-subtitle {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }

  .process-submodule-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .process-submodule-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 16px;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 120px;
  }

  .process-submodule-btn:hover {
    border-color: #0d9488;
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
    transform: translateY(-2px);
  }

  .process-submodule-btn-icon {
    font-size: 28px;
    margin-bottom: 10px;
  }

  .process-submodule-btn-title {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    text-align: center;
    margin: 0 0 6px 0;
    line-height: 1.3;
  }

  .process-submodule-btn-desc {
    font-size: 12px;
    color: #64748b;
    text-align: center;
    margin: 0;
  }

  @media (max-width: 1024px) {
    .process-form-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .process-submodule-buttons {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Lot Wise Quantity Breakup Table Styles */
  .lot-wise-quantity-wrapper {
    padding: var(--space-16);
    margin-bottom: var(--space-16);
    background: linear-gradient(135deg, #f0fdf4 0%, #f1fdf9 100%);
    border-radius: 12px;
    border: 1px solid #86efac;
  }

  .lot-wise-quantity-title {
    font-size: 18px;
    font-weight: 700;
    color: #15803d;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .lot-wise-quantity-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .lot-wise-quantity-table thead {
    background-color: #dcfce7;
    border-bottom: 2px solid #86efac;
  }

  .lot-wise-quantity-table th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: #15803d;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .lot-wise-quantity-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
  }

  .lot-wise-quantity-table tbody tr:hover {
    background-color: #f8fdf6;
  }

  .lot-wise-quantity-table tbody tr:last-child td {
    border-bottom: none;
  }

  .lot-number-cell {
    font-weight: 600;
    color: #1f2937;
  }

  .quantity-cell-manufactured {
    color: #3b82f6;
    font-weight: 500;
  }

  .quantity-cell-accepted {
    color: #22c55e;
    font-weight: 600;
  }

  .quantity-cell-rejected {
    color: #ef4444;
    font-weight: 600;
  }

  .lot-wise-quantity-wrapper {
    margin-top: 24px;
  }

  @media (max-width: 768px) {
    .process-form-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .process-submodule-buttons {
      grid-template-columns: repeat(2, 1fr);
    }
    .process-submodule-btn {
      padding: 16px 12px;
      min-height: 100px;
    }
    .process-submodule-btn-icon {
      font-size: 24px;
    }
    .process-submodule-btn-title {
      font-size: 12px;
    }
    .process-submodule-btn-desc {
      font-size: 10px;
    }
  }

  @media (max-width: 640px) {
    .process-submodule-buttons {
      grid-template-columns: 1fr;
    }
    .process-submodule-btn {
      padding: 20px 16px;
      min-height: 120px;
    }
    .process-submodule-btn-icon {
      font-size: 28px;
    }
    .process-submodule-btn-title {
      font-size: 14px;
    }
    .process-submodule-btn-desc {
      font-size: 12px;
    }
  }

  @media (max-width: 480px) {
    .process-form-grid {
      gap: 12px;
    }
    .process-form-group {
      margin-bottom: 12px;
    }
    .process-form-label {
      font-size: 12px;
    }
    .process-form-input {
      font-size: 12px;
      padding: 8px 12px;
    }
    .process-submodule-session {
      padding: 16px;
    }
    .process-submodule-session-title {
      font-size: 18px;
    }
    .process-submodule-session-subtitle {
      font-size: 12px;
    }
    .process-submodule-buttons {
      gap: 12px;
    }
    .process-submodule-btn {
      padding: 16px 12px;
      min-height: 100px;
    }
    .process-submodule-btn-icon {
      font-size: 24px;
    }
    .process-submodule-btn-title {
      font-size: 12px;
    }
    .process-submodule-btn-desc {
      font-size: 10px;
    }
  }

  /* Additional mobile responsiveness for header and other elements */
  @media (max-width: 768px) {
    .process-dashboard .process-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    .process-dashboard .process-header h1 {
      font-size: 24px;
      margin: 0;
    }
    .process-dashboard .process-header .btn {
      width: 100%;
      justify-content: center;
    }
    .process-dashboard .process-line-toggle {
      width: 100%;
      flex-direction: column;
    }
    .process-dashboard .process-line-toggle button {
      width: 100%;
      padding: 12px;
      font-size: 14px;
    }
    .process-dashboard .process-context-info {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .process-dashboard .breadcrumb {
      flex-wrap: wrap;
      font-size: 12px;
    }
    .process-dashboard .card {
      padding: 16px;
    }
    .process-dashboard .card-header {
      padding: 12px 0;
    }
    .process-dashboard .card-title {
      font-size: 16px;
    }
    .process-dashboard .card-subtitle {
      font-size: 12px;
    }
    .process-dashboard .alert {
      padding: 12px;
      font-size: 13px;
    }
    .process-dashboard .input-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    /* Final Inspection Table - Card Layout for Mobile */
    .process-dashboard .final-inspection-table thead {
      display: none;
    }
    .process-dashboard .final-inspection-table tbody tr {
      display: block;
      margin-bottom: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      background: #fff;
    }
    .process-dashboard .final-inspection-table tbody tr.total-row {
      background: #0d9488;
      border-color: #0d9488;
    }
    .process-dashboard .final-inspection-table tbody td {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border: none;
      border-bottom: 1px solid #f1f5f9;
    }
    .process-dashboard .final-inspection-table tbody td:last-child {
      border-bottom: none;
    }
    .process-dashboard .final-inspection-table tbody td::before {
      content: attr(data-label);
      font-weight: 600;
      color: #64748b;
      margin-right: 12px;
    }
    .process-dashboard .final-inspection-table tbody tr.total-row td::before {
      color: rgba(255,255,255,0.8);
    }
    .process-dashboard .final-inspection-table tbody tr.total-row td {
      border-bottom-color: rgba(255,255,255,0.2);
    }
  }

  @media (max-width: 480px) {
    .process-dashboard .process-header h1 {
      font-size: 18px;
    }
    .process-dashboard .process-line-toggle button {
      padding: 10px;
      font-size: 12px;
    }
    .process-dashboard .process-context-info {
      padding: 12px;
      gap: 8px;
    }
    .process-dashboard .process-context-info > div {
      padding: 8px;
    }
    .process-dashboard .process-context-info > div div:first-child {
      font-size: 16px;
    }
    .process-dashboard .card {
      padding: 12px;
      margin-bottom: 16px;
    }
    .process-dashboard .card-title {
      font-size: 14px;
    }
    .process-dashboard .process-submodule-session {
      padding: 12px;
    }
    .process-dashboard .process-submodule-session-title {
      font-size: 16px;
    }
    .process-dashboard .btn {
      padding: 10px 16px;
      font-size: 13px;
    }
    .process-dashboard .data-table {
      font-size: 12px;
    }
    .process-dashboard .data-table th, .process-dashboard .data-table td {
      padding: 8px 6px;
    }
    .process-dashboard .form-control {
      padding: 10px 12px;
      font-size: 14px;
    }
    .process-dashboard textarea.form-control {
      min-height: 80px;
    }
  }

  /* Lot ↔ Heat mapping grid: desktop 5 columns, mobile 2 columns */
  .lot-heat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 8px;
  }
  .lot-heat-item {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .lot-heat-label {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 2px;
  }
  .lot-heat-value {
    font-weight: 600;
    color: #0f172a;
  }
  /* Compact card overrides for this page */
  .compact-card { padding: 12px; }
  .compact-card .card-header { margin-bottom: 8px; padding: 0; }
  .compact-card .card-title { font-size: 16px; }
  .compact-card .card-subtitle { font-size: 12px; margin-top: 4px; }
  .compact-card .alert { padding: 8px; font-size: 12px; }

  @media (max-width: 768px) {
    .lot-heat-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
  }

  /* Heat Wise Accoutnal Table - Mobile Responsive */
  .heat-wise-accoutnal-table thead {
    display: none;
  }

  .heat-wise-accoutnal-table tbody tr {
    display: block;
    margin-bottom: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    background: #fff;
  }

  .heat-wise-accoutnal-table tbody td {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border: none;
    border-bottom: 1px solid #f1f5f9;
  }

  .heat-wise-accoutnal-table tbody td:last-child {
    border-bottom: none;
  }

  .heat-wise-accoutnal-table tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #64748b;
    margin-right: 12px;
    min-width: 120px;
  }

  @media (min-width: 769px) {
    .heat-wise-accoutnal-table thead {
      display: table-header-group;
    }

    .heat-wise-accoutnal-table tbody tr {
      display: table-row;
      margin-bottom: 0;
      border: none;
      border-radius: 0;
      padding: 0;
      background: transparent;
    }

    .heat-wise-accoutnal-table tbody tr:hover {
      background-color: #f8fdf6;
    }

    .heat-wise-accoutnal-table tbody td {
      display: table-cell;
      justify-content: auto;
      padding: 12px 16px;
      border: none;
      border-bottom: 1px solid #e5e7eb;
    }

    .heat-wise-accoutnal-table tbody td::before {
      display: none;
    }
  }

  /* Production Lines Table - Mobile Responsive */
  .production-lines-table thead {
    display: none;
  }

  .production-lines-table tbody tr {
    display: block;
    margin-bottom: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    background: #fff;
  }

  .production-lines-table tbody td {
    display: flex;
    flex-direction: column;
    padding: 8px 0;
    border: none;
    border-bottom: 1px solid #f1f5f9;
  }

  .production-lines-table tbody td:last-child {
    border-bottom: none;
  }

  .production-lines-table tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #64748b;
    margin-bottom: 6px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .production-lines-table tbody td input,
  .production-lines-table tbody td select {
    width: 100% !important;
    min-width: auto !important;
  }

  .production-lines-table tbody td button {
    width: 100%;
  }

  @media (min-width: 769px) {
    .production-lines-table thead {
      display: table-header-group;
    }

    .production-lines-table tbody tr {
      display: table-row;
      margin-bottom: 0;
      border: none;
      border-radius: 0;
      padding: 0;
      background: transparent;
    }

    .production-lines-table tbody tr:hover {
      background-color: #f8fafc;
    }

    .production-lines-table tbody td {
      display: table-cell;
      flex-direction: row;
      padding: 12px 16px;
      border: none;
      border-bottom: 1px solid #e2e8f0;
    }

    .production-lines-table tbody td::before {
      display: none;
    }

    .production-lines-table tbody td input,
    .production-lines-table tbody td select {
      width: auto !important;
      min-width: auto !important;
    }

    .production-lines-table tbody td button {
      width: auto;
    }
  }

`;




const ProcessDashboard = ({ call, onBack, onNavigateToSubModule, productionLines: initialProductionLines = [], availableCalls = [] }) => {
  // State for fetched data from backend
  const [fetchedCallData, setFetchedCallData] = useState(null);
  const [fetchedPoData, setFetchedPoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State for additional initiated calls (added through "Add New Call Number" modal)
  // Persisted in sessionStorage
  const [additionalInitiatedCalls, setAdditionalInitiatedCalls] = useState(() => {
    const saved = sessionStorage.getItem('additionalInitiatedCalls');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.log('Error parsing saved additional calls:', e);
      }
    }
    return [];
  });

  // State for production lines section
  const [productionLinesExpanded, setProductionLinesExpanded] = useState(true);

  // State for editable production lines - persisted in sessionStorage
  const [localProductionLines, setLocalProductionLines] = useState(() => {
    // First check sessionStorage for persisted data
    const savedLines = sessionStorage.getItem('processProductionLinesData');
    if (savedLines) {
      try {
        const parsed = JSON.parse(savedLines);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.log('Error parsing saved production lines:', e);
      }
    }

    if (initialProductionLines && initialProductionLines.length > 0) {
      return initialProductionLines;
    }
    // If multiple calls available, create rows for each but leave unselected
    if (availableCalls && availableCalls.length > 0) {
      return availableCalls.map((_, idx) => ({
        lineNumber: idx + 1,
        icNumber: '',
        poNumber: '',
        rawMaterialICs: '',
        productType: ''
      }));
    }
    // Default first line with empty fields - user must select from dropdown
    return [{
      lineNumber: 1,
      icNumber: '',
      poNumber: '',
      rawMaterialICs: '',
      productType: ''
    }];
  });

  // State to store fetched initiation data for each call (keyed by call number)
  // This stores PO data, heat numbers, lot numbers, etc. from the backend API
  // Persisted in sessionStorage to avoid re-fetching when navigating between modules
  const [callInitiationDataCache, setCallInitiationDataCache] = useState(() => {
    const saved = sessionStorage.getItem('processCallInitiationDataCache');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.log('Error parsing saved call initiation data cache:', e);
      }
    }
    return {};
  });

  // Refs to prevent duplicate API calls (especially in React StrictMode and when navigating back)
  const hasFetchedRef = useRef(false);
  const currentCallRef = useRef(null);
  const hasLoadedDraftRef = useRef(false);

  // Reset refs when component unmounts or call changes
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      hasFetchedRef.current = false;
      currentCallRef.current = null;
      hasLoadedDraftRef.current = false;
    };
  }, []);

  // Cache helpers removed (unused) to satisfy linting rules

  // State for "Add New Call Number" modal
  const [showAddCallModal, setShowAddCallModal] = useState(false);
  const [showInitiationForm, setShowInitiationForm] = useState(false);
  const [selectedNewCall, setSelectedNewCall] = useState(null);
  const [selectedNewCallData, setSelectedNewCallData] = useState(null);
  const [isLoadingInitiationData, setIsLoadingInitiationData] = useState(false);
  const [allProcessCalls, setAllProcessCalls] = useState([]);
  const [isLoadingProcessCalls, setIsLoadingProcessCalls] = useState(false);

  // State for initiation form data (matching InspectionInitiationPage)
  const [newCallShift, setNewCallShift] = useState('');
  const [newCallOfferedQty, setNewCallOfferedQty] = useState(0);
  const [newCallCmApproval, setNewCallCmApproval] = useState(false);
  const [newCallDate, setNewCallDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCallMultipleLinesActive, setNewCallMultipleLinesActive] = useState(false);
  const [newCallProductionLines, setNewCallProductionLines] = useState([{ lineNumber: 1, icNumber: '', poNumber: '', rawMaterialICs: [], productType: '' }]);
  const [newCallSectionAVerified, setNewCallSectionAVerified] = useState(false);
  const [newCallSectionAStatus, setNewCallSectionAStatus] = useState('');
  const [newCallSectionBVerified, setNewCallSectionBVerified] = useState(false);
  const [newCallSectionBStatus, setNewCallSectionBStatus] = useState('');
  const [newCallSectionCVerified, setNewCallSectionCVerified] = useState(false);
  const [newCallSectionCStatus, setNewCallSectionCStatus] = useState('');
  const [newCallSectionDVerified, setNewCallSectionDVerified] = useState(false);
  const [newCallShowValidationErrors, setNewCallShowValidationErrors] = useState(false);

  // State for call action modals (withheld/cancel)
  const [showNewCallActionModal, setShowNewCallActionModal] = useState(false);
  const [newCallActionType, setNewCallActionType] = useState('');
  const [newCallActionReason, setNewCallActionReason] = useState('');
  const [newCallActionRemarks, setNewCallActionRemarks] = useState('');
  const [newCallActionError, setNewCallActionError] = useState('');

  // State for initiate inspection modal
  const [showNewCallInitiateModal, setShowNewCallInitiateModal] = useState(false);
  const [newCallInitiateError, setNewCallInitiateError] = useState('');
  const [isNewCallSaving, setIsNewCallSaving] = useState(false);

  // Persist production lines to sessionStorage whenever they change
  useEffect(() => {
    if (localProductionLines && localProductionLines.length > 0) {
      sessionStorage.setItem('processProductionLinesData', JSON.stringify(localProductionLines));
    }
  }, [localProductionLines]);

  // Persist call initiation data cache to sessionStorage whenever it changes
  useEffect(() => {
    if (callInitiationDataCache && Object.keys(callInitiationDataCache).length > 0) {
      sessionStorage.setItem('processCallInitiationDataCache', JSON.stringify(callInitiationDataCache));
      console.log('💾 [Cache] Persisted call initiation data cache to sessionStorage');
    }
  }, [callInitiationDataCache]);

  // Fetch all process calls on component mount and cache them
  useEffect(() => {
    const fetchAllProcessCalls = async () => {
      try {
        setIsLoadingProcessCalls(true);
        console.log('🚀 [Process Dashboard] Fetching all process calls on mount...');

        // Get current user info
        const user = getStoredUser();
        if (!user) {
          console.warn('⚠️ User not authenticated, skipping process calls fetch');
          setIsLoadingProcessCalls(false);
          return;
        }

        const roleName = user.roleName;
        const userId = parseInt(user.userId, 10);

        // Fetch all pending workflow transitions for IE role
        const allTransitions = await fetchPendingWorkflowTransitions(roleName, false); // use cache if available
        console.log('✅ [Process Dashboard] Fetched workflow transitions:', allTransitions.length);

        // Filter only Process type calls assigned to current user
        const processCalls = allTransitions.filter(transition => {
          const isProcess = transition.productType === 'Process';
          const isAssignedToUser = Array.isArray(transition.processIes) && transition.processIes.includes(userId);
          return isProcess && isAssignedToUser;
        });
        console.log('✅ [Process Dashboard] Filtered process calls:', processCalls.length);

        // Transform to match the format expected by the modal
        const transformedCalls = processCalls.map(transition => ({
          call_no: transition.requestId || '',
          po_no: transition.poNo || '',
          rawMaterialICs: transition.rmIcNumber || '',
          productType: transition.ercType || '', // Use ercType from workflow transition, not hardcoded
          vendorName: transition.vendorName || '',
          status: transition.status || ''
        }));

        setAllProcessCalls(transformedCalls);
        console.log('💾 [Process Dashboard] Cached process calls:', transformedCalls.length);
        setIsLoadingProcessCalls(false);
      } catch (error) {
        console.error('❌ [Process Dashboard] Error fetching process calls:', error);
        setIsLoadingProcessCalls(false);
      }
    };

    fetchAllProcessCalls();
  }, []); // Run once on mount

  // Persist additionalInitiatedCalls to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('additionalInitiatedCalls', JSON.stringify(additionalInitiatedCalls));
  }, [additionalInitiatedCalls]);

  // Available call numbers for dropdown - use passed availableCalls or build from current call
  const callNumberOptions = availableCalls.length > 0 ? availableCalls : [];

  // Add current call to options if not present
  const currentCallOption = call?.call_no ? {
    call_no: call.call_no,
    po_no: call.po_no,
    rawMaterialICs: call.rm_heat_tc_mapping?.map(m => m.subPoNumber).filter(Boolean).join(', ') || '',
    productType: call.erc_type || call.product_type || '' // Use erc_type from call data, not hardcoded
  } : null;

  // Combine all call options: current call + availableCalls + additionalInitiatedCalls
  let allCallOptions = currentCallOption && !callNumberOptions.find(c => c.call_no === call.call_no)
    ? [currentCallOption, ...callNumberOptions]
    : callNumberOptions.length > 0 ? callNumberOptions : (currentCallOption ? [currentCallOption] : []);

  // Add additional initiated calls to the options
  allCallOptions = [...allCallOptions, ...additionalInitiatedCalls];

  // Add any selected call numbers from production lines that are not already in the options
  // This ensures dropdown values persist even if the call is not in availableCalls
  const selectedCallNumbers = localProductionLines
    .map(line => line.icNumber)
    .filter(Boolean)
    .filter(callNo => !allCallOptions.find(opt => opt.call_no === callNo));

  // For selected calls not in options, create placeholder options with just the call number
  const selectedCallOptions = selectedCallNumbers.map(callNo => ({
    call_no: callNo,
    po_no: '',
    rawMaterialICs: '',
    productType: ''
  }));

  allCallOptions = [...allCallOptions, ...selectedCallOptions];

  // Handle call number change for a production line
  const handleCallNumberChange = async (lineIndex, selectedCallNo) => {
    console.log('🔄 [Production Line] Call number changed:', selectedCallNo);
    console.log('🔄 [Production Line] Line index:', lineIndex);
    const selectedCall = allCallOptions.find(c => c.call_no === selectedCallNo);
    console.log('🔄 [Production Line] Selected call from options:', selectedCall);

    // First, update the production line with the selected call number (optimistic update)
    setLocalProductionLines(prev => {
      const updated = [...prev];
      updated[lineIndex] = {
        ...updated[lineIndex],
        icNumber: selectedCallNo,
        poNumber: '',
        rawMaterialICs: '',
        productType: ''
      };
      return updated;
    });

    // Then fetch the full data from API
    try {
      // Call the Process Initiation Service to get RM IC number, ERC type, and all other data
      console.log('📤 [Production Line] Fetching call details from service for call:', selectedCallNo);
      const data = await fetchProcessInitiationData(selectedCallNo);

      console.log('✅ [Production Line] Service Response:', data);
      console.log('✅ [Production Line] rmIcNumber from API:', data.rmIcNumber);
      console.log('✅ [Production Line] typeOfErc from API:', data.typeOfErc);
      console.log('✅ [Production Line] poNo from API:', data.poNo);
      console.log('✅ [Production Line] rmIcHeatInfoList:', data.rmIcHeatInfoList);
      console.log('✅ [Production Line] lotNumber from API:', data.lotNumber);
      console.log('✅ [Production Line] heatNumber from API:', data.heatNumber);

      const rmIcNumber = data.rmIcNumber || '';
      const ercType = data.typeOfErc || '';
      const poNumber = data.poNo || selectedCall?.po_no || '';

      console.log('📋 [Production Line] Final values - RM IC:', rmIcNumber, 'ERC Type:', ercType, 'PO:', poNumber);

      // Update the production line with fetched data
      setLocalProductionLines(prev => {
        const updated = [...prev];
        const updatedLine = {
          ...updated[lineIndex],
          icNumber: selectedCallNo,
          poNumber: poNumber,
          rawMaterialICs: rmIcNumber,
          productType: ercType
        };
        updated[lineIndex] = updatedLine;
        console.log('✅ [Production Line] Updated line', lineIndex + 1, ':', updatedLine);
        return updated;
      });

      // Cache the full initiation data for this call (including manufacturer from rmIcHeatInfoList)
      setCallInitiationDataCache(prev => ({
        ...prev,
        [selectedCallNo]: data
      }));
      console.log('💾 [Production Line] Cached initiation data for call:', selectedCallNo);
    } catch (error) {
      console.error('❌ [Production Line] Error fetching call details:', error);
      console.error('❌ [Production Line] Error stack:', error.stack);

      // On error, keep the call number but show empty fields
      setLocalProductionLines(prev => {
        const updated = [...prev];
        updated[lineIndex] = {
          ...updated[lineIndex],
          icNumber: selectedCallNo,
          poNumber: selectedCall?.po_no || '',
          rawMaterialICs: selectedCall?.rawMaterialICs || '',
          productType: selectedCall?.productType || ''
        };
        return updated;
      });
    }
  };

  // Add new production line
  const handleAddProductionLine = () => {
    setLocalProductionLines(prev => [
      ...prev,
      {
        lineNumber: prev.length + 1,
        icNumber: '',
        poNumber: '',
        rawMaterialICs: '',
        productType: ''
      }
    ]);
  };

  // Remove production line
  const handleRemoveProductionLine = (lineIndex) => {
    if (localProductionLines.length <= 1) {
      showNotification('error', 'At least one production line is required');
      return;
    }
    setLocalProductionLines(prev => {
      const updated = prev.filter((_, idx) => idx !== lineIndex);
      // Renumber remaining lines
      return updated.map((line, idx) => ({ ...line, lineNumber: idx + 1 }));
    });
  };

  // Handle "Add New Call Number" button click
  const handleAddNewCallNumber = () => {
    console.log('🔵 Add New Call Number clicked');
    console.log('💾 Using cached process calls:', allProcessCalls.length);

    // If no cached data, show a message
    if (allProcessCalls.length === 0 && !isLoadingProcessCalls) {
      showNotification('warning', 'No process calls available. Please refresh the page or contact support.');
      return;
    }

    // Show modal with cached data
    setShowAddCallModal(true);
  };


  // Handle call number selection from modal
  const handleSelectNewCall = (callNo) => {
    console.log('🔵 Call selected:', callNo);
    setSelectedNewCall(callNo);
    setSelectedNewCallData(null); // Reset data
    setShowAddCallModal(false);

    // Show initiation form immediately (data will be fetched inside the modal)
    setShowInitiationForm(true);
  };

  // Fetch initiation data when modal opens
  useEffect(() => {
    if (!showInitiationForm || !selectedNewCall) return;

    const fetchInitiationData = async () => {
      try {
        setIsLoadingInitiationData(true);
        console.log('📤 Fetching initiation data for:', selectedNewCall);

        const data = await fetchProcessInitiationData(selectedNewCall);
        console.log('✅ Initiation data fetched:', data);

        setSelectedNewCallData(data);

        // Initialize offeredQty with callQty or poQty
        setNewCallOfferedQty(data.callQty || data.poQty || 0);

        setIsLoadingInitiationData(false);
      } catch (error) {
        console.error('❌ Error fetching initiation data:', error);
        setIsLoadingInitiationData(false);
        showNotification('error', 'Error loading initiation data. Please try again.');
        setShowInitiationForm(false);
        setSelectedNewCall(null);
      }
    };

    fetchInitiationData();
  }, [showInitiationForm, selectedNewCall]);

  // Create formData object for InspectionInitiationFormContent
  const newCallFormData = {
    shiftOfInspection: newCallShift,
    offeredQty: newCallOfferedQty,
    cmApproval: newCallCmApproval,
    dateOfInspection: newCallDate,
    multipleLinesActive: newCallMultipleLinesActive,
    productionLines: newCallProductionLines,
    sectionAVerified: newCallSectionAVerified,
    sectionAStatus: newCallSectionAStatus,
    sectionBVerified: newCallSectionBVerified,
    sectionBStatus: newCallSectionBStatus,
    sectionCVerified: newCallSectionCVerified,
    sectionCStatus: newCallSectionCStatus,
    sectionDVerified: newCallSectionDVerified,
    showValidationErrors: newCallShowValidationErrors,
  };

  // Handle form data changes from InspectionInitiationFormContent
  const handleNewCallFormDataChange = (updates) => {
    if (updates.shiftOfInspection !== undefined) setNewCallShift(updates.shiftOfInspection);
    if (updates.offeredQty !== undefined) setNewCallOfferedQty(updates.offeredQty);
    if (updates.cmApproval !== undefined) setNewCallCmApproval(updates.cmApproval);
    if (updates.dateOfInspection !== undefined) setNewCallDate(updates.dateOfInspection);
    if (updates.multipleLinesActive !== undefined) setNewCallMultipleLinesActive(updates.multipleLinesActive);
    if (updates.productionLines !== undefined) setNewCallProductionLines(updates.productionLines);
    if (updates.sectionAVerified !== undefined) setNewCallSectionAVerified(updates.sectionAVerified);
    if (updates.sectionAStatus !== undefined) setNewCallSectionAStatus(updates.sectionAStatus);
    if (updates.sectionBVerified !== undefined) setNewCallSectionBVerified(updates.sectionBVerified);
    if (updates.sectionBStatus !== undefined) setNewCallSectionBStatus(updates.sectionBStatus);
    if (updates.sectionCVerified !== undefined) setNewCallSectionCVerified(updates.sectionCVerified);
    if (updates.sectionCStatus !== undefined) setNewCallSectionCStatus(updates.sectionCStatus);
    if (updates.sectionDVerified !== undefined) setNewCallSectionDVerified(updates.sectionDVerified);
  };

  // Open call action modal (withheld/cancel) for new call
  const handleOpenNewCallActionModal = (actionType) => {
    setNewCallActionType(actionType);
    setNewCallActionReason('');
    setNewCallActionRemarks('');
    setNewCallActionError('');
    setShowNewCallActionModal(true);
  };

  // Close call action modal for new call
  const handleCloseNewCallActionModal = () => {
    setShowNewCallActionModal(false);
    setNewCallActionType('');
    setNewCallActionReason('');
    setNewCallActionRemarks('');
    setNewCallActionError('');
  };

  // Submit call action (withheld/cancel) for new call
  const handleSubmitNewCallAction = async () => {
    if (!newCallActionReason) {
      setNewCallActionError('Please select a reason');
      return;
    }
    if (newCallActionReason === 'ANY_OTHER' && !newCallActionRemarks.trim()) {
      setNewCallActionError('Please provide remarks for "Any other" reason');
      return;
    }

    setIsNewCallSaving(true);
    try {
      console.log(`🔴 ${newCallActionType} call:`, selectedNewCall);
      console.log('Reason:', newCallActionReason);
      console.log('Remarks:', newCallActionRemarks);

      // Close modals
      handleCloseNewCallActionModal();
      setShowInitiationForm(false);
      setSelectedNewCall(null);
      setSelectedNewCallData(null);

      showNotification('success', `Call ${selectedNewCall} has been ${newCallActionType.toLowerCase()}.`);
    } catch (error) {
      console.error('Error submitting call action:', error);
      setNewCallActionError('Failed to submit. Please try again.');
    } finally {
      setIsNewCallSaving(false);
    }
  };

  // Open initiate inspection modal for new call
  const handleOpenNewCallInitiateModal = () => {
    // Validate all sections are verified
    const isSectionCRequired = true; // Process always requires Section C
    if (!newCallSectionAVerified || !newCallSectionBVerified || (isSectionCRequired && !newCallSectionCVerified)) {
      setNewCallShowValidationErrors(true);
      showNotification('error', 'Please verify all sections (A, B, and C) before initiating inspection.');
      return;
    }

    setNewCallInitiateError('');
    setShowNewCallInitiateModal(true);
  };

  // Close initiate inspection modal for new call
  const handleCloseNewCallInitiateModal = () => {
    setShowNewCallInitiateModal(false);
    setNewCallInitiateError('');
  };

  // Submit initiate inspection for new call
  const handleSubmitNewCallInitiation = async () => {
    if (!newCallShift) {
      setNewCallInitiateError('Please select Shift of Inspection');
      return;
    }
    if (!newCallDate) {
      setNewCallInitiateError('Please select Date of Inspection');
      return;
    }

    setIsNewCallSaving(true);
    try {
      console.log('🟢 Initiating inspection for new call:', selectedNewCall);
      console.log('📋 Form data:', newCallFormData);

      // Create the new call option object for the dropdown
      const newCallOption = {
        call_no: selectedNewCall,
        po_no: selectedNewCallData?.poNo || '',
        rawMaterialICs: selectedNewCallData?.rmIcNumber || '',
        productType: selectedNewCallData?.typeOfErc || 'ERC Process',
        vendor_name: selectedNewCallData?.vendorName || ''
      };

      // Add to additionalInitiatedCalls so it appears in the dropdown
      setAdditionalInitiatedCalls(prev => [...prev, newCallOption]);

      // Add the new call to the production lines in the main dashboard
      const newLine = {
        lineNumber: localProductionLines.length + 1,
        icNumber: selectedNewCall,
        poNumber: selectedNewCallData?.poNo || '',
        rawMaterialICs: selectedNewCallData?.rmIcNumber || '',
        productType: selectedNewCallData?.typeOfErc || 'ERC Process',
        manufacturer: selectedNewCallData?.vendorName || ''
      };

      setLocalProductionLines(prev => [...prev, newLine]);

      // Store the initiated call data in cache so it's available for the dropdown
      setCallInitiationDataCache(prev => ({
        ...prev,
        [selectedNewCall]: newCallFormData
      }));

      // Remove from allProcessCalls so it doesn't show in "Add New Call Number" modal anymore
      setAllProcessCalls(prev => prev.filter(c => c.call_no !== selectedNewCall));

      // Close modals and reset state
      handleCloseNewCallInitiateModal();
      setShowInitiationForm(false);
      setSelectedNewCall(null);
      setSelectedNewCallData(null);

      // Reset form state
      setNewCallShift('');
      setNewCallOfferedQty(0);
      setNewCallCmApproval(false);
      setNewCallDate(new Date().toISOString().split('T')[0]);
      setNewCallMultipleLinesActive(false);
      setNewCallProductionLines([{ lineNumber: 1, icNumber: '', poNumber: '', rawMaterialICs: [], productType: '' }]);
      setNewCallSectionAVerified(false);
      setNewCallSectionAStatus('');
      setNewCallSectionBVerified(false);
      setNewCallSectionBStatus('');
      setNewCallSectionCVerified(false);
      setNewCallSectionCStatus('');
      setNewCallSectionDVerified(false);
      setNewCallShowValidationErrors(false);

      showNotification('success', `Call ${selectedNewCall} has been initiated and added to the production lines!`);
    } catch (error) {
      console.error('❌ Error submitting initiation:', error);
      setNewCallInitiateError('Failed to save. Please try again.');
    } finally {
      setIsNewCallSaving(false);
    }
  };

  // Fetch inspection data from API (same methodology as Raw Material Dashboard)
  useEffect(() => {
    const fetchInspectionData = async () => {
      if (!call?.call_no) {
        setIsLoading(false);
        return;
      }

      const callNo = call.call_no;

      // Reset fetch flag if call changes
      if (currentCallRef.current !== callNo) {
        console.log(`🔄 [Process Dashboard] Call changed from ${currentCallRef.current} to ${callNo} - Resetting fetch flags and clearing state`);
        hasFetchedRef.current = false;
        hasLoadedDraftRef.current = false;
        currentCallRef.current = callNo;

        // Clear any cached state for the previous call to prevent showing stale data
        setFetchedPoData(null);
        setFetchedCallData(null);
        setLocalProductionLines([]);
        setSelectedLine('Line-1'); // Reset to first line
        setIsLoading(true);

        console.log(`🧹 [Process Dashboard] Cleared state for previous call, ready to fetch data for ${callNo}`);
      }

      // Prevent duplicate API calls (especially in React StrictMode and when navigating back)
      if (hasFetchedRef.current) {
        console.log('⏭️ [Process Dashboard] Skipping duplicate API call (already fetched for this call)');
        setIsLoading(false);
        return;
      }

      // Check if we have cached data for this call
      if (callInitiationDataCache[callNo]) {
        console.log('✅ [Process Dashboard] Using cached initiation data for call:', callNo);
        console.log('📦 [Cache] Cached data keys:', Object.keys(callInitiationDataCache));
        console.log('📦 [Cache] Current call data:', callInitiationDataCache[callNo]);
        const initiationData = callInitiationDataCache[callNo];

        // Extract manufacturer from rmIcHeatInfoList (first entry)
        const firstHeatInfo = initiationData.rmIcHeatInfoList && initiationData.rmIcHeatInfoList.length > 0
          ? initiationData.rmIcHeatInfoList[0]
          : null;
        const manufacturer = firstHeatInfo?.manufacturer || initiationData.vendorName || '';

        // Map PO data from cached response
        const poData = {
          po_no: initiationData.poNo || call.po_no,
          po_date: initiationData.poDate || '',
          po_description: initiationData.itemDescription || initiationData.poDescription || '',
          po_qty: initiationData.poQty || 0,
          po_unit: initiationData.poUnit || 'Nos.',
          vendor_name: initiationData.vendorName || '',
          contractor: initiationData.vendorName || '',
          manufacturer: manufacturer,
          place_of_inspection: initiationData.placeOfInspection || call?.place_of_inspection || '',
          amendment_no: initiationData.amendmentNo || 'N/A',
          amendment_date: initiationData.amendmentDate || 'N/A',
          consignee: initiationData.consignee || '',
          delivery_date: initiationData.deliveryDate || '',
          purchasing_authority: initiationData.purchasingAuthority || '',
          bpo: initiationData.billPayingOfficer || ''
        };
        setFetchedPoData(poData);

        // Set call data
        setFetchedCallData({
          inspectionCallNo: callNo,
          shiftOfInspection: 'Day Shift',
          dateOfInspection: new Date().toISOString().split('T')[0]
        });

        // Restore production lines from sessionStorage if present to preserve user selections
        try {
          const savedLines = sessionStorage.getItem('processProductionLinesData');
          if (savedLines) {
            const parsed = JSON.parse(savedLines);
            if (parsed && parsed.length > 0) {
              setLocalProductionLines(parsed);
              console.log('💾 [Process Dashboard] Restored production lines from sessionStorage (cached path)');
            } else if (initialProductionLines && initialProductionLines.length > 0) {
              setLocalProductionLines(initialProductionLines);
              console.log('💾 [Process Dashboard] Initialized production lines from initialProductionLines (cached path)');
            } else if (availableCalls && availableCalls.length > 1) {
              setLocalProductionLines(availableCalls.map((_, idx) => ({
                lineNumber: idx + 1,
                icNumber: '',
                poNumber: '',
                rawMaterialICs: '',
                productType: ''
              })));
              console.log('💾 [Process Dashboard] Created empty production lines for multiple available calls (cached path)');
            } else {
              setLocalProductionLines([{
                lineNumber: 1,
                icNumber: '',
                poNumber: '',
                rawMaterialICs: '',
                productType: ''
              }]);
              console.log('💾 [Process Dashboard] Created default single production line (cached path)');
            }
          } else if (initialProductionLines && initialProductionLines.length > 0) {
            setLocalProductionLines(initialProductionLines);
          } else if (availableCalls && availableCalls.length > 1) {
            setLocalProductionLines(availableCalls.map((_, idx) => ({
              lineNumber: idx + 1,
              icNumber: '',
              poNumber: '',
              rawMaterialICs: '',
              productType: ''
            })));
          } else {
            setLocalProductionLines([{
              lineNumber: 1,
              icNumber: '',
              poNumber: '',
              rawMaterialICs: '',
              productType: ''
            }]);
          }
        } catch (e) {
          console.log('⚠️ [Process Dashboard] Error restoring production lines from sessionStorage:', e);
        }

        hasFetchedRef.current = true;
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        console.log('🏭 [Process Dashboard] Fetching data from API for call:', callNo);

        // Fetch initiation data from API
        const initiationData = await fetchProcessInitiationData(callNo);
        console.log('✅ [Process Dashboard] API Response:', initiationData);

        // Cache the initiation data
        setCallInitiationDataCache(prev => ({
          ...prev,
          [callNo]: initiationData
        }));

        // Extract manufacturer from rmIcHeatInfoList (first entry)
        const firstHeatInfo = initiationData.rmIcHeatInfoList && initiationData.rmIcHeatInfoList.length > 0
          ? initiationData.rmIcHeatInfoList[0]
          : null;
        const manufacturer = firstHeatInfo?.manufacturer || initiationData.vendorName || '';

        // Map PO data from API response (similar to Raw Material Dashboard)
        const poData = {
          po_no: initiationData.poNo || call.po_no,
          po_date: initiationData.poDate || '',
          po_description: initiationData.itemDescription || initiationData.poDescription || '',
          po_qty: initiationData.poQty || 0,
          po_unit: initiationData.poUnit || 'Nos.',
          vendor_name: initiationData.vendorName || '',
          contractor: initiationData.vendorName || '',
          manufacturer: manufacturer,
          place_of_inspection: initiationData.placeOfInspection || call?.place_of_inspection || '',
          amendment_no: initiationData.amendmentNo || 'N/A',
          amendment_date: initiationData.amendmentDate || 'N/A',
          consignee: initiationData.consignee || '',
          delivery_date: initiationData.deliveryDate || '',
          purchasing_authority: initiationData.purchasingAuthority || '',
          bpo: initiationData.billPayingOfficer || ''
        };
        setFetchedPoData(poData);

        // Set call data
        setFetchedCallData({
          inspectionCallNo: call.call_no,
          shiftOfInspection: 'Day Shift',
          dateOfInspection: new Date().toISOString().split('T')[0]
        });

        // Set mock production lines if not already set
        // Check sessionStorage first to avoid overwriting user's added lines
        const savedLines = sessionStorage.getItem('processProductionLinesData');
        let shouldSetProductionLines = true;

        if (savedLines) {
          try {
            const parsed = JSON.parse(savedLines);
            if (parsed && parsed.length > 0) {
              // Data already exists in sessionStorage, don't overwrite
              shouldSetProductionLines = false;
            }
          } catch (e) {
            console.log('Error parsing saved production lines:', e);
          }
        }

        if (shouldSetProductionLines) {
          if (initialProductionLines && initialProductionLines.length > 0) {
            // Use provided production lines from wrapper
            setLocalProductionLines(initialProductionLines);
          } else if (availableCalls.length > 1) {
            // Multi-call mode (more than 1 call): create empty rows for each available call
            // All dropdowns start empty, user must select manually
            setLocalProductionLines(availableCalls.map((_, idx) => ({
              lineNumber: idx + 1,
              icNumber: '',
              poNumber: '',
              rawMaterialICs: '',
              productType: ''
            })));
          } else {
            // Single call mode or no calls: create one empty production line
            // Dropdown starts empty with "Select Call Number" placeholder
            // User must manually select the call number to fetch data
            setLocalProductionLines([{
              lineNumber: 1,
              icNumber: '',
              poNumber: '',
              rawMaterialICs: '',
              productType: ''
            }]);
          }
        }

        // Mark as fetched to prevent duplicate calls
        hasFetchedRef.current = true;
      } catch (error) {
        console.error('⚠️ [Process Dashboard] Error fetching inspection data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInspectionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.call_no, call?.po_no, availableCalls, callInitiationDataCache]);

  // Auto-fetch data for production lines that have call numbers but missing RM IC or product type
  useEffect(() => {
    const fetchMissingData = async () => {
      // Track which lines need data fetching
      const linesToFetch = [];

      for (let i = 0; i < localProductionLines.length; i++) {
        const line = localProductionLines[i];

        // If line has a call number but missing RM IC or product type, mark for fetching
        if (line.icNumber && (!line.rawMaterialICs || !line.productType)) {
          linesToFetch.push({ index: i, callNo: line.icNumber });
        }
      }

      // If no lines need fetching, exit early
      if (linesToFetch.length === 0) {
        return;
      }

      console.log(`🔄 Auto-fetching data for ${linesToFetch.length} production line(s)`);

      // Fetch data for all lines that need it (batched parallel fetch)
      try {
        const uniqueUncached = [...new Set(linesToFetch
          .filter(({ callNo }) => !callInitiationDataCache[callNo])
          .map(({ callNo }) => callNo))];

        const newCacheUpdates = {};

        if (uniqueUncached.length > 0) {
          console.log(`📤 Fetching API data in parallel for ${uniqueUncached.length} unique call(s)`);
          const promises = uniqueUncached.map(callNo =>
            fetchProcessInitiationData(callNo)
              .then(data => ({ callNo, data }))
              .catch(err => ({ callNo, err }))
          );

          const results = await Promise.all(promises);
          results.forEach(res => {
            if (res && res.data) {
              newCacheUpdates[res.callNo] = res.data;
              console.log(`✅ API Response for ${res.callNo}:`, res.data);
            } else {
              console.warn(`⚠️ Failed to fetch data for ${res.callNo}:`, res.err || 'unknown error');
            }
          });

          if (Object.keys(newCacheUpdates).length > 0) {
            setCallInitiationDataCache(prev => ({ ...prev, ...newCacheUpdates }));
          }
        }

        // Update all lines using cached data (existing or newly fetched)
        setLocalProductionLines(prev => {
          const updated = [...prev];
          linesToFetch.forEach(({ index, callNo }) => {
            const data = callInitiationDataCache[callNo] || newCacheUpdates[callNo] || null;
            if (data) {
              if (!updated[index].rawMaterialICs || !updated[index].productType) {
                updated[index] = {
                  ...updated[index],
                  rawMaterialICs: data.rmIcNumber || '',
                  productType: data.typeOfErc || '',
                  poNumber: data.poNo || updated[index].poNumber
                };
                console.log(`✅ Updated line ${index + 1}:`, updated[index]);
              }
            }
          });
          return updated;
        });
      } catch (err) {
        console.error('❌ [Process Dashboard] Error during parallel initiation data fetch:', err);
      }
    };

    // Only run if we have production lines and not currently loading
    // Also check if any line has a call number selected (don't run on initial empty state)
    const hasCallNumbers = localProductionLines.some(line => line.icNumber);
    if (!isLoading && localProductionLines.length > 0 && hasCallNumbers) {
      fetchMissingData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localProductionLines.length, isLoading, localProductionLines.map(l => l.icNumber).join(',')]); // Trigger when lines are added, loading completes, or call numbers change

  // Selected line tab - persisted in sessionStorage
  const [selectedLine, setSelectedLine] = useState(() => {
    return sessionStorage.getItem('processSelectedLineTab') || 'Line-1';
  });

  // Track selected lot number for the toggle tab display
  const [selectedLotForDisplay, setSelectedLotForDisplay] = useState(() => {
    return sessionStorage.getItem('selectedLotForBreakup') || null;
  });

  // Track selected lot number for each production line
  // This is the lot that the IE selected in the 8-hour grid for that line
  // Note: Currently not used but kept for future enhancement
  // const [selectedLotByLine, setSelectedLotByLine] = useState({});

  // Persist selected line tab
  useEffect(() => {
    sessionStorage.setItem('processSelectedLineTab', selectedLine);
  }, [selectedLine]);

  // Persist selected lot for display
  useEffect(() => {
    if (selectedLotForDisplay) {
      sessionStorage.setItem('selectedLotForBreakup', selectedLotForDisplay);
    }
  }, [selectedLotForDisplay]);

  // Listen for lot selection events from toggle tab buttons
  useEffect(() => {
    const handleLotSelected = (event) => {
      console.log('📋 [Lot Selection] Lot selected:', event.detail.lot);
      setSelectedLotForDisplay(event.detail.lot);
    };

    window.addEventListener('lotSelected', handleLotSelected);
    return () => {
      window.removeEventListener('lotSelected', handleLotSelected);
    };
  }, []);

  // Lot data is now auto-fetched from the call's rm_heat_tc_mapping (read-only)

  // (removed) refresh trigger for recalculating rejected quantities — unused

  // Final Inspection Results - Remarks (manual entry, required)
  const [finalInspectionRemarks, setFinalInspectionRemarks] = useState(() => {
    return sessionStorage.getItem('processFinalInspectionRemarks') || '';
  });
  // App-level notification state
  const [notification, setNotification] = useState({ type: '', message: '', autoClose: true });
  const [isSaving, setIsSaving] = useState(false);

  // Save Draft state
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaveMessage, setDraftSaveMessage] = useState({ type: '', text: '' });
  const draftMessageTimeoutRef = useRef(null);

  // Withheld modal state
  const [showWithheldModal, setShowWithheldModal] = useState(false);
  const [withheldReason, setWithheldReason] = useState('');
  const [withheldRemarks, setWithheldRemarks] = useState('');
  const [withheldError, setWithheldError] = useState('');

  // Persist final inspection remarks
  useEffect(() => {
    sessionStorage.setItem('processFinalInspectionRemarks', finalInspectionRemarks);
  }, [finalInspectionRemarks]);

  // Derive manufacturing lines from production lines table (moved up for use in callbacks)
  const manufacturingLines = useMemo(() => {
    return localProductionLines.length > 0
      ? localProductionLines.map((_, idx) => `Line-${idx + 1}`)
      : ['Line-1'];
  }, [localProductionLines]);

  // Clear all process inspection data (called on Finish or Withheld Inspection)
  const clearProcessInspectionData = useCallback(() => {
    sessionStorage.removeItem('processProductionLinesData');
    sessionStorage.removeItem('processSelectedLineTab');
    sessionStorage.removeItem('processFinalInspectionRemarks');
    sessionStorage.removeItem('additionalInitiatedCalls');

    // Clear dashboard draft from localStorage
    const inspectionCallNo = call?.call_no || '';
    if (inspectionCallNo) {
      localStorage.removeItem(`${DASHBOARD_DRAFT_KEY}${inspectionCallNo}`);
    }

    // Clear process submodule data from sessionStorage for all lines
    manufacturingLines.forEach(line => {
      localProductionLines.forEach((prodLine) => {
        const poNo = prodLine.po_no || prodLine.poNumber || '';
        if (poNo) {
          clearAllProcessData(inspectionCallNo, poNo, line);
        }
      });
    });
  }, [call?.call_no, manufacturingLines, localProductionLines]);

  /**
   * Handle Save Draft - Save all dashboard data to localStorage
   */
  const handleSaveDraft = useCallback(() => {
    const inspectionCallNo = call?.call_no;
    if (!inspectionCallNo) {
      setDraftSaveMessage({ type: 'error', text: 'Cannot save draft: No inspection call number found' });
      return;
    }

    setIsSavingDraft(true);

    // Clear any existing timeout
    if (draftMessageTimeoutRef.current) {
      clearTimeout(draftMessageTimeoutRef.current);
    }

    try {
      // Collect all dashboard form data
      const draftData = {
        savedAt: new Date().toISOString(),
        productionLines: localProductionLines,
        selectedLine: selectedLine,
        finalInspectionRemarks: finalInspectionRemarks,
        productionLinesExpanded: productionLinesExpanded
      };

      // Save to localStorage with inspection call number as key
      const storageKey = `${DASHBOARD_DRAFT_KEY}${inspectionCallNo}`;
      localStorage.setItem(storageKey, JSON.stringify(draftData));

      // Show success message
      setDraftSaveMessage({ type: 'success', text: `Draft saved successfully at ${new Date().toLocaleTimeString()}` });

      // Clear message after 3 seconds
      draftMessageTimeoutRef.current = setTimeout(() => {
        setDraftSaveMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error saving draft:', error);
      setDraftSaveMessage({ type: 'error', text: `Failed to save draft: ${error.message}` });

      // Clear error message after 5 seconds
      draftMessageTimeoutRef.current = setTimeout(() => {
        setDraftSaveMessage({ type: '', text: '' });
      }, 5000);
    } finally {
      setIsSavingDraft(false);
    }
  }, [call?.call_no, localProductionLines, selectedLine, finalInspectionRemarks, productionLinesExpanded]);

  // Load draft data from localStorage on mount
  useEffect(() => {
    const inspectionCallNo = call?.call_no;
    if (!inspectionCallNo) return;

    try {
      const storageKey = `${DASHBOARD_DRAFT_KEY}${inspectionCallNo}`;
      const savedDraft = localStorage.getItem(storageKey);

      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);

        // Restore production lines if they exist in draft
        if (draftData.productionLines && draftData.productionLines.length > 0) {
          // Only restore if current state is empty or default
          const hasEmptyLines = localProductionLines.every(line => !line.icNumber);
          if (hasEmptyLines) {
            setLocalProductionLines(draftData.productionLines);
          }
        }

        // Restore selected line
        if (draftData.selectedLine) {
          setSelectedLine(draftData.selectedLine);
        }

        // Restore remarks if empty
        if (draftData.finalInspectionRemarks && !finalInspectionRemarks) {
          setFinalInspectionRemarks(draftData.finalInspectionRemarks);
        }

        // Restore expanded state
        if (typeof draftData.productionLinesExpanded === 'boolean') {
          setProductionLinesExpanded(draftData.productionLinesExpanded);
        }

        console.log('Draft data restored from localStorage:', draftData.savedAt);
      }
    } catch (error) {
      console.error('Error loading draft data:', error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.call_no]); // Only run on mount and when call changes

  // Note: handleShiftCompleted was removed as it's not currently used in the UI

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (draftMessageTimeoutRef.current) {
        clearTimeout(draftMessageTimeoutRef.current);
      }
    };
  }, []);

  const showNotification = (type, message, autoClose = true) => {
    setNotification({ type, message, autoClose });
    if (autoClose) {
      setTimeout(() => setNotification({ type: '', message: '', autoClose: true }), 4000);
    }
  };

  /**
   * Handle Finish Inspection - collect all submodule data from localStorage and save to backend
   */
  const handleFinishInspection = useCallback(async () => {
    const inspectionCallNo = call?.call_no;
    if (!inspectionCallNo) {
      showNotification('error', 'No inspection call number found');
      return;
    }

    // Proceed without browser confirmation; show an inline notification instead
    showNotification('info', 'Finishing inspection - saving data to the database...', false);
    setIsSaving(true);
    try {
      // Get logged in user
      const user = getStoredUser();
      const userId = user?.userId || user?.username || 'SYSTEM';

      // Ask submodules to persist any in-memory data to localStorage before building payload
      try {
        window.dispatchEvent(new Event('process:saveDraft'));
        // Give submodules a short moment to flush to localStorage
        await new Promise((res) => setTimeout(res, 300));
      } catch (e) {
        console.warn('Could not dispatch saveDraft event', e);
      }

      // Collect all submodule data from localStorage for all lines
      const allLinesData = [];

      console.log('🔍 [Finish] Manufacturing lines:', manufacturingLines);
      console.log('🔍 [Finish] Local production lines:', localProductionLines);

      // Define required submodules that must have data before finishing
      const requiredSubmodules = [
        { key: 'shearingData', label: 'Shearing' },
        { key: 'turningData', label: 'Turning' },
        { key: 'mpiData', label: 'MPI' },
        { key: 'forgingData', label: 'Forging' },
        { key: 'quenchingData', label: 'Quenching' },
        { key: 'temperingData', label: 'Tempering' },
        { key: 'finalCheckData', label: 'Final Check' }
      ];

      // Track missing entries to show a consolidated alert
      const missingEntries = [];

      manufacturingLines.forEach((line, lineIdx) => {
        const prodLine = localProductionLines[lineIdx];
        if (!prodLine) {
          console.warn(`⚠️ [Finish] No production line found at index ${lineIdx} for ${line}`);
          return;
        }

        // Check both possible field names for PO number
        const poNo = prodLine.po_no || prodLine.poNumber || '';
        if (!poNo) {
          console.warn(`⚠️ [Finish] No PO number found for ${line}. Production line:`, prodLine);
          missingEntries.push({ line, poNo, missing: ['PO Number'] });
          return;
        }

        console.log(`📦 [Finish] Collecting data for ${line}, PO: ${poNo}`);

        // Get all process data from localStorage
        const lineData = getAllProcessData(inspectionCallNo, poNo, line);

        console.log(`📦 [Finish] Data collected for ${line}:`, Object.keys(lineData));

        // Validate required submodules are present and non-empty
        const missingForLine = [];
        requiredSubmodules.forEach((mod) => {
          if (!lineData || !lineData.hasOwnProperty(mod.key) || (Array.isArray(lineData[mod.key]) && lineData[mod.key].length === 0)) {
            missingForLine.push(mod.label);
          }
        });

        // Note: Static Periodic Check is now optional - not required to finish inspection

        // Check manufactured quantities / final result (saved as `lineFinalResult`)
        const finalRes = lineData && lineData.lineFinalResult ? lineData.lineFinalResult : null;
        const hasManufactured = finalRes && (
          (finalRes.totalManufactured && finalRes.totalManufactured > 0) ||
          (finalRes.shearingManufactured && finalRes.shearingManufactured > 0) ||
          (finalRes.turningManufactured && finalRes.turningManufactured > 0) ||
          (finalRes.mpiManufactured && finalRes.mpiManufactured > 0) ||
          (finalRes.forgingManufactured && finalRes.forgingManufactured > 0) ||
          (finalRes.quenchingManufactured && finalRes.quenchingManufactured > 0) ||
          (finalRes.temperingManufactured && finalRes.temperingManufactured > 0)
        );
        if (!hasManufactured) {
          missingForLine.push('Manufactured quantities');
        }

        if (missingForLine.length > 0) {
          missingEntries.push({ line, poNo, missing: missingForLine });
        }

        if (Object.keys(lineData).length > 0) {
          allLinesData.push({
            inspectionCallNo,
            poNo,
            lineNo: line,
            ...lineData
          });
        } else {
          console.warn(`⚠️ [Finish] No data found in localStorage for ${line}, PO: ${poNo}`);
        }
      });

      // If any missing entries, alert user and abort finish
      if (missingEntries.length > 0) {
        const messages = missingEntries.map(e => `${e.line} (PO: ${e.poNo || 'N/A'}): ${e.missing.join(', ')}`);
        showNotification('error', `Please complete the following submodules before finishing inspection:\n\n${messages.join('\n')}`);
        setIsSaving(false);
        return;
      }

      console.log('📦 [Finish] Total lines with data:', allLinesData.length);

      // Step 1: Trigger workflow API for Finish Inspection
      console.log('🔄 [Finish Inspection] Triggering workflow API...');

      const workflowActionData = {
        workflowTransitionId: call.workflowTransitionId || call.id,
        requestId: inspectionCallNo,
        action: 'INSPECTION_COMPLETE_CONFIRM',
        remarks: `Process inspection completed. ${finalInspectionRemarks || ''}`,
        actionBy: userId,
        pincode: call.pincode || '560001'
      };

      console.log('🔄 [Finish Inspection] Workflow Action Data:', workflowActionData);

      try {
        await performTransitionAction(workflowActionData);
        console.log('✅ [Finish Inspection] Workflow transition successful');
      } catch (workflowError) {
        console.error('❌ [Finish Inspection] Workflow API error:', workflowError);
        throw workflowError;
      }

      // Clear ALL data for the entire inspection call (all lines)
      console.log('🔄 [Finish Inspection] Clearing all data for inspection call:', inspectionCallNo);

      // Clear data for all lines
      localProductionLines.forEach((prodLine) => {
        const poNo = prodLine.po_no || prodLine.poNumber || '';
        if (poNo) {
          // Clear data for each line
          for (let lineNum = 1; lineNum <= localProductionLines.length; lineNum++) {
            const lineNo = `Line-${lineNum}`;
            clearAllProcessData(inspectionCallNo, poNo, lineNo);
          }
        }
      });

      // Clear the draft for this call
      localStorage.removeItem(`${DASHBOARD_DRAFT_KEY}${inspectionCallNo}`);

      // Clear all production lines data from sessionStorage
      sessionStorage.removeItem('processProductionLinesData');
      sessionStorage.removeItem('processSelectedLineTab');

      console.log('✅ [Finish Inspection] All data cleared. Returning to landing page.');

      // Always return to landing page - inspection call is completely closed
      showNotification('success', 'Inspection call completed successfully! All lines closed.');
      onBack();
    } catch (error) {
      console.error('Error finishing inspection:', error);
      showNotification('error', `Failed to save inspection data: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [call?.call_no, call?.id, call?.pincode, call?.workflowTransitionId, manufacturingLines, localProductionLines, finalInspectionRemarks, onBack]);

  // Pause Inspection - saves data without changing status
  const handlePauseInspection = useCallback(async () => {
    const inspectionCallNo = call?.call_no;
    if (!inspectionCallNo) {
      showNotification('error', 'No inspection call number found');
      return;
    }

    if (!window.confirm('Are you sure you want to pause this inspection? All data will be saved to the database.')) {
      return;
    }

    setIsSaving(true);
    try {
      // Get logged in user
      const user = getStoredUser();
      const userId = user?.userId || user?.username || 'SYSTEM';

      // Collect all submodule data from localStorage for all lines
      const allLinesData = [];

      console.log('🔍 [Pause] Manufacturing lines:', manufacturingLines);
      console.log('🔍 [Pause] Local production lines:', localProductionLines);

      manufacturingLines.forEach((line, lineIdx) => {
        const prodLine = localProductionLines[lineIdx];
        if (!prodLine) {
          console.warn(`⚠️ [Pause] No production line found at index ${lineIdx} for ${line}`);
          return;
        }

        // Check both possible field names for PO number
        const poNo = prodLine.po_no || prodLine.poNumber || '';
        if (!poNo) {
          console.warn(`⚠️ [Pause] No PO number found for ${line}. Production line:`, prodLine);
          return;
        }

        console.log(`📦 [Pause] Collecting data for ${line}, PO: ${poNo}`);

        // Get all process data from localStorage
        const lineData = getAllProcessData(inspectionCallNo, poNo, line);

        console.log(`📦 [Pause] Data collected for ${line}:`, Object.keys(lineData));

        if (Object.keys(lineData).length > 0) {
          allLinesData.push({
            inspectionCallNo,
            poNo,
            lineNo: line,
            ...lineData
          });
        } else {
          console.warn(`⚠️ [Pause] No data found in localStorage for ${line}, PO: ${poNo}`);
        }
      });

      console.log('📦 [Pause] Total lines with data:', allLinesData.length);

      // Build payload for backend
      const payload = {
        inspectionCallNo,
        remarks: finalInspectionRemarks,
        linesData: allLinesData
      };

      console.log('Pause Process Inspection Payload:', JSON.stringify(payload, null, 2));

      // Call the backend API with userId
      await pauseProcessInspection(payload, userId);

      // Mark as paused in workflow
      await markAsPaused(call?.call_no, 'Inspection paused by inspector');

      // Clear localStorage after successful save
      clearProcessInspectionData();

      showNotification('success', 'Process Material Inspection paused successfully!');
      onBack();
    } catch (error) {
      console.error('Error pausing inspection:', error);
      showNotification('error', `Failed to pause inspection: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [call?.call_no, manufacturingLines, localProductionLines, finalInspectionRemarks, clearProcessInspectionData, onBack]);

  // Withheld modal handlers
  const handleOpenWithheldModal = () => {
    setWithheldReason('');
    setWithheldRemarks('');
    setWithheldError('');
    setShowWithheldModal(true);
  };

  const handleCloseWithheldModal = () => {
    setShowWithheldModal(false);
    setWithheldReason('');
    setWithheldRemarks('');
    setWithheldError('');
  };

  const handleSubmitWithheld = async () => {
    if (!withheldReason) {
      setWithheldError('Please select a reason');
      return;
    }
    if (withheldReason === 'ANY_OTHER' && !withheldRemarks.trim()) {
      setWithheldError('Please provide remarks for "Any other" reason');
      return;
    }

    setIsSaving(true);
    try {
      const actionData = {
        inspectionRequestId: call?.api_id || null,
        callNo: call?.call_no,
        poNo: call?.po_no,
        actionType: 'WITHHELD',
        reason: withheldReason,
        remarks: withheldRemarks.trim(),
        status: 'WITHHELD',
        actionDate: new Date().toISOString()
      };

      // Process Material: Save to localStorage only (no API call)
      console.log('🏭 Process Material: Withheld saved to localStorage only (no API call)');
      console.log('Withheld Data:', actionData);

      // Mark call as withheld in local storage
      markAsWithheld(call?.call_no, withheldRemarks.trim());

      // Clear all inspection data
      clearProcessInspectionData();

      showNotification('success', 'Inspection has been withheld successfully');
      handleCloseWithheldModal();
      onBack();
    } catch (error) {
      console.error('Error withholding inspection:', error);
      setWithheldError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quantity Summary state - fetched from API
  const [quantitySummary, setQuantitySummary] = useState({
    rawMaterialAccepted: 0,
    processManufacturedFromApi: 0,
    processInspectionAcceptedFromApi: 0
  });

  // Fetch quantity summary from API when component mounts or call changes
  useEffect(() => {
    const fetchQuantitySummary = async () => {
      try {
        if (!call?.call_no) {
          console.log('⚠️ No inspection call number found');
          return;
        }

        console.log('📊 Fetching quantity summary for call:', call.call_no);
        const data = await getQuantitySummary(call.call_no);

        if (data) {
          console.log('✅ Quantity Summary API Response:', data);
          setQuantitySummary({
            rawMaterialAccepted: data.totalOfferedQty || 0,
            processManufacturedFromApi: data.totalManufactureQty || 0,
            processInspectionAcceptedFromApi: data.acceptedQty || 0
          });
        }
      } catch (error) {
        console.error('❌ Error fetching quantity summary:', error);
        // Set default values if API fails
        setQuantitySummary({
          rawMaterialAccepted: 0,
          processManufacturedFromApi: 0,
          processInspectionAcceptedFromApi: 0
        });
      }
    };

    fetchQuantitySummary();
  }, [call?.call_no]);

  // Use API data for raw material accepted, fallback to 0
  const rawMaterialAccepted = quantitySummary.rawMaterialAccepted;
  // const poOrderedQty = 450; // Qty Ordered in PO - Not currently used

  // Manual entry state for "Manufactured" column - PER LINE PER LOT (keyed by [line][lot])
  // Initialize as empty - will be populated by useEffect after callInitiationDataCache is available
  const [manufacturedQtyByLine, setManufacturedQtyByLine] = useState({});

  // Load manufactured quantities from localStorage for all lines and lots
  useEffect(() => {
    if (!callInitiationDataCache || Object.keys(callInitiationDataCache).length === 0) {
      return; // Wait for cache to be populated
    }

    try {
      const allMfgQty = {};
      localProductionLines.forEach((prodLine, lineIndex) => {
        const lineNo = `Line-${lineIndex + 1}`;
        const poNo = prodLine.poNumber || prodLine.po_no || call?.po_no || '';
        const inspectionCallNo = call?.call_no || '';

        if (inspectionCallNo && poNo) {
          // Initialize line object if not exists
          if (!allMfgQty[lineNo]) {
            allMfgQty[lineNo] = {};
          }

          // Get all lots for this line from the initiation data
          const initiationData = callInitiationDataCache[prodLine.icNumber];
          const lotsForThisLine = initiationData?.lotDetailsList?.map(lot => lot.lotNumber) || [];

          // Load manufactured quantities for each lot in this line
          lotsForThisLine.forEach(lotNo => {
            const lineFinalResult = loadFromLocalStorage('lineFinalResult', inspectionCallNo, poNo, lineNo, lotNo);
            if (lineFinalResult) {
              // Store manufactured quantities per lot
              allMfgQty[lineNo][lotNo] = {
                shearing: lineFinalResult.shearingManufactured ? String(lineFinalResult.shearingManufactured) : '',
                turning: lineFinalResult.turningManufactured ? String(lineFinalResult.turningManufactured) : '',
                mpiTesting: lineFinalResult.mpiManufactured ? String(lineFinalResult.mpiManufactured) : '',
                forging: lineFinalResult.forgingManufactured ? String(lineFinalResult.forgingManufactured) : '',
                quenching: lineFinalResult.quenchingManufactured ? String(lineFinalResult.quenchingManufactured) : '',
                tempering: lineFinalResult.temperingManufactured ? String(lineFinalResult.temperingManufactured) : ''
              };
              console.log(`📋 [Load] Loaded manufactured quantities for ${lineNo}, Lot ${lotNo}:`, allMfgQty[lineNo][lotNo]);
            }
          });
        }
      });

      if (Object.keys(allMfgQty).length > 0) {
        setManufacturedQtyByLine(allMfgQty);
      }
    } catch (error) {
      console.error('❌ [Load] Error loading manufactured quantities:', error);
    }
  }, [callInitiationDataCache, localProductionLines, call?.call_no, call?.po_no]);

  // Get the selected lot for the current line from the 8-hour grid data (returns first lot only)
  // MUST be defined before manufacturedQty useMemo that uses it
  const getSelectedLotForCurrentLine = useCallback(() => {
    try {
      const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;
      const prodLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};
      const poNo = prodLine.poNumber || prodLine.po_no || call?.po_no || '';
      const inspectionCallNo = call?.call_no || '';

      console.log('📋 [Selected Lot] Getting lot for:', { selectedLine, poNo, inspectionCallNo });

      // Get all process data from localStorage
      const allData = getAllProcessData(inspectionCallNo, poNo, selectedLine);
      console.log('📋 [Selected Lot] All data from localStorage:', allData);

      // Check shearing data first (most common starting point)
      // Note: getAllProcessData returns keys like 'shearingData', 'turningData', etc.
      if (allData?.shearingData && Array.isArray(allData.shearingData)) {
        console.log('📋 [Selected Lot] Shearing data:', allData.shearingData);
        // Find the first non-empty lot number from the grid data
        for (const hourData of allData.shearingData) {
          console.log('📋 [Selected Lot] Checking hour data:', hourData);
          if (hourData.lotNo && hourData.lotNo.trim()) {
            console.log('📋 [Selected Lot] Found selected lot from shearing data:', hourData.lotNo);
            return hourData.lotNo;
          }
        }
      }

      // Fallback to other modules if shearing doesn't have lot data
      const modules = ['turningData', 'mpiData', 'forgingData', 'quenchingData', 'temperingData', 'finalCheckData'];
      for (const moduleName of modules) {
        if (allData?.[moduleName] && Array.isArray(allData[moduleName])) {
          console.log(`📋 [Selected Lot] Checking ${moduleName} data:`, allData[moduleName]);
          for (const hourData of allData[moduleName]) {
            if (hourData.lotNo && hourData.lotNo.trim()) {
              console.log(`📋 [Selected Lot] Found selected lot from ${moduleName} data:`, hourData.lotNo);
              return hourData.lotNo;
            }
          }
        }
      }

      console.log('⚠️ [Selected Lot] No lot selected in 8-hour grid for current line');
      return null;
    } catch (error) {
      console.error('❌ [Selected Lot] Error getting selected lot:', error);
      return null;
    }
  }, [call?.call_no, call?.po_no, selectedLine, localProductionLines]);

  // Get manufactured qty for current line and selected lot
  const manufacturedQty = useMemo(() => {
    // Use selectedLotForDisplay if available, otherwise get the first lot
    let lotNo = selectedLotForDisplay;
    if (!lotNo) {
      lotNo = getSelectedLotForCurrentLine();
    }

    return (manufacturedQtyByLine[selectedLine] && manufacturedQtyByLine[selectedLine][lotNo]) || {
      shearing: '',
      turning: '',
      mpiTesting: '',
      forging: '',
      quenching: '',
      tempering: ''
    };
  }, [manufacturedQtyByLine, selectedLine, selectedLotForDisplay, getSelectedLotForCurrentLine]);

  // Helper function to validate manufactured quantity against rejected quantity (on blur)
  const handleManufacturedBlur = (field, value, rejectedValue) => {
    const numValue = parseInt(value) || 0;
    const numRejected = rejectedValue || 0;

    // If user enters a value less than rejected, show alert and clear the field
    if (value !== '' && numValue < numRejected) {
      showNotification('error', `Manufactured quantity (${numValue}) cannot be less than rejected quantity (${numRejected})`);
      setManufacturedQtyByLine(prev => ({
        ...prev,
        [selectedLine]: { ...prev[selectedLine], [field]: '' }
      }));
    }
  };

  // Get ALL selected lots from the 8-hour grid data (across all sections)
  const getAllSelectedLotsForCurrentLine = useCallback(() => {
    try {
      const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;
      const prodLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};
      const poNo = prodLine.poNumber || prodLine.po_no || call?.po_no || '';
      const inspectionCallNo = call?.call_no || '';

      console.log('📋 [All Selected Lots] Getting all lots for:', { selectedLine, poNo, inspectionCallNo });

      // Get all process data from localStorage
      const allData = getAllProcessData(inspectionCallNo, poNo, selectedLine);
      console.log('📋 [All Selected Lots] All data from localStorage:', allData);

      // Collect all unique lot numbers from all modules
      const lotsSet = new Set();
      const modules = ['shearingData', 'turningData', 'mpiData', 'forgingData', 'quenchingData', 'temperingData', 'finalCheckData'];

      modules.forEach((moduleName) => {
        if (allData?.[moduleName] && Array.isArray(allData[moduleName])) {
          console.log(`📋 [All Selected Lots] Checking ${moduleName} data:`, allData[moduleName]);
          allData[moduleName].forEach((hourData) => {
            if (hourData.lotNo && hourData.lotNo.trim()) {
              lotsSet.add(hourData.lotNo);
              console.log(`📋 [All Selected Lots] Found lot from ${moduleName}:`, hourData.lotNo);
            }
          });
        }
      });

      const allLots = Array.from(lotsSet).sort();
      console.log('✅ [All Selected Lots] All unique lots found:', allLots);
      return allLots;
    } catch (error) {
      console.error('❌ [All Selected Lots] Error getting all selected lots:', error);
      return [];
    }
  }, [call?.call_no, call?.po_no, selectedLine, localProductionLines]);

  // Get selected lots from a SPECIFIC section/module only
  const getSelectedLotsForModule = useCallback((moduleName) => {
    try {
      const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;
      const prodLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};
      const poNo = prodLine.poNumber || prodLine.po_no || call?.po_no || '';
      const inspectionCallNo = call?.call_no || '';

      console.log(`📋 [Module Lots] Getting lots for module ${moduleName}:`, { selectedLine, poNo, inspectionCallNo });

      // Get all process data from localStorage
      const allData = getAllProcessData(inspectionCallNo, poNo, selectedLine);

      // Collect unique lot numbers from ONLY this specific module
      const lotsSet = new Set();
      if (allData?.[moduleName] && Array.isArray(allData[moduleName])) {
        console.log(`📋 [Module Lots] Checking ${moduleName} data:`, allData[moduleName]);
        allData[moduleName].forEach((hourData) => {
          if (hourData.lotNo && hourData.lotNo.trim()) {
            lotsSet.add(hourData.lotNo);
            console.log(`📋 [Module Lots] Found lot in ${moduleName}:`, hourData.lotNo);
          }
        });
      }

      const moduleLots = Array.from(lotsSet).sort();
      console.log(`✅ [Module Lots] Unique lots in ${moduleName}:`, moduleLots);
      return moduleLots;
    } catch (error) {
      console.error(`❌ [Module Lots] Error getting lots for ${moduleName}:`, error);
      return [];
    }
  }, [call?.call_no, call?.po_no, selectedLine, localProductionLines]);

  // Helper function to calculate rejected quantities for a SPECIFIC lot (used by both lot-wise and summary calculations)
  const calculateRejectedForSpecificLot = useCallback((submoduleName, specificLot, lineNo, rejectedField = null) => {
    const poNo = call?.po_no || '';
    const inspectionCallNo = call?.call_no || '';

    const allData = getAllProcessData(inspectionCallNo, poNo, lineNo);

    if (!allData || !allData[submoduleName]) {
      return 0;
    }

    const submoduleData = allData[submoduleName];
    let totalRejected = 0;

    // For 8-hour grid modules (shearing, turning, mpi, forging, quenching, tempering, finalCheck)
    if (Array.isArray(submoduleData)) {
      submoduleData.forEach((hourData) => {
        // Only count rejected quantities for the specific lot
        if (specificLot && hourData.lotNo !== specificLot) {
          return; // Skip this hour if it's for a different lot
        }

        // For Final Check section with specific rejected field
        if (rejectedField && hourData[rejectedField] !== undefined && hourData[rejectedField] !== null) {
          const num = parseInt(hourData[rejectedField]) || 0;
          totalRejected += num;
        }
        // For other sections with rejectedQty field
        else if (!rejectedField && hourData.rejectedQty !== undefined && hourData.rejectedQty !== null) {
          // Handle different rejected quantity formats
          if (Array.isArray(hourData.rejectedQty)) {
            // Sum all rejected quantities in array
            hourData.rejectedQty.forEach((qty) => {
              const num = parseInt(qty) || 0;
              totalRejected += num;
            });
          } else {
            // Single rejected quantity value
            const num = parseInt(hourData.rejectedQty) || 0;
            totalRejected += num;
          }
        }
        // Fallback: if no rejectedQty found, look for numbered rejected fields (rejectedQty1, rejectedQty2...)
        else if (!rejectedField) {
          Object.keys(hourData).forEach((key) => {
            const m = key.match(/^rejectedQty(\d+)$/i);
            if (m) {
              const num = parseInt(hourData[key]) || 0;
              totalRejected += num;
            }
          });
        }
      });
    }

    return totalRejected;
  }, [call?.call_no, call?.po_no]);

  // Get total rejected quantities for a SPECIFIC lot across ALL stages
  // Used by "Lot Wise Quantity Breakup" table to show lot-specific rejected quantities
  // Reads from the saved lineFinalResult which already has all rejected quantities calculated
  const getTotalRejectedForLot = useCallback((lotNo) => {
    const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;
    const prodLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};
    const poNo = prodLine.poNumber || prodLine.po_no || call?.po_no || '';
    const inspectionCallNo = call?.call_no || '';

    // Load the saved lineFinalResult for this lot
    const lineFinalResult = loadFromLocalStorage('lineFinalResult', inspectionCallNo, poNo, selectedLine, lotNo);

    if (!lineFinalResult) {
      console.log(`📦 [Lot Wise] No lineFinalResult found for ${lotNo}`);
      return 0;
    }

    // Sum all rejected quantities from the saved lineFinalResult
    const totalRejected = (lineFinalResult.shearingRejected || 0) +
                         (lineFinalResult.turningRejected || 0) +
                         (lineFinalResult.mpiRejected || 0) +
                         (lineFinalResult.forgingRejected || 0) +
                         (lineFinalResult.quenchingRejected || 0) +
                         (lineFinalResult.temperingRejected || 0) +
                         (lineFinalResult.visualCheckRejected || 0) +
                         (lineFinalResult.dimensionsCheckRejected || 0) +
                         (lineFinalResult.hardnessCheckRejected || 0);

    console.log(`📦 [Lot Wise] Total rejected for ${lotNo}:`, totalRejected, 'from lineFinalResult:', lineFinalResult);
    return totalRejected;
  }, [selectedLine, localProductionLines, call?.call_no, call?.po_no]);

  // Calculate rejected quantities from submodule localStorage data
  // Now filters by the selected lot number (from toggle tab or first lot if only one)
  const calculateRejectedFromSubmodule = useCallback((submoduleName, rejectedField = null) => {
    // Use selectedLotForDisplay if available (from toggle tab), otherwise get the first lot
    let selectedLot = selectedLotForDisplay;

    if (!selectedLot) {
      selectedLot = getSelectedLotForCurrentLine();
    }

    console.log(`📋 [${submoduleName}] Calculating rejected for selected lot:`, selectedLot);

    const totalRejected = calculateRejectedForSpecificLot(submoduleName, selectedLot, selectedLine, rejectedField);

    console.log(`📋 [${submoduleName}] Total rejected for selected lot (${selectedLot}):`, totalRejected);
    return totalRejected;
  }, [selectedLine, selectedLotForDisplay, getSelectedLotForCurrentLine, calculateRejectedForSpecificLot]);

  // Calculate rejected quantities for Final Check section
  // checkType: 'visual' | 'dimensions' | 'hardness'
  const calculateFinalCheckRejected = useCallback((checkType) => {
    const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;
    const prodLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};
    const poNo = prodLine.poNumber || prodLine.po_no || call?.po_no || '';
    const inspectionCallNo = call?.call_no || '';

    const allData = getAllProcessData(inspectionCallNo, poNo, selectedLine);

    if (!allData || !allData.finalCheckData) {
      return 0;
    }

    // Use selectedLotForDisplay if available (from toggle tab), otherwise get the first lot
    let selectedLot = selectedLotForDisplay;
    if (!selectedLot) {
      selectedLot = getSelectedLotForCurrentLine();
    }
    console.log(`📋 [Final Check] Calculating ${checkType} rejected for selected lot:`, selectedLot);

    const finalCheckData = allData.finalCheckData;
    let totalRejected = 0;

    // Define which fields to sum for each check type
    const fieldMap = {
      visual: ['surfaceDefectRejected', 'embossingDefectRejected', 'markingRejected'],
      dimensions: ['boxGaugeRejected', 'flatBearingAreaRejected', 'fallingGaugeRejected'],
      hardness: ['temperingHardnessRejected']
    };

    const fieldsToSum = fieldMap[checkType] || [];

    if (Array.isArray(finalCheckData)) {
      finalCheckData.forEach((hourData) => {
        // Only count rejected quantities for the selected lot
        if (selectedLot && hourData.lotNo !== selectedLot) {
          return; // Skip this hour if it's for a different lot
        }

        // Sum the specified fields for this check type
        fieldsToSum.forEach(field => {
          if (hourData[field] !== undefined && hourData[field] !== null) {
            const num = parseInt(hourData[field]) || 0;
            totalRejected += num;
          }
        });
      });
    }

    return totalRejected;
  }, [call?.call_no, call?.po_no, selectedLine, localProductionLines, selectedLotForDisplay, getSelectedLotForCurrentLine]);

  // Calculate rejected quantities for each section
  const rejectedQty = useMemo(() => {
    const visualCheckRejected = calculateFinalCheckRejected('visual'); // Surface Defect + Embossing Defect + Marking
    const dimensionsCheckRejected = calculateFinalCheckRejected('dimensions'); // Box Gauge + Flat Bearing Area + Falling Gauge
    const hardnessCheckRejected = calculateFinalCheckRejected('hardness'); // Tempering Hardness

    // Tempering rejected = sum of all Final Check rejected (Visual + Dimension + Hardness)
    const temperingRejected = visualCheckRejected + dimensionsCheckRejected + hardnessCheckRejected;

    // Testing & Finishing rejected = sum of all 4 rejection fields from testingFinishingData
    const testingFinishingRejected = calculateRejectedFromSubmodule('testingFinishingData', 'toeLoadRejected') +
                                     calculateRejectedFromSubmodule('testingFinishingData', 'weightRejected') +
                                     calculateRejectedFromSubmodule('testingFinishingData', 'paintIdentificationRejected') +
                                     calculateRejectedFromSubmodule('testingFinishingData', 'ercCoatingRejected');

    return {
      shearing: calculateRejectedFromSubmodule('shearingData'),
      turning: calculateRejectedFromSubmodule('turningData'),
      mpiTesting: calculateRejectedFromSubmodule('mpiData'),
      forging: calculateRejectedFromSubmodule('forgingData', 'forgingTemperatureRejected') +
               calculateRejectedFromSubmodule('forgingData', 'forgingStabilisationRejected') +
               calculateRejectedFromSubmodule('forgingData', 'improperForgingRejected') +
               calculateRejectedFromSubmodule('forgingData', 'forgingDefectRejected') +
               calculateRejectedFromSubmodule('forgingData', 'embossingDefectRejected'),
      quenching: calculateRejectedFromSubmodule('quenchingData', 'quenchingHardnessRejected') +
                 calculateRejectedFromSubmodule('quenchingData', 'boxGaugeRejected') +
                 calculateRejectedFromSubmodule('quenchingData', 'flatBearingAreaRejected') +
                 calculateRejectedFromSubmodule('quenchingData', 'fallingGaugeRejected'),
      tempering: temperingRejected, // Calculated from Final Check section
      visualCheck: visualCheckRejected,
      dimensionsCheck: dimensionsCheckRejected,
      hardnessCheck: hardnessCheckRejected,
      testingFinishing: testingFinishingRejected
    };
  }, [calculateRejectedFromSubmodule, calculateFinalCheckRejected]);

  // Calculate accepted quantities (Manufactured - Rejected)
  const acceptedQty = useMemo(() => {
    const calc = (manufactured, rejected) => {
      const mfg = parseInt(manufactured) || 0;
      const rej = rejected || 0;
      return mfg > 0 ? mfg - rej : 0;
    };

    return {
      shearing: calc(manufacturedQty.shearing, rejectedQty.shearing),
      turning: calc(manufacturedQty.turning, rejectedQty.turning),
      mpiTesting: calc(manufacturedQty.mpiTesting, rejectedQty.mpiTesting),
      forging: calc(manufacturedQty.forging, rejectedQty.forging),
      quenching: calc(manufacturedQty.quenching, rejectedQty.quenching),
      tempering: calc(manufacturedQty.tempering, rejectedQty.tempering),
      dimensionsCheck: 0, // Blank
      hardnessCheck: 0, // Blank
      visualCheck: 0 // Blank
    };
  }, [manufacturedQty, rejectedQty]);

  // Calculate totals from lot-wise breakup for Final Inspection Results display
  // Sum manufactured and accepted quantities from ALL lots in ALL lines
  // NOTE: This calculation is now commented out and replaced with API data
  // Keeping the logic for future reference or if needed to switch back
  /*
  const { processInspectionAccepted, processManufactured } = useMemo(() => {
    try {
      let totalManufactured = 0;
      let totalAccepted = 0;

      // Iterate through all production lines
      localProductionLines.forEach((prodLine, lineIndex) => {
        const lineNo = `Line-${lineIndex + 1}`;
        const poNo = prodLine.poNumber || prodLine.po_no || call?.po_no || '';
        const inspectionCallNo = call?.call_no || '';

        if (!inspectionCallNo || !poNo) {
          return;
        }

        // Get all process data for this line
        const allData = getAllProcessData(inspectionCallNo, poNo, lineNo);

        // Get all unique lots from shearing data for this line
        const lotsSet = new Set();
        if (allData?.shearingData && Array.isArray(allData.shearingData)) {
          allData.shearingData.forEach((hourData) => {
            if (hourData.lotNo && hourData.lotNo.trim()) {
              lotsSet.add(hourData.lotNo);
            }
          });
        }

        // For each lot in this line, calculate manufactured and accepted
        lotsSet.forEach((lot) => {
          // Get manufactured qty for this specific lot from the state (manually entered in stage-wise table)
          // IMPORTANT: Only use SHEARING manufactured quantity, not sum from all stages
          const lineMfgQtyByLot = (manufacturedQtyByLine[lineNo] && manufacturedQtyByLine[lineNo][lot]) || {};
          const lotManufactured = parseInt(lineMfgQtyByLot.shearing) || 0;

          console.log(`📦 [Final Results] Line ${lineIndex + 1}, Lot ${lot}: lineMfgQtyByLot=`, lineMfgQtyByLot, 'Shearing Manufactured=`, lotManufactured);

          // Calculate rejected for this lot from all modules (shearing, turning, mpi, forging, quenching, tempering)
          // Use the helper function to properly filter by lot
          let lotRejected = 0;
          const modules = ['shearingData', 'turningData', 'mpiData', 'forgingData', 'quenchingData', 'temperingData'];
          modules.forEach((moduleName) => {
            lotRejected += calculateRejectedForSpecificLot(moduleName, lot, lineNo);
          });

          // Calculate accepted for this lot (Manufactured - Total Rejected from all stages)
          const lotAccepted = Math.max(0, lotManufactured - lotRejected);

          totalManufactured += lotManufactured;
          totalAccepted += lotAccepted;

          console.log(`📦 [Final Results] Line ${lineIndex + 1}, Lot ${lot}: Manufactured=${lotManufactured}, Rejected=${lotRejected}, Accepted=${lotAccepted}`);
        });
      });

      console.log(`📊 [Final Results] TOTAL: Manufactured=${totalManufactured}, Accepted=${totalAccepted}`);

      return {
        processManufactured: totalManufactured,
        processInspectionAccepted: totalAccepted
      };
    } catch (error) {
      console.error('❌ [Final Results] Error:', error);
      return { processManufactured: 0, processInspectionAccepted: 0 };
    }
  }, [localProductionLines, call?.call_no, call?.po_no, manufacturedQtyByLine, calculateRejectedForSpecificLot]);
  */

  // Use API data for process manufactured and inspection accepted (read-only from API)
  const processManufactured = quantitySummary.processManufacturedFromApi;
  const processInspectionAccepted = quantitySummary.processInspectionAcceptedFromApi;



  // Save lineFinalResult to localStorage whenever stage-wise quantities change
  useEffect(() => {
    const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;
    const prodLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};
    const poNo = prodLine.poNumber || prodLine.po_no || call?.po_no || '';
    const inspectionCallNo = call?.call_no || '';

    if (!inspectionCallNo || !poNo) return;

    // Get the lot number - use selectedLotForDisplay if available, otherwise get the first lot
    let lotNumber = selectedLotForDisplay;
    if (!lotNumber) {
      lotNumber = getSelectedLotForCurrentLine();
    }

    // Get heat number from initiation data
    const initiationData = callInitiationDataCache[prodLine.icNumber];
    const heatNumber = initiationData?.heatNumber || null;

    // Calculate total manufactured (sum of all stage manufactured quantities)
    const totalManufactured = (parseInt(manufacturedQty.shearing) || 0) +
                              (parseInt(manufacturedQty.turning) || 0) +
                              (parseInt(manufacturedQty.mpiTesting) || 0) +
                              (parseInt(manufacturedQty.forging) || 0) +
                              (parseInt(manufacturedQty.quenching) || 0) +
                              (parseInt(manufacturedQty.tempering) || 0);

    // Build lineFinalResult object matching backend ProcessLineFinalResultDto
    const lineFinalResult = {
      inspectionCallNo,
      poNo,
      lineNo: selectedLine,
      lotNumber,
      heatNumber,
      // Total quantities
      totalManufactured: totalManufactured > 0 ? totalManufactured : null,
      totalAccepted: processInspectionAccepted || null,
      totalRejected: (rejectedQty.shearing || 0) + (rejectedQty.turning || 0) + (rejectedQty.mpiTesting || 0) +
                     (rejectedQty.forging || 0) + (rejectedQty.quenching || 0) + (rejectedQty.tempering || 0) || null,
      // Stage-wise quantities
      shearingManufactured: parseInt(manufacturedQty.shearing) || null,
      shearingAccepted: acceptedQty.shearing || null,
      shearingRejected: rejectedQty.shearing || null,
      turningManufactured: parseInt(manufacturedQty.turning) || null,
      turningAccepted: acceptedQty.turning || null,
      turningRejected: rejectedQty.turning || null,
      mpiManufactured: parseInt(manufacturedQty.mpiTesting) || null,
      mpiAccepted: acceptedQty.mpiTesting || null,
      mpiRejected: rejectedQty.mpiTesting || null,
      forgingManufactured: parseInt(manufacturedQty.forging) || null,
      forgingAccepted: acceptedQty.forging || null,
      forgingRejected: rejectedQty.forging || null,
      quenchingManufactured: parseInt(manufacturedQty.quenching) || null,
      quenchingAccepted: acceptedQty.quenching || null,
      quenchingRejected: rejectedQty.quenching || null,
      temperingManufactured: parseInt(manufacturedQty.tempering) || null,
      temperingAccepted: acceptedQty.tempering || null,
      temperingRejected: rejectedQty.tempering || null,
      // Final Check visual/dimension/hardness - from rejectedQty
      visualCheckRejected: rejectedQty.visualCheck || null,
      dimensionsCheckRejected: rejectedQty.dimensionsCheck || null,
      hardnessCheckRejected: rejectedQty.hardnessCheck || null,
      // Remarks
      remarks: finalInspectionRemarks || null
    };

    console.log(`💾 [Save] Saving lineFinalResult for ${selectedLine}, Lot ${lotNumber}:`, lineFinalResult);
    // Save with lot number as part of the key for per-lot storage
    saveToLocalStorage('lineFinalResult', inspectionCallNo, poNo, selectedLine, lineFinalResult, lotNumber);
  }, [manufacturedQty, acceptedQty, rejectedQty, selectedLine, selectedLotForDisplay, localProductionLines, call?.call_no, call?.po_no, processInspectionAccepted, finalInspectionRemarks, callInitiationDataCache, getSelectedLotForCurrentLine]);

  // Handle line change - updates selected line tab
  const handleLineChange = (line) => {
    setSelectedLine(line);
  };

  // Load line-specific data whenever call or selectedLine changes
  // This ensures data is loaded when returning from submodules
  useEffect(() => {
    const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;
    const prodLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};
    const poNo = prodLine.poNumber || prodLine.po_no || call?.po_no || '';
    const inspectionCallNo = call?.call_no || '';

    if (!inspectionCallNo || !poNo) {
      console.log(`📋 [Load Data] No call/PO data for ${selectedLine}, skipping load`);
      return;
    }

    console.log(`📋 [Load Data] Loading data for ${selectedLine} from localStorage`);

    // Load lineFinalResult from localStorage for this specific line
    const lineFinalResult = loadFromLocalStorage('lineFinalResult', inspectionCallNo, poNo, selectedLine);

    if (lineFinalResult) {
      console.log(`📋 [Load Data] Found saved data for ${selectedLine}:`, lineFinalResult);

      // Restore manufactured quantities from saved data - PER LOT
      const lotNo = lineFinalResult.lotNumber || 'default';
      const restoredMfg = {
        shearing: lineFinalResult.shearingManufactured ? String(lineFinalResult.shearingManufactured) : '',
        turning: lineFinalResult.turningManufactured ? String(lineFinalResult.turningManufactured) : '',
        mpiTesting: lineFinalResult.mpiManufactured ? String(lineFinalResult.mpiManufactured) : '',
        forging: lineFinalResult.forgingManufactured ? String(lineFinalResult.forgingManufactured) : '',
        quenching: lineFinalResult.quenchingManufactured ? String(lineFinalResult.quenchingManufactured) : '',
        tempering: lineFinalResult.temperingManufactured ? String(lineFinalResult.temperingManufactured) : ''
      };
      console.log(`📋 [Load Data] Restoring manufactured quantities for ${selectedLine}, Lot ${lotNo}:`, restoredMfg);

      setManufacturedQtyByLine(prev => ({
        ...prev,
        [selectedLine]: {
          ...prev[selectedLine],
          [lotNo]: restoredMfg
        }
      }));

      // Restore final inspection remarks
      if (lineFinalResult.remarks) {
        console.log(`📋 [Load Data] Restoring remarks: ${lineFinalResult.remarks}`);
        setFinalInspectionRemarks(lineFinalResult.remarks);
      }
    } else {
      console.log(`📋 [Load Data] No saved data found for ${selectedLine}`);
      // Note: We don't clear manufactured quantities here anymore since they're per-lot
      // Each lot will have its own data loaded when needed
      // The initialization already loads all lots from localStorage
    }
  }, [selectedLine, localProductionLines, call?.call_no, call?.po_no]);

  // Refresh rejected quantities when call or PO changes (on initial load or call change)
  useEffect(() => {
  }, [call?.call_no, call?.po_no]);

  // Get current line index from selectedLine (e.g., "Line-1" → 0)
  const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;

  // Get the production line data for the selected line tab
  const currentProductionLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};

  // Get manufactured quantity from Shearing input field (all shifts combined)
  const getShearingManufacturedQty = useCallback(() => {
    return parseInt(manufacturedQty.shearing) || 0;
  }, [manufacturedQty.shearing]);

  // Get manufactured quantity for a specific lot from Shearing input field
  const getShearingManufacturedQtyForLot = useCallback((lotNo) => {
    const lotMfgQty = (manufacturedQtyByLine[selectedLine] && manufacturedQtyByLine[selectedLine][lotNo]) || {};
    return parseInt(lotMfgQty.shearing) || 0;
  }, [manufacturedQtyByLine, selectedLine]);

  // Get PO data based on the call selected in current production line
  const currentCallData = allCallOptions.find(c => c.call_no === currentProductionLine.icNumber);

  // Get cached initiation data for the current line's selected call
  const currentLineInitiationData = callInitiationDataCache[currentProductionLine.icNumber];

  // Get lot/heat data from cached initiation data (from process_inspection_details table)
  // ONLY use cached initiation data - no fallback to rm_heat_tc_mapping to avoid mock data
  // Memoize lot numbers and maps to ensure stable references
  const { lineLotNumbers, lineHeatNumbersMap, lotOfferedQtyMap } = useMemo(() => {
    let lotNumbers = [];
    let heatMap = {};
    let offeredQtyMap = {}; // Map of lot number to offered quantity

    if (currentLineInitiationData) {
      // Use data from lotDetailsList if available (contains all lots for this inspection)
      if (currentLineInitiationData.lotDetailsList && currentLineInitiationData.lotDetailsList.length > 0) {
        console.log('📋 [Lot Numbers] Using lotDetailsList from API:', currentLineInitiationData.lotDetailsList);

        // Extract all lot numbers and their details from lotDetailsList
        lotNumbers = currentLineInitiationData.lotDetailsList.map(lot => lot.lotNumber);

        // Build heat numbers map and offered quantity map
        currentLineInitiationData.lotDetailsList.forEach(lot => {
          heatMap[lot.lotNumber] = lot.heatNumber || '';
          offeredQtyMap[lot.lotNumber] = lot.offeredQty || 0;
        });

        console.log('✅ [Lot Numbers] Using all lot numbers from lotDetailsList:', lotNumbers);
        console.log('✅ [Lot Numbers] Heat numbers map:', heatMap);
        console.log('✅ [Lot Numbers] Offered quantities map:', offeredQtyMap);
      } else {
        // Fallback to main lot number if lotDetailsList is not available
        const mainLotNumber = currentLineInitiationData.lotNumber || '';
        const mainHeatNumber = currentLineInitiationData.heatNumber || '';

        console.log('📋 [Lot Numbers] Main lot number from API:', mainLotNumber);
        console.log('📋 [Lot Numbers] Main heat number from API:', mainHeatNumber);

        // If we have the main lot number, use it
        if (mainLotNumber) {
          lotNumbers = [mainLotNumber];
          heatMap = { [mainLotNumber]: mainHeatNumber };
          offeredQtyMap = { [mainLotNumber]: currentLineInitiationData.offeredQty || 0 };
          console.log('✅ [Lot Numbers] Using main lot number:', mainLotNumber, 'with heat:', mainHeatNumber);
        } else {
          console.log('⚠️ [Lot Numbers] No lot number in cached initiation data');
        }
      }
    } else {
      console.log('⚠️ [Lot Numbers] No cached initiation data available for this call');
    }

    console.log('📋 [Lot Numbers] Final lot numbers array:', lotNumbers);
    console.log('📋 [Lot Numbers] Final heat numbers map:', heatMap);
    console.log('📋 [Lot Numbers] Final offered quantities map:', offeredQtyMap);

    return { lineLotNumbers: lotNumbers, lineHeatNumbersMap: heatMap, lotOfferedQtyMap: offeredQtyMap };
  }, [currentLineInitiationData]);

  /**
   * Handle Inspection Completed - collect lot-wise data and trigger ENTRY_INSPECTION_RESULTS workflow
   */
  const handleInspectionCompleted = useCallback(async () => {
    const inspectionCallNo = call?.call_no;
    if (!inspectionCallNo) {
      showNotification('error', 'No inspection call number found');
      return;
    }

    // Get the selected lot for the current line
    const selectedLot = getSelectedLotForCurrentLine();
    if (!selectedLot) {
      showNotification('error', 'Please select a lot from the 8-hour grid to complete inspection');
      return;
    }

    // Get current line data
    const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;
    const prodLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};
    const pincode = prodLine.pincode || call?.pincode || '560001';

    // Get shearing manufactured quantity from input field
    const shearingManufacturedQty = getShearingManufacturedQty();

    // Calculate total rejected from all stages (already filtered by lot in calculateRejectedFromSubmodule)
    const totalRejected = (rejectedQty.shearing || 0) + (rejectedQty.turning || 0) +
                         (rejectedQty.mpiTesting || 0) + (rejectedQty.forging || 0) +
                         (rejectedQty.quenching || 0) + (rejectedQty.tempering || 0) +
                         (rejectedQty.visualCheck || 0) + (rejectedQty.dimensionsCheck || 0) +
                         (rejectedQty.hardnessCheck || 0);

    // Accepted = Manufactured - Total Rejected
    let inspectedQty = Math.max(0, shearingManufacturedQty - totalRejected);

    // Get offered quantity for this specific lot from the map
    const offeredQty = lotOfferedQtyMap[selectedLot] || rawMaterialAccepted || 0;

    // Accepted quantity should NOT exceed offered quantity
    if (typeof offeredQty === 'number' && inspectedQty > offeredQty) {
      inspectedQty = offeredQty;
    }

    console.log(`📋 [Inspection Completed] Lot: ${selectedLot}, Offered: ${offeredQty}, Manufactured: ${shearingManufacturedQty}, Rejected: ${totalRejected}, Inspected: ${inspectedQty}`);

    if (!window.confirm(`Complete inspection for Lot ${selectedLot}?\n\nAccepted Qty: ${inspectedQty}\nOffered Qty: ${offeredQty}`)) {
      return;
    }

    setIsSaving(true);
    try {
      // Save draft first
      handleSaveDraft();

      // Get logged in user
      const currentUser = getStoredUser();
      const userId = currentUser?.userId || currentUser?.username || 'SYSTEM';

      // Get current line data for payload
      const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;
      const prodLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};
      const poNo = prodLine.po_no || prodLine.poNumber || '';

      // Collect all submodule data from localStorage for this line
      const lineData = getAllProcessData(inspectionCallNo, poNo, selectedLine);

      // Step 1: Call finishProcessInspection API to save inspection data
      console.log('💾 [Inspection Completed] Calling finishProcessInspection API...');

      const finishPayload = {
        inspectionCallNo,
        remarks: `Inspection completed for lot ${selectedLot}. Accepted: ${inspectedQty} pcs`,
        linesData: [
          {
            inspectionCallNo,
            poNo,
            lineNo: selectedLine,
            ...lineData
          }
        ]
      };

      console.log('📦 [Inspection Completed] Finish Payload:', JSON.stringify(finishPayload, null, 2));

      await finishProcessInspection(finishPayload, userId);
      console.log('✅ [Inspection Completed] Inspection data saved successfully');

      // Step 2: Prepare action data for workflow transition
      const actionData = {
        workflowTransitionId: call.workflowTransitionId || call.id,
        requestId: inspectionCallNo,
        action: 'ENTRY_INSPECTION_RESULTS',
        inspectedQty: inspectedQty,
        manufacturedQty: shearingManufacturedQty,
        lotNo: selectedLot,
        offeredQty: offeredQty,
        remarks: `Inspection completed for lot ${selectedLot}. Accepted: ${inspectedQty} pcs`,
        actionBy: userId,
        pincode: pincode
      };

      console.log('🔄 [Inspection Completed] Triggering workflow API with action data:', actionData);

      await performTransitionAction(actionData);
      console.log('✅ [Inspection Completed] Workflow transition successful');

      showNotification('success', `Inspection completed for Lot ${selectedLot}. Accepted Qty: ${inspectedQty} pcs`);
    } catch (error) {
      console.error('Error completing inspection:', error);
      showNotification('error', `Failed to complete inspection: ${error?.message || error}`);
    } finally {
      setIsSaving(false);
    }
  }, [call, selectedLine, localProductionLines, getSelectedLotForCurrentLine, rejectedQty, lotOfferedQtyMap, rawMaterialAccepted, handleSaveDraft, getShearingManufacturedQty]);

  // Use current line's PO data from cached initiation data (live from backend)
  // Priority: 1) currentLineInitiationData, 2) fetchedPoData, 3) currentCallData
  // Extract manufacturer from rmIcHeatInfoList (first entry) - same as Raw Material Dashboard
  const lineManufacturer = currentLineInitiationData?.rmIcHeatInfoList?.[0]?.manufacturer
    || currentLineInitiationData?.vendorName
    || fetchedPoData?.manufacturer
    || currentCallData?.manufacturer
    || currentCallData?.vendor_name
    || '';

  const linePoData = currentLineInitiationData ? {
    po_no: currentLineInitiationData.poNo || '',
    sub_po_no: currentProductionLine.rawMaterialICs || '',
    po_date: currentLineInitiationData.poDate || '',
    sub_po_date: currentLineInitiationData.poDate || '',
    contractor: currentLineInitiationData.vendorName || '',
    manufacturer: lineManufacturer,
    place_of_inspection: currentLineInitiationData.placeOfInspection || ''
  } : (fetchedPoData ? {
    po_no: fetchedPoData.po_no || '',
    sub_po_no: fetchedPoData.po_no || '',
    po_date: fetchedPoData.po_date || '',
    sub_po_date: fetchedPoData.po_date || '',
    contractor: fetchedPoData.contractor || fetchedPoData.vendor_name || '',
    manufacturer: fetchedPoData.manufacturer || '',
    place_of_inspection: fetchedPoData.place_of_inspection || ''
  } : (currentCallData ? {
    po_no: currentCallData.po_no || '',
    sub_po_no: currentCallData.sub_po_no || currentProductionLine.rawMaterialICs || '',
    po_date: currentCallData.po_date || '',
    sub_po_date: currentCallData.sub_po_date || currentCallData.po_date || '',
    contractor: currentCallData.contractor || currentCallData.vendor_name || '',
    manufacturer: currentCallData.manufacturer || currentCallData.vendor_name || '',
    place_of_inspection: currentCallData.place_of_inspection || ''
  } : {
    po_no: '',
    sub_po_no: '',
    po_date: '',
    sub_po_date: '',
    contractor: '',
    manufacturer: '',
    place_of_inspection: ''
  }));

  // removed unused hourly data and validators to satisfy lint rules

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <div className="process-dashboard">
        <style>{staticDataStyles}</style>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-32)' }}>
          <p>Loading inspection data...</p>
        </div>
      </div>
    );
  }

  // Get call details for display - show all PO numbers if multiple calls
  const callNo = availableCalls.length > 1
    ? availableCalls.map(c => c.po_no).join(', ')
    : (fetchedCallData?.inspectionCallNo || call?.call_no || 'N/A');
  // Read shift and date from sessionStorage (saved during Initiation) or fallback to fetched data
  const shiftOfInspection = sessionStorage.getItem('inspectionShift') || fetchedCallData?.shiftOfInspection || 'N/A';
  const dateOfInspection = sessionStorage.getItem('inspectionDate') || fetchedCallData?.dateOfInspection || 'N/A';

  return (
    <div className="process-dashboard">
      <style>{staticDataStyles}</style>
      <Notification
        message={notification.message}
        type={notification.type}
        autoClose={notification.autoClose}
        onClose={() => setNotification({ type: '', message: '', autoClose: true })}
      />

      <div className="breadcrumb">
        <div className="breadcrumb-item" onClick={onBack} style={{ cursor: 'pointer' }}>Landing Page</div>
        <span className="breadcrumb-separator">/</span>
        <div className="breadcrumb-item">Inspection Initiation</div>
        <span className="breadcrumb-separator">/</span>
        <div className="breadcrumb-item breadcrumb-active">ERC Process</div>
      </div>

      {/* Inspection Call Info Banner */}
      <div className="card" style={{ background: 'var(--color-primary-light)', marginBottom: 'var(--space-16)', padding: 'var(--space-16)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-24)', flexWrap: 'wrap' }}>
          <div><strong>Call No:</strong> {callNo}</div>
          <div><strong>Shift:</strong> {shiftOfInspection}</div>
          <div><strong>Date of Inspection:</strong> {dateOfInspection}</div>
        </div>
      </div>

      <div className="process-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <h1>ERC Process Inspection - {callNo}</h1>
        <button
          className="btn btn-secondary"
          onClick={onBack}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Landing Page
        </button>
      </div>

      {/* Multiple Production Lines Section */}
      <div className="card" style={{ marginBottom: 'var(--space-24)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">Multiple Production Lines (if applicable)</h3>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setProductionLinesExpanded(!productionLinesExpanded)}
            style={{ padding: '8px 16px', fontSize: '18px' }}
          >
            {productionLinesExpanded ? '-' : '+'}
          </button>
        </div>
        {productionLinesExpanded && (
          <>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>All data points must be collected for each line number separately.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="production-lines-table">
                <thead>
                  <tr>
                    <th>Line Number</th>
                    <th>Inspection Call Number <span style={{ color: '#ef4444' }}>*</span></th>
                    <th>PO Number</th>
                    <th>Raw Material IC Number(s)</th>
                    <th>Product Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localProductionLines.map((line, idx) => (
                    <tr key={idx}>
                      <td data-label="Line Number">
                        <input
                          type="number"
                          className="form-input"
                          value={line.lineNumber || idx + 1}
                          readOnly
                          disabled
                          style={{ width: '80px', backgroundColor: '#f3f4f6', fontWeight: '500' }}
                        />
                      </td>
                      <td data-label="Inspection Call Number">
                        <select
                          className="form-input"
                          value={line.icNumber || ''}
                          onChange={(e) => handleCallNumberChange(idx, e.target.value)}
                          style={{
                            minWidth: '180px',
                            backgroundColor: '#fff',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">Select Call Number</option>
                          {allCallOptions.map((opt, optIdx) => (
                            <option key={optIdx} value={opt.call_no}>{opt.call_no}</option>
                          ))}
                        </select>
                      </td>
                      <td data-label="PO Number">
                        <input
                          type="text"
                          className="form-input"
                          value={line.poNumber || ''}
                          readOnly
                          disabled
                          style={{ minWidth: '120px', backgroundColor: '#f3f4f6' }}
                        />
                      </td>
                      <td data-label="Raw Material IC">
                        <input
                          type="text"
                          className="form-input"
                          value={line.rawMaterialICs || '-'}
                          readOnly
                          disabled
                          style={{ minWidth: '150px', backgroundColor: '#f3f4f6' }}
                        />
                      </td>
                      <td data-label="Product Type">
                        <input
                          type="text"
                          className="form-input"
                          value={line.productType || ''}
                          readOnly
                          disabled
                          style={{ minWidth: '100px', backgroundColor: '#f3f4f6' }}
                        />
                      </td>
                      <td data-label="Actions">
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleRemoveProductionLine(idx)}
                          style={{
                            padding: '6px 16px',
                            fontSize: '13px',
                            color: '#dc2626',
                            borderColor: '#dc2626',
                            backgroundColor: '#fff'
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Add Production Line and Add New Call Number Buttons */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddProductionLine}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#1f2937',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                + Add Production Line
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddNewCallNumber}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0d9488',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                + Add New Call Number
              </button>
            </div>
          </>
        )}
      </div>

      {/* Line Number Toggle - At the top */}
      <div className="process-line-toggle" style={{
        display: 'flex',
        marginBottom: 'var(--space-24)',
        background: '#fef3e2',
        borderRadius: '8px',
        padding: '8px',
        border: '1px solid #f59e0b'
      }}>
        {manufacturingLines.map(line => (
          <button
            key={line}
            onClick={() => handleLineChange(line)}
            style={{
              flex: 1,
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: selectedLine === line ? '600' : '400',
              color: selectedLine === line ? '#fff' : '#374151',
              backgroundColor: selectedLine === line ? '#0d9488' : 'transparent',
              border: selectedLine === line ? '2px solid #0d9488' : '2px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {line}
          </button>
        ))}
      </div>

      {/* Inspection Details (Static Data) - Based on selected line */}
      <div className="card" style={{ background: 'var(--color-gray-100)', marginBottom: 'var(--space-24)' }}>
        <div className="card-header">
          <h3 className="card-title">Inspection Details (Static Data) - {selectedLine}</h3>
          <p className="card-subtitle">Auto-fetched from PO/Sub PO information for selected line</p>
        </div>
        <div className="process-form-grid">
          <div className="process-form-group">
            <label className="process-form-label">PO Number</label>
            <input type="text" className="process-form-input" value={linePoData.po_no || linePoData.sub_po_no || ''} disabled />
          </div>
          <div className="process-form-group">
            <label className="process-form-label">PO Date</label>
            <input type="text" className="process-form-input" value={formatDate(linePoData.sub_po_date || linePoData.po_date)} disabled />
          </div>
          <div className="process-form-group">
            <label className="process-form-label">Contractor Name</label>
            <input type="text" className="process-form-input" value={linePoData.contractor || ''} disabled />
          </div>
          <div className="process-form-group">
            <label className="process-form-label">Manufacturer</label>
            <input type="text" className="process-form-input" value={linePoData.manufacturer || ''} disabled />
          </div>
          <div className="process-form-group">
            <label className="process-form-label">Place of Inspection</label>
            <input type="text" className="process-form-input" value={linePoData.place_of_inspection || ''} disabled />
          </div>
          <div className="process-form-group">
            <label className="process-form-label">Stage of Inspection</label>
            <input type="text" className="process-form-input" value="Process Material Inspection" disabled />
          </div>
        </div>
      </div>

      {/* Pre-Inspection Data Entry - Fetched from backend based on selected call's rm_heat_tc_mapping */}
      <div className="card compact-card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header" style={{ paddingBottom: '8px' }}>
          <h3 className="card-title" style={{ marginBottom: '4px' }}>Pre-Inspection Data Entry - {selectedLine}</h3>
          {/* <span style={{ fontSize: '12px', color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>📥 Fetched from Backend (PO: {currentCallData?.po_no || 'N/A'})</span> */}
        </div>

        {/* Compact Lot-Heat Mapping Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
          {lineLotNumbers.length > 0 ? lineLotNumbers.map(lot => (
            <div key={lot} style={{
              background: '#fefce8',
              border: '1px solid #fef08a',
              borderRadius: '6px',
              padding: '10px'
            }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Lot Number</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{lot}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Heat No. (from RM IC)</span>
                <span style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#1f2937',
                  background: '#f3f4f6',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  marginTop: '4px'
                }}>{lineHeatNumbersMap[lot] || '-'}</span>
              </div>
            </div>
          )) : (
            <div style={{
              color: '#64748b',
              fontSize: '14px',
              padding: '20px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '6px',
              border: '1px dashed #cbd5e1'
            }}>
              No lot/heat data available for selected call. Please ensure the call has rm_heat_tc_mapping data.
            </div>
          )}
        </div>

        <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: '4px', color: '#1d4ed8' }}>ℹ️</span>
          3 readings per hour are required for all process parameters
        </div>
      </div>

      {/* Sub Module Session - Shows for selected line */}
      <div className="process-submodule-session">
        <div className="process-submodule-session-header">
          <h3 className="process-submodule-session-title">📋 Sub Module Session</h3>
          <p className="process-submodule-session-subtitle">
            Select a module to proceed with inspection
            <span style={{ marginLeft: '8px', color: '#0d9488', fontWeight: 500 }}>({manufacturingLines.length} Production Lines)</span>
          </p>
        </div>
        <div className="process-submodule-buttons">
          <button className="process-submodule-btn" onClick={() => onNavigateToSubModule('process-calibration-documents', { selectedLine, productionLines: localProductionLines, allCallOptions })}>
            <span className="process-submodule-btn-icon">📄</span>
            <p className="process-submodule-btn-title">Calibration & Documents</p>
            <p className="process-submodule-btn-desc">Verify instrument calibration</p>
          </button>
          <button className="process-submodule-btn" onClick={() => onNavigateToSubModule('process-static-periodic-check', { selectedLine, productionLines: localProductionLines, allCallOptions })}>
            <span className="process-submodule-btn-icon">⚙️</span>
            <p className="process-submodule-btn-title">Static Periodic Check</p>
            <p className="process-submodule-btn-desc">Equipment verification (includes Oil Tank Counter)</p>
          </button>
          <button className="process-submodule-btn" onClick={() => onNavigateToSubModule('process-parameters-grid', { selectedLine, productionLines: localProductionLines, allCallOptions, callInitiationDataCache })}>
            <span className="process-submodule-btn-icon">🔬</span>
            <p className="process-submodule-btn-title">Process Parameters - 8 Hour Grid</p>
            <p className="process-submodule-btn-desc">Hourly production data entry</p>
          </button>
          <button className="process-submodule-btn" onClick={() => onNavigateToSubModule('process-summary-reports', { selectedLine, productionLines: localProductionLines, allCallOptions })}>
            <span className="process-submodule-btn-icon">📊</span>
            <p className="process-submodule-btn-title">Summary / Reports</p>
            <p className="process-submodule-btn-desc">View consolidated results</p>
          </button>
        </div>
      </div>

      {/* Final Inspection Results – Main Module (Auto Populated) */}
      <div className="card" style={{ marginTop: 'var(--space-24)', border: '2px solid #0d9488' }}>
        <div className="card-header" style={{ backgroundColor: '#f0fdfa' }}>
          <h3 className="card-title" style={{ color: '#0d9488' }}>📊 Stage-wise Results - {selectedLine}</h3>
          {/* <p className="card-subtitle">Summary of all stage-wise inspection results (Line-wise / Lot-wise / PO-wise / Total)</p> */}
        </div>

        {/* Final Inspection Results Totals - Shows sum of all lines */}
        <div className="process-context-info" style={{ padding: 'var(--space-16)', backgroundColor: '#f8fafc', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-16)', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <small style={{ color: '#64748b' }}>Raw Material Accepted</small>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0d9488' }}>{rawMaterialAccepted} pcs</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <small style={{ color: '#64748b' }}>Process Manufactured</small>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>{processManufactured} pcs</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <small style={{ color: '#64748b' }}>Process Inspection Accepted</small>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>{processInspectionAccepted} pcs</div>
          </div>
        </div>

       
        {/* Heat Wise Accoutnal Section */}
        {(() => {
          // Only show if we have heat/lot data
          if (!lineLotNumbers || lineLotNumbers.length === 0) {
            return null;
          }

          return (
            <div style={{
              padding: 'var(--space-16)',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #e2e8f0',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#15803d',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔥 Heat Wise Accoutnal
               </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="heat-wise-accoutnal-table" style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#dcfce7', borderBottom: '2px solid #86efac' }}>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#15803d',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '120px'
                      }}>Heat No.</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#15803d',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '140px'
                      }}>Accepted RM (MT)</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#15803d',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '140px'
                      }}>Max ERC Mfg</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#15803d',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '140px'
                      }}>Mfg ERC</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#15803d',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '140px'
                      }}>Rejected ERC</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#15803d',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '140px'
                      }}>Accepted ERC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineLotNumbers.map((lot) => {
                      const heatNo = lineHeatNumbersMap[lot] || '-';
                      const offeredQty = lotOfferedQtyMap[lot] || 0;

                      // Calculate manufactured ERC for this specific lot
                      const shearingManufacturedQty = getShearingManufacturedQtyForLot(lot);

                      // Calculate total rejected for THIS SPECIFIC LOT (not based on selectedLotForDisplay)
                      const totalRejected = getTotalRejectedForLot(lot);

                      // Accepted = Manufactured - Total Rejected
                      const acceptedErc = Math.max(0, shearingManufacturedQty - totalRejected);

                      return (
                        <tr key={lot} style={{
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          <td data-label="Heat No." style={{
                            padding: '12px 16px',
                            fontWeight: 600,
                            color: '#1f2937'
                          }}>{heatNo}</td>
                          <td data-label="Accepted RM (MT)" style={{
                            padding: '12px 16px',
                            color: '#64748b',
                            fontWeight: 500
                          }}>{offeredQty > 0 ? offeredQty : '-'}</td>
                          <td data-label="Max ERC Mfg" style={{
                            padding: '12px 16px',
                            color: '#3b82f6',
                            fontWeight: 500
                          }}>{shearingManufacturedQty > 0 ? shearingManufacturedQty : '-'}</td>
                          <td data-label="Mfg ERC" style={{
                            padding: '12px 16px',
                            color: '#3b82f6',
                            fontWeight: 500
                          }}>{shearingManufacturedQty > 0 ? shearingManufacturedQty : '-'}</td>
                          <td data-label="Rejected ERC" style={{
                            padding: '12px 16px',
                            color: '#ef4444',
                            fontWeight: 600
                          }}>{totalRejected > 0 ? totalRejected : '-'}</td>
                          <td data-label="Accepted ERC" style={{
                            padding: '12px 16px',
                            color: '#22c55e',
                            fontWeight: 600
                          }}>{acceptedErc > 0 ? acceptedErc : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* Lot Wise Quantity Breakup Section */}
        {(() => {
          // Get ALL selected lots from the 8-hour grid (across all sections)
          const allSelectedLots = getAllSelectedLotsForCurrentLine();

          console.log('📦 [Lot Wise Breakup] All selected lots:', allSelectedLots);

          // Only show the table if lots are selected in the 8-hour grid
          if (!allSelectedLots || allSelectedLots.length === 0) {
            return null;
          }

          return (
            <div className="lot-wise-quantity-wrapper">
              <div className="lot-wise-quantity-title">
                📦 Lot Wise Quantity Breakup
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="lot-wise-quantity-table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>Lot No.</th>
                      <th style={{ width: '150px' }}>Offered Qty</th>
                      <th style={{ width: '150px' }}>Manufactured Qty</th>
                      <th style={{ width: '150px' }}>Accepted Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSelectedLots.map((selectedLot) => {
                      // Get shearing manufactured quantity for THIS SPECIFIC LOT from input field
                      const shearingManufacturedQty = getShearingManufacturedQtyForLot(selectedLot);

                      // Calculate total rejected from all stages for THIS SPECIFIC LOT (not based on selectedLotForDisplay)
                      const totalRejected = getTotalRejectedForLot(selectedLot);

                      // Accepted = Manufactured - Total Rejected
                      const lotAcceptedQty = Math.max(0, shearingManufacturedQty - totalRejected);

                      // Get offered quantity for this specific lot from the map
                      const lotOfferedQty = lotOfferedQtyMap[selectedLot] || rawMaterialAccepted || '-';

                      console.log(`📦 [Lot Wise Breakup] Lot: ${selectedLot}, Offered: ${lotOfferedQty}, Manufactured: ${shearingManufacturedQty}, Rejected: ${totalRejected}, Accepted: ${lotAcceptedQty}`);

                      return (
                        <tr key={selectedLot}>
                          <td className="lot-number-cell">{selectedLot}</td>
                          <td style={{ color: '#64748b', fontWeight: 500 }}>{lotOfferedQty}</td>
                          <td className="quantity-cell-manufactured">{shearingManufacturedQty > 0 ? shearingManufacturedQty : '-'}</td>
                          <td className="quantity-cell-accepted">{lotAcceptedQty > 0 ? lotAcceptedQty : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        
         {/* Lot Number Toggle Tabs */}
        {(() => {
          // Get lots from the SHEARING section only (the primary section)
          const shearingLots = getSelectedLotsForModule('shearingData');

          if (!shearingLots || shearingLots.length === 0) {
            return null;
          }

          // If only one lot is selected in shearing, show it as a display (not toggle tabs)
          if (shearingLots.length === 1) {
            return (
              <div style={{
                padding: 'var(--space-16)',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  📋 Selected Lot:
                </span>
                <div style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '2px solid #0d9488',
                  backgroundColor: '#f0fdfa',
                  color: '#0d9488',
                  fontWeight: 600,
                  fontSize: '13px'
                }}>
                  Lot {shearingLots[0]}
                </div>
              </div>
            );
          }

          // If multiple lots are selected in shearing, show toggle tabs
          return (
            <div style={{
              padding: 'var(--space-16)',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginRight: '8px'
              }}>
                📋 Select Lot:
              </span>
              {shearingLots.map((lot) => {
                const isSelected = selectedLotForDisplay === lot;
                return (
                  <button
                    key={lot}
                    onClick={() => {
                      // Store selected lot in sessionStorage for persistence
                      sessionStorage.setItem('selectedLotForBreakup', lot);
                      // Trigger re-render by updating a state if needed
                      window.dispatchEvent(new CustomEvent('lotSelected', { detail: { lot } }));
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '2px solid #0d9488',
                      backgroundColor: isSelected ? '#0d9488' : '#fff',
                      color: isSelected ? '#fff' : '#0d9488',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(13, 148, 136, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = '#f0fdfa';
                        e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = '#fff';
                        e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                      }
                    }}
                  >
                    Lot {lot}
                  </button>
                );
              })}
            </div>
          );
        })()}

        
        {/* Stage-wise Results Table */}
        <div className="final-inspection-table-wrapper" style={{ overflowX: 'auto', padding: 'var(--space-16)' }}>
          <table className="data-table final-inspection-table">
            <thead>
              <tr style={{ backgroundColor: '#90EE90', color: '#000' }}>
                <th style={{ color: '#000', width: '80px' }}>S.No.</th>
                <th style={{ color: '#000', width: '200px' }}>Stage / Section</th>
                <th style={{ color: '#000', width: '150px' }}>Manufactured</th>
                <th style={{ color: '#000', width: '150px' }}>Accepted</th>
                <th style={{ color: '#000', width: '150px' }}>Rejected</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. Shearing */}
              <tr>
                <td data-label="S.No.">1</td>
                <td data-label="Stage"><strong>Shearing</strong></td>
                <td data-label="Manufactured">
                  <input
                    type="text"
                    value={manufacturedQty.shearing}
                    onChange={(e) => {
                      const lotNo = selectedLotForDisplay || getSelectedLotForCurrentLine();
                      setManufacturedQtyByLine(prev => ({
                        ...prev,
                        [selectedLine]: {
                          ...prev[selectedLine],
                          [lotNo]: { ...(prev[selectedLine]?.[lotNo] || {}), shearing: e.target.value }
                        }
                      }));
                    }}
                    onBlur={(e) => handleManufacturedBlur('shearing', e.target.value, rejectedQty.shearing)}
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>
                  {acceptedQty.shearing || '-'}
                </td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>
                  {rejectedQty.shearing || '-'}
                </td>
              </tr>

              {/* 2. Turning (Hydro Coping) */}
              <tr>
                <td data-label="S.No.">2</td>
                <td data-label="Stage"><strong>Turning (Hydro Coping)</strong></td>
                <td data-label="Manufactured">
                  <input
                    type="text"
                    value={manufacturedQty.turning}
                    onChange={(e) => {
                      const lotNo = selectedLotForDisplay || getSelectedLotForCurrentLine();
                      setManufacturedQtyByLine(prev => ({
                        ...prev,
                        [selectedLine]: {
                          ...prev[selectedLine],
                          [lotNo]: { ...(prev[selectedLine]?.[lotNo] || {}), turning: e.target.value }
                        }
                      }));
                    }}
                    onBlur={(e) => handleManufacturedBlur('turning', e.target.value, rejectedQty.turning)}
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>
                  {acceptedQty.turning || '-'}
                </td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>
                  {rejectedQty.turning || '-'}
                </td>
              </tr>

              {/* 3. MPI Testing */}
              <tr>
                <td data-label="S.No.">3</td>
                <td data-label="Stage"><strong>MPI Testing</strong></td>
                <td data-label="Manufactured">
                  <input
                    type="text"
                    value={manufacturedQty.mpiTesting}
                    onChange={(e) => {
                      const lotNo = selectedLotForDisplay || getSelectedLotForCurrentLine();
                      setManufacturedQtyByLine(prev => ({
                        ...prev,
                        [selectedLine]: {
                          ...prev[selectedLine],
                          [lotNo]: { ...(prev[selectedLine]?.[lotNo] || {}), mpiTesting: e.target.value }
                        }
                      }));
                    }}
                    onBlur={(e) => handleManufacturedBlur('mpiTesting', e.target.value, rejectedQty.mpiTesting)}
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>
                  {acceptedQty.mpiTesting || '-'}
                </td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>
                  {rejectedQty.mpiTesting || '-'}
                </td>
              </tr>

              {/* 4. Forging (Visual) */}
              <tr>
                <td data-label="S.No.">4</td>
                <td data-label="Stage"><strong>Forging (Visual)</strong></td>
                <td data-label="Manufactured">
                  <input
                    type="text"
                    value={manufacturedQty.forging}
                    onChange={(e) => {
                      const lotNo = selectedLotForDisplay || getSelectedLotForCurrentLine();
                      setManufacturedQtyByLine(prev => ({
                        ...prev,
                        [selectedLine]: {
                          ...prev[selectedLine],
                          [lotNo]: { ...(prev[selectedLine]?.[lotNo] || {}), forging: e.target.value }
                        }
                      }));
                    }}
                    onBlur={(e) => handleManufacturedBlur('forging', e.target.value, rejectedQty.forging)}
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>
                  {acceptedQty.forging || '-'}
                </td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>
                  {rejectedQty.forging || '-'}
                </td>
              </tr>

              {/* 5. Quenching */}
              <tr>
                <td data-label="S.No.">5</td>
                <td data-label="Stage"><strong>Quenching</strong></td>
                <td data-label="Manufactured">
                  <input
                    type="text"
                    value={manufacturedQty.quenching}
                    onChange={(e) => {
                      const lotNo = selectedLotForDisplay || getSelectedLotForCurrentLine();
                      setManufacturedQtyByLine(prev => ({
                        ...prev,
                        [selectedLine]: {
                          ...prev[selectedLine],
                          [lotNo]: { ...(prev[selectedLine]?.[lotNo] || {}), quenching: e.target.value }
                        }
                      }));
                    }}
                    onBlur={(e) => handleManufacturedBlur('quenching', e.target.value, rejectedQty.quenching)}
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>
                  {acceptedQty.quenching || '-'}
                </td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>
                  {rejectedQty.quenching || '-'}
                </td>
              </tr>

              {/* 6. Tempering */}
              <tr>
                <td data-label="S.No.">6</td>
                <td data-label="Stage"><strong>Tempering</strong></td>
                <td data-label="Manufactured">
                  <input
                    type="text"
                    value={manufacturedQty.tempering}
                    onChange={(e) => {
                      const lotNo = selectedLotForDisplay || getSelectedLotForCurrentLine();
                      setManufacturedQtyByLine(prev => ({
                        ...prev,
                        [selectedLine]: {
                          ...prev[selectedLine],
                          [lotNo]: { ...(prev[selectedLine]?.[lotNo] || {}), tempering: e.target.value }
                        }
                      }));
                    }}
                    onBlur={(e) => handleManufacturedBlur('tempering', e.target.value, rejectedQty.tempering)}
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>
                  {acceptedQty.tempering || '-'}
                </td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>
                  {rejectedQty.tempering || '-'}
                </td>
              </tr>

              {/* 7. Dimensions Check */}
              <tr>
                <td data-label="S.No.">7</td>
                <td data-label="Stage"><strong>Dimensions Check</strong></td>
                <td data-label="Manufactured">-</td>
                <td data-label="Accepted">-</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>
                  {rejectedQty.dimensionsCheck || '-'}
                </td>
              </tr>

              {/* 8. Hardness Check */}
              <tr>
                <td data-label="S.No.">8</td>
                <td data-label="Stage"><strong>Hardness Check</strong></td>
                <td data-label="Manufactured">-</td>
                <td data-label="Accepted">-</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>
                  {rejectedQty.hardnessCheck || '-'}
                </td>
              </tr>

              {/* 9. Visual Check */}
              <tr>
                <td data-label="S.No.">9</td>
                <td data-label="Stage"><strong>Visual Check</strong></td>
                <td data-label="Manufactured">-</td>
                <td data-label="Accepted">-</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>
                  {rejectedQty.visualCheck || '-'}
                </td>
              </tr>

              {/* 10. Testing & Finishing */}
              <tr>
                <td data-label="S.No.">10</td>
                <td data-label="Stage"><strong>Testing & Finishing</strong></td>
                <td data-label="Manufactured">-</td>
                <td data-label="Accepted">-</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>
                  {rejectedQty.testingFinishing || '-'}
                </td>
              </tr>

              {/* 11. Accepted - Completely Blank Row */}
              <tr>
                <td data-label="S.No.">11</td>
                <td data-label="Stage"><strong>Accepted</strong></td>
                <td data-label="Manufactured">-</td>
                <td data-label="Accepted">-</td>
                <td data-label="Rejected">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Remarks Field - Required Manual Entry */}
        <div style={{ padding: 'var(--space-16)', borderTop: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            Remarks <span style={{ color: '#ef4444' }}>*</span>
            <small style={{ fontWeight: 'normal', color: '#64748b', marginLeft: '8px' }}>(Manual Entry - Required)</small>
          </label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Enter inspection remarks..."
            value={finalInspectionRemarks}
            onChange={e => setFinalInspectionRemarks(e.target.value)}
            style={{
              width: '100%',
              borderColor: !finalInspectionRemarks ? '#f59e0b' : '#22c55e',
              resize: 'vertical'
            }}
            required
          />
          {!finalInspectionRemarks && (
            <small style={{ color: '#f59e0b' }}>This field is required</small>
          )}
        </div>

        {/* Validation Rules Info */}
        {/* <div style={{ padding: 'var(--space-16)', backgroundColor: '#fffbeb', borderTop: '1px solid #fbbf24' }}>
          <strong style={{ color: '#92400e' }}>📋 Validation Rules Applied:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#92400e', fontSize: '13px' }}>
            <li>Qty Accepted in Raw Material Stage ≥ Qty Accepted in Process Inspection</li>
            <li>Qty Accepted in Process Inspection ≥ Qty Accepted in Final Inspection</li>
            <li>Qty Accepted in Final Inspection ≤ Qty Ordered in PO</li>
            <li>Accepted quantity mapped to any PO must not exceed Raw Material quantity passed for that PO</li>
          </ul>
        </div> */}
      </div>
     
        {/* Draft Save Feedback Message */}
        {draftSaveMessage.text && (
          <div
            className={`alert ${draftSaveMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}
            style={{
              marginTop: 'var(--space-16)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: draftSaveMessage.type === 'success' ? '#dcfce7' : '#fef2f2',
              border: `1px solid ${draftSaveMessage.type === 'success' ? '#22c55e' : '#ef4444'}`,
              borderRadius: '8px',
              color: draftSaveMessage.type === 'success' ? '#166534' : '#991b1b'
            }}
          >
            <span>{draftSaveMessage.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{draftSaveMessage.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="rm-action-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: '24px' }}>
          <button
            className="btn btn-outline"
            style={{
              minHeight: '44px',
              padding: '10px 20px',
              backgroundColor: isSavingDraft ? '#f3f4f6' : '#fff',
              cursor: isSavingDraft ? 'not-allowed' : 'pointer'
            }}
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
          >
            {isSavingDraft ? '💾 Saving...' : '💾 Save Draft'}
          </button>
          <button
            className="btn btn-outline"
            onClick={handlePauseInspection}
            disabled={isSaving}
          >
            {isSaving ? 'Pausing...' : 'Pause Inspection'}
          </button>
          <button
            className="btn btn-outline"
            onClick={handleOpenWithheldModal}
          >
            Withheld Inspection
          </button>
          <button
            className="btn btn-outline"
            onClick={handleInspectionCompleted}
            disabled={isSaving}
          >
            Inspection Completed
          </button>
          <button
            className="btn btn-primary"
            onClick={handleFinishInspection}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Finish Inspection'}
          </button>
        </div>
        
      {/* Return button */}
      <div style={{ marginTop: 'var(--space-24)' }}>
        <button className="btn btn-secondary" onClick={onBack}>Return to Landing Page</button>
      </div>

      {/* Withheld Modal */}
      {showWithheldModal && (
        <div className="modal-overlay" onClick={handleCloseWithheldModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Withheld Inspection</h3>
              <button className="modal-close" onClick={handleCloseWithheldModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Reason <span className="required">*</span></label>
                <select
                  className="modal-select"
                  value={withheldReason}
                  onChange={(e) => { setWithheldReason(e.target.value); setWithheldError(''); }}
                >
                  {WITHHELD_REASONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {withheldReason === 'ANY_OTHER' && (
                <div className="modal-field">
                  <label className="modal-label">Remarks <span className="required">*</span></label>
                  <textarea
                    className="modal-textarea"
                    placeholder="Please provide details..."
                    value={withheldRemarks}
                    onChange={(e) => { setWithheldRemarks(e.target.value); setWithheldError(''); }}
                  />
                </div>
              )}

              {withheldError && <div className="modal-error">{withheldError}</div>}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary modal-actions__btn" onClick={handleCloseWithheldModal} disabled={isSaving}>
                Cancel
              </button>
              <button type="button" className="btn btn-warning modal-actions__btn" onClick={handleSubmitWithheld} disabled={isSaving}>
                {isSaving ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Call Number Modal */}
      {showAddCallModal && (
        <div className="modal-overlay" onClick={() => setShowAddCallModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Call Number</h3>
              <button className="modal-close" onClick={() => setShowAddCallModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '16px', color: '#64748b' }}>
                Select a call number that is not already added to the production lines:
              </p>

              {/* Filter out call numbers that are already selected in production lines */}
              {(() => {
                const selectedCallNumbers = localProductionLines.map(line => line.icNumber).filter(Boolean);
                const availableCallNumbers = allProcessCalls.filter(
                  callOption => !selectedCallNumbers.includes(callOption.call_no)
                );

                console.log('🔍 Modal Debug:');
                console.log('  - allProcessCalls:', allProcessCalls);
                console.log('  - selectedCallNumbers:', selectedCallNumbers);
                console.log('  - availableCallNumbers:', availableCallNumbers);

                if (availableCallNumbers.length === 0) {
                  return (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                      {isLoadingProcessCalls ? (
                        <>
                          <p>⏳ Loading call numbers...</p>
                          <p style={{ fontSize: '12px', marginTop: '8px' }}>
                            Please wait while we fetch the latest data.
                          </p>
                        </>
                      ) : allProcessCalls.length === 0 ? (
                        <>
                          <p>No process calls found.</p>
                          <p style={{ fontSize: '12px', marginTop: '8px' }}>
                            You may not have any process calls assigned to you.
                          </p>
                        </>
                      ) : (
                        'No available call numbers. All calls have been added to production lines.'
                      )}
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {availableCallNumbers.map((callOption) => (
                      <button
                        key={callOption.call_no}
                        onClick={() => handleSelectNewCall(callOption.call_no)}
                        style={{
                          padding: '12px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#0d9488';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{callOption.call_no}</div>
                          {callOption.po_no && (
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                              PO: {callOption.po_no}
                            </div>
                          )}
                        </div>
                        <span style={{ color: '#0d9488', fontSize: '18px' }}>→</span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary modal-actions__btn"
                onClick={() => setShowAddCallModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initiation Form Modal */}
      {showInitiationForm && selectedNewCall && (
        <div className="modal-overlay" onClick={() => setShowInitiationForm(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">Process Material Inspection Initiation - {selectedNewCall}</h3>
              <button className="modal-close" onClick={() => setShowInitiationForm(false)}>×</button>
            </div>

            <div className="modal-body" style={{ padding: '0' }}>
              {isLoadingInitiationData ? (
                <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', margin: '20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                  <p style={{ color: '#64748b', marginBottom: '8px', fontSize: '16px' }}>
                    Loading initiation data...
                  </p>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Please wait while we fetch the details for {selectedNewCall}
                  </p>
                </div>
              ) : selectedNewCallData ? (
                <div style={{ padding: '20px' }}>
                  <p style={{ marginBottom: '16px', color: '#64748b' }}>
                    Initiation form for call number: <strong>{selectedNewCall}</strong>
                  </p>

                  {/* Render the full initiation form */}
                  <InspectionInitiationFormContent
                    call={{
                      id: selectedNewCall,
                      call_no: selectedNewCall,
                      po_no: selectedNewCallData.poNo,
                      po_date: selectedNewCallData.poDate,
                      po_qty: selectedNewCallData.poQty,
                      call_qty: selectedNewCallData.callQty || selectedNewCallData.poQty,
                      product_type: 'ERC Process',
                      rm_ic_number: selectedNewCallData.rmIcNumber,
                      vendor_name: selectedNewCallData.vendorName,
                      vendor_code: selectedNewCallData.vendorCode,
                      consignee: selectedNewCallData.consignee,
                      place_of_inspection: selectedNewCallData.placeOfInspection,
                      remarks: selectedNewCallData.remarks,
                      call_date: selectedNewCallData.callDate,
                      desired_inspection_date: selectedNewCallData.desiredInspectionDate,
                      requested_date: selectedNewCallData.callDate || selectedNewCallData.desiredInspectionDate,
                      erc_type: selectedNewCallData.typeOfErc,
                      heat_number: selectedNewCallData.heatNumber,
                      delivery_period: selectedNewCallData.deliveryDate
                    }}
                    formData={newCallFormData}
                    onFormDataChange={handleNewCallFormDataChange}
                    showSectionA={true}
                    showSectionB={true}
                  />
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', margin: '20px' }}>
                  <p style={{ color: '#ef4444', marginBottom: '8px' }}>
                    Failed to load initiation data
                  </p>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Please close and try again
                  </p>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowInitiationForm(false)}
                disabled={isLoadingInitiationData}
              >
                Back
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => handleOpenNewCallActionModal('WITHHELD')}
                  disabled={isNewCallSaving || isLoadingInitiationData}
                >
                  Withheld Call
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleOpenNewCallActionModal('CANCELLED')}
                  disabled={isNewCallSaving || isLoadingInitiationData}
                >
                  Cancel Call
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleOpenNewCallInitiateModal}
                  disabled={isNewCallSaving || isLoadingInitiationData}
                >
                  Initiate Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withheld/Cancel Call Modal for New Call */}
      {showNewCallActionModal && (
        <div className="modal-overlay" onClick={handleCloseNewCallActionModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {newCallActionType === 'WITHHELD' ? 'Withheld Call' : 'Cancel Call'}
              </h3>
              <button className="modal-close" onClick={handleCloseNewCallActionModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Reason <span className="required">*</span></label>
                <select
                  className="modal-select"
                  value={newCallActionReason}
                  onChange={(e) => { setNewCallActionReason(e.target.value); setNewCallActionError(''); }}
                >
                  {CALL_ACTION_REASONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {newCallActionReason === 'ANY_OTHER' && (
                <div className="modal-field">
                  <label className="modal-label">Remarks <span className="required">*</span></label>
                  <textarea
                    className="modal-textarea"
                    placeholder="Please provide details..."
                    value={newCallActionRemarks}
                    onChange={(e) => { setNewCallActionRemarks(e.target.value); setNewCallActionError(''); }}
                  />
                </div>
              )}

              {newCallActionError && <div className="modal-error">{newCallActionError}</div>}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary modal-actions__btn" onClick={handleCloseNewCallActionModal} disabled={isNewCallSaving}>
                Cancel
              </button>
              <button type="button" className={`${newCallActionType === 'WITHHELD' ? 'btn btn-warning' : 'btn btn-danger'} modal-actions__btn`} onClick={handleSubmitNewCallAction} disabled={isNewCallSaving}>
                {isNewCallSaving ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Inspection Modal for New Call */}
      {showNewCallInitiateModal && (
        <div className="modal-overlay" onClick={handleCloseNewCallInitiateModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Initiate Inspection</h3>
              <button className="modal-close" onClick={handleCloseNewCallInitiateModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Shift of Inspection <span className="required">*</span></label>
                <select
                  className="modal-select"
                  value={newCallShift}
                  onChange={(e) => {
                    setNewCallShift(e.target.value);
                    setNewCallInitiateError('');
                  }}
                >
                  <option value="">Select Shift</option>
                  <option value="A">Shift A</option>
                  <option value="B">Shift B</option>
                  <option value="C">Shift C</option>
                </select>
              </div>

              <div className="modal-field">
                <label className="modal-label">Date of Inspection <span className="required">*</span></label>
                <input
                  type="date"
                  className="modal-input"
                  value={newCallDate}
                  onChange={(e) => {
                    setNewCallDate(e.target.value);
                    setNewCallInitiateError('');
                  }}
                />
              </div>

              {newCallInitiateError && <div className="modal-error">{newCallInitiateError}</div>}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary modal-actions__btn" onClick={handleCloseNewCallInitiateModal} disabled={isNewCallSaving}>
                Cancel
              </button>
              <button type="button" className="btn btn-success modal-actions__btn" onClick={handleSubmitNewCallInitiation} disabled={isNewCallSaving}>
                {isNewCallSaving ? 'Initiating...' : 'Initiate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessDashboard;
