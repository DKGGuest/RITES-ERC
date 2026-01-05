import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { formatDate } from '../utils/helpers';
// import { getInspectionInitiationByCallNo } from '../services/vendorInspectionService'; // Disabled for mock mode
import { finishProcessInspection } from '../services/processMaterialService';
import { getAllProcessData, clearAllProcessData } from '../services/processLocalStorageService';
import { MOCK_PO_DATA } from '../data/mockData';
import { markAsPaused, markAsWithheld } from '../services/callStatusService';

// Reason options for withheld call
const WITHHELD_REASONS = [
  { value: '', label: 'Select Reason *' },
  { value: 'MATERIAL_NOT_AVAILABLE', label: 'Full quantity of material not available with firm at the time of inspection' },
  { value: 'PLACE_NOT_AS_PER_PO', label: 'Place of inspection is not as per the PO' },
  { value: 'VENDOR_WITHDRAWN', label: 'Vendor has withdrawn the inspection call' },
  { value: 'ANY_OTHER', label: 'Any other' },
];

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
    grid-template-columns: repeat(5, 1fr);
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
      grid-template-columns: repeat(3, 1fr);
    }
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

`;




const ProcessDashboard = ({ call, onBack, onNavigateToSubModule, productionLines: initialProductionLines = [], availableCalls = [] }) => {
  // State for fetched data from backend
  const [fetchedCallData, setFetchedCallData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Persist production lines to sessionStorage whenever they change
  useEffect(() => {
    if (localProductionLines && localProductionLines.length > 0) {
      sessionStorage.setItem('processProductionLinesData', JSON.stringify(localProductionLines));
    }
  }, [localProductionLines]);

  // Available call numbers for dropdown - use passed availableCalls or build from current call
  const callNumberOptions = availableCalls.length > 0 ? availableCalls : [];

  // Add current call to options if not present
  const currentCallOption = call?.call_no ? {
    call_no: call.call_no,
    po_no: call.po_no,
    rawMaterialICs: call.rm_heat_tc_mapping?.map(m => m.subPoNumber).filter(Boolean).join(', ') || '',
    productType: call.product_type || 'ERC Process'
  } : null;

  const allCallOptions = currentCallOption && !callNumberOptions.find(c => c.call_no === call.call_no)
    ? [currentCallOption, ...callNumberOptions]
    : callNumberOptions.length > 0 ? callNumberOptions : (currentCallOption ? [currentCallOption] : []);

  // Handle call number change for a production line
  const handleCallNumberChange = (lineIndex, selectedCallNo) => {
    const selectedCall = allCallOptions.find(c => c.call_no === selectedCallNo);
    setLocalProductionLines(prev => {
      const updated = [...prev];
      updated[lineIndex] = {
        ...updated[lineIndex],
        icNumber: selectedCallNo,
        poNumber: selectedCall?.po_no || '',
        rawMaterialICs: selectedCall?.rawMaterialICs || '',
        productType: selectedCall?.productType || 'MK-V'
      };
      return updated;
    });
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
      alert('At least one production line is required');
      return;
    }
    setLocalProductionLines(prev => {
      const updated = prev.filter((_, idx) => idx !== lineIndex);
      // Renumber remaining lines
      return updated.map((line, idx) => ({ ...line, lineNumber: idx + 1 }));
    });
  };

  // Load mock data for Process Material (no API calls)
  useEffect(() => {
    const loadMockData = async () => {
      if (!call?.call_no) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);

        console.log('🏭 Process Dashboard: Using MOCK data (no API calls)');

        // Use mock PO data instead of API call
        const mockPoData = MOCK_PO_DATA["PO-2025-1002"] || MOCK_PO_DATA["PO-2025-1001"];

        // Set mock initiation data
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
          } else if (availableCalls.length > 0) {
            // Multi-call mode: create empty rows for each available call
            setLocalProductionLines(availableCalls.map((_, idx) => ({
              lineNumber: idx + 1,
              icNumber: '',
              poNumber: '',
              rawMaterialICs: '',
              productType: ''
            })));
          } else {
            // Single call mode: create one production line with mock data
            setLocalProductionLines([{
              lineNumber: 1,
              icNumber: call.call_no || '',
              poNumber: call.po_no || mockPoData.po_no || '',
              rawMaterialICs: 'RM-IC-001, RM-IC-002',
              productType: 'ERC Process'
            }]);
          }
        }
      } catch (error) {
        console.log('⚠️ Error loading mock data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadMockData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.call_no, call?.po_no, availableCalls]);

  // Selected line tab - persisted in sessionStorage
  const [selectedLine, setSelectedLine] = useState(() => {
    return sessionStorage.getItem('processSelectedLineTab') || 'Line-1';
  });

  // Persist selected line tab
  useEffect(() => {
    sessionStorage.setItem('processSelectedLineTab', selectedLine);
  }, [selectedLine]);

  // Lot data is now auto-fetched from the call's rm_heat_tc_mapping (read-only)

  // Final Inspection Results - Remarks (manual entry, required)
  const [finalInspectionRemarks, setFinalInspectionRemarks] = useState(() => {
    return sessionStorage.getItem('processFinalInspectionRemarks') || '';
  });
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

    // Clear dashboard draft from localStorage
    const inspectionCallNo = call?.call_no || '';
    if (inspectionCallNo) {
      localStorage.removeItem(`${DASHBOARD_DRAFT_KEY}${inspectionCallNo}`);
    }

    // Clear process submodule data from sessionStorage for all lines
    manufacturingLines.forEach(line => {
      localProductionLines.forEach((prodLine) => {
        const poNo = prodLine.po_no || '';
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (draftMessageTimeoutRef.current) {
        clearTimeout(draftMessageTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle Finish Inspection - collect all submodule data from localStorage and save to backend
   */
  const handleFinishInspection = useCallback(async () => {
    const inspectionCallNo = call?.call_no;
    if (!inspectionCallNo) {
      alert('No inspection call number found');
      return;
    }

    if (!window.confirm('Are you sure you want to finish this inspection? All data will be saved to the database.')) {
      return;
    }

    setIsSaving(true);
    try {
      // Collect all submodule data from localStorage for all lines
      const allLinesData = [];

      manufacturingLines.forEach((line, lineIdx) => {
        const prodLine = localProductionLines[lineIdx];
        if (!prodLine) return;

        const poNo = prodLine.po_no || '';
        if (!poNo) return;

        // Get all process data from localStorage
        const lineData = getAllProcessData(inspectionCallNo, poNo, line);

        if (Object.keys(lineData).length > 0) {
          allLinesData.push({
            inspectionCallNo,
            poNo,
            lineNo: line,
            ...lineData
          });
        }
      });

      // Build payload for backend
      const payload = {
        inspectionCallNo,
        remarks: finalInspectionRemarks,
        linesData: allLinesData
      };

      console.log('Finish Process Inspection Payload:', JSON.stringify(payload, null, 2));

      // Call the backend API
      await finishProcessInspection(payload);

      // Clear localStorage after successful save
      clearProcessInspectionData();

      alert('Process Material Inspection completed successfully!');
      onBack();
    } catch (error) {
      console.error('Error finishing inspection:', error);
      alert(`Failed to save inspection data: ${error.message}`);
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

      alert('✅ Inspection has been withheld successfully');
      handleCloseWithheldModal();
      onBack();
    } catch (error) {
      console.error('Error withholding inspection:', error);
      setWithheldError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Sample data - would be auto-fetched from sub-modules in real app
  const rawMaterialAccepted = 500; // Qty Accepted in Raw Material Stage
  const poOrderedQty = 450; // Qty Ordered in PO

  // Manual entry state for "Manufactured" column
  const [manufacturedQty, setManufacturedQty] = useState({
    shearing: '',
    turning: '',
    mpiTesting: '',
    forging: '',
    quenching: '',
    tempering: ''
  });

  // Helper function to validate manufactured quantity against rejected quantity (on blur)
  const handleManufacturedBlur = (field, value, rejectedValue) => {
    const numValue = parseInt(value) || 0;
    const numRejected = rejectedValue || 0;

    // If user enters a value less than rejected, show alert and clear the field
    if (value !== '' && numValue < numRejected) {
      alert(`Manufactured quantity (${numValue}) cannot be less than rejected quantity (${numRejected})`);
      setManufacturedQty(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Calculate rejected quantities from submodule localStorage data
  const calculateRejectedFromSubmodule = useCallback((submoduleName, rejectedField = null) => {
    const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;
    const prodLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};

    // Get PO number - check multiple possible field names
    const poNo = prodLine.poNumber || prodLine.po_no || call?.po_no || '';
    const inspectionCallNo = call?.call_no || '';

    const allData = getAllProcessData(inspectionCallNo, poNo, selectedLine);

    if (!allData || !allData[submoduleName]) {
      console.log(`[${submoduleName}] No data found. Call: ${inspectionCallNo}, PO: ${poNo}, Line: ${selectedLine}`);
      return 0;
    }

    const submoduleData = allData[submoduleName];
    let totalRejected = 0;

    // For 8-hour grid modules (shearing, turning, mpi, forging, quenching, tempering, finalCheck)
    if (Array.isArray(submoduleData)) {
      submoduleData.forEach((hourData) => {
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
      });
    }

    return totalRejected;
  }, [call?.call_no, call?.po_no, selectedLine, localProductionLines]);

  // Calculate rejected quantities for Final Check section (special handling for array field)
  const calculateFinalCheckRejected = useCallback((arrayIndex) => {
    const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;
    const prodLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};
    const poNo = prodLine.poNumber || prodLine.po_no || call?.po_no || '';
    const inspectionCallNo = call?.call_no || '';

    const allData = getAllProcessData(inspectionCallNo, poNo, selectedLine);

    if (!allData || !allData.finalCheck) {
      return 0;
    }

    const finalCheckData = allData.finalCheck;
    let totalRejected = 0;

    if (Array.isArray(finalCheckData)) {
      finalCheckData.forEach((hourData) => {
        if (hourData.rejectedNo && Array.isArray(hourData.rejectedNo) && hourData.rejectedNo[arrayIndex]) {
          const num = parseInt(hourData.rejectedNo[arrayIndex]) || 0;
          totalRejected += num;
        }
      });
    }

    return totalRejected;
  }, [call?.call_no, call?.po_no, selectedLine, localProductionLines]);

  // Calculate rejected quantities for each section
  const rejectedQty = useMemo(() => {
    const visualCheckRejected = calculateFinalCheckRejected(0); // rejectedNo[0] - Visual Check
    const dimensionsCheckRejected = calculateFinalCheckRejected(1); // rejectedNo[1] - Dimension Check
    const hardnessCheckRejected = calculateFinalCheckRejected(2); // rejectedNo[2] - Hardness Check

    // Tempering rejected = sum of all Final Check rejected (Visual + Dimension + Hardness)
    const temperingRejected = visualCheckRejected + dimensionsCheckRejected + hardnessCheckRejected;

    return {
      shearing: calculateRejectedFromSubmodule('shearing'),
      turning: calculateRejectedFromSubmodule('turning'),
      mpiTesting: calculateRejectedFromSubmodule('mpi'),
      forging: calculateRejectedFromSubmodule('forging'),
      quenching: calculateRejectedFromSubmodule('quenching'),
      tempering: temperingRejected, // Calculated from Final Check section
      visualCheck: visualCheckRejected,
      dimensionsCheck: dimensionsCheckRejected,
      hardnessCheck: hardnessCheckRejected
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

  // Calculate process inspection accepted (sum of all accepted quantities)
  const processInspectionAccepted = useMemo(() => {
    return acceptedQty.shearing + acceptedQty.turning + acceptedQty.mpiTesting +
           acceptedQty.forging + acceptedQty.quenching + acceptedQty.tempering;
  }, [acceptedQty]);

  // Validation checks
  const validationErrors = [];
  if (rawMaterialAccepted < processInspectionAccepted) {
    validationErrors.push('Qty Accepted in Raw Material Stage must be ≥ Qty Accepted in Process Inspection');
  }
  if (processInspectionAccepted > poOrderedQty) {
    validationErrors.push('Qty Accepted in Process Inspection must be ≤ Qty Ordered in PO');
  }

  // Handle line change - updates selected line tab
  const handleLineChange = (line) => {
    setSelectedLine(line);
  };

  // Get current line index from selectedLine (e.g., "Line-1" → 0)
  const currentLineIndex = parseInt(selectedLine.replace('Line-', ''), 10) - 1;

  // Get the production line data for the selected line tab
  const currentProductionLine = localProductionLines[currentLineIndex] || localProductionLines[0] || {};

  // Get PO data based on the call selected in current production line
  const currentCallData = allCallOptions.find(c => c.call_no === currentProductionLine.icNumber);

  // Get lot/heat data from the selected call's rm_heat_tc_mapping (from database)
  const currentLineLotHeatData = currentCallData?.rm_heat_tc_mapping || [];

  // Build lot numbers array from rm_heat_tc_mapping (using subPoNumber as lot identifier)
  const lineLotNumbers = currentLineLotHeatData.map((mapping, idx) =>
    mapping.subPoNumber || `LOT-${idx + 1}`
  );

  // Build heat numbers map (lot -> heat)
  const lineHeatNumbersMap = currentLineLotHeatData.reduce((acc, mapping, idx) => {
    const lotKey = mapping.subPoNumber || `LOT-${idx + 1}`;
    acc[lotKey] = mapping.heatNumber || '';
    return acc;
  }, {});

  // Use current line's PO data from the selected call (from availableCalls which has full data)
  // Safely extract rawMaterialICs - ensure it's a string before splitting
  const rawMaterialICsStr = typeof currentProductionLine.rawMaterialICs === 'string'
    ? currentProductionLine.rawMaterialICs
    : '';
  const linePoData = currentCallData ? {
    po_no: currentCallData.po_no || '',
    sub_po_no: currentCallData.sub_po_no || rawMaterialICsStr.split(',')[0]?.trim() || '',
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
  };

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
              <table className="data-table">
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
                      <td>
                        <input
                          type="number"
                          className="form-input"
                          value={line.lineNumber || idx + 1}
                          readOnly
                          disabled
                          style={{ width: '80px', backgroundColor: '#f3f4f6', fontWeight: '500' }}
                        />
                      </td>
                      <td>
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
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          value={line.poNumber || ''}
                          readOnly
                          disabled
                          style={{ minWidth: '120px', backgroundColor: '#f3f4f6' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          value={line.rawMaterialICs || '-'}
                          readOnly
                          disabled
                          style={{ minWidth: '150px', backgroundColor: '#f3f4f6' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          value={line.productType || ''}
                          readOnly
                          disabled
                          style={{ minWidth: '100px', backgroundColor: '#f3f4f6' }}
                        />
                      </td>
                      <td>
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
            {/* Add Production Line Button */}
            <div style={{ marginTop: '16px' }}>
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
            <p className="process-submodule-btn-desc">Equipment verification</p>
          </button>
          <button className="process-submodule-btn" onClick={() => onNavigateToSubModule('process-oil-tank-counter', { selectedLine, productionLines: localProductionLines, allCallOptions })}>
            <span className="process-submodule-btn-icon">🛢️</span>
            <p className="process-submodule-btn-title">Oil Tank Counter</p>
            <p className="process-submodule-btn-desc">Monitor quenching count</p>
          </button>
          <button className="process-submodule-btn" onClick={() => onNavigateToSubModule('process-parameters-grid', { selectedLine, productionLines: localProductionLines, allCallOptions })}>
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
          <h3 className="card-title" style={{ color: '#0d9488' }}>📊 Final Inspection Results</h3>
          {/* <p className="card-subtitle">Summary of all stage-wise inspection results (Line-wise / Lot-wise / PO-wise / Total)</p> */}
        </div>

        {/* Validation Alerts */}
        {/* {validationErrors.length > 0 && (
          <div className="alert alert-danger" style={{ margin: 'var(--space-16)', backgroundColor: '#fef2f2', border: '1px solid #ef4444' }}>
            <strong>⚠️ Validation Errors:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )} */}

        {/* Context Info */}
        <div className="process-context-info" style={{ padding: 'var(--space-16)', backgroundColor: '#f8fafc', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-16)' }}>
          <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <small style={{ color: '#64748b' }}>Raw Material Accepted</small>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0d9488' }}>{rawMaterialAccepted} pcs</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <small style={{ color: '#64748b' }}>PO Ordered Qty</small>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>{poOrderedQty} pcs</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <small style={{ color: '#64748b' }}>Process Inspection Accepted</small>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>{processInspectionAccepted} pcs</div>
          </div>
        </div>

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
                    onChange={(e) => setManufacturedQty(prev => ({ ...prev, shearing: e.target.value }))}
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
                    onChange={(e) => setManufacturedQty(prev => ({ ...prev, turning: e.target.value }))}
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
                    onChange={(e) => setManufacturedQty(prev => ({ ...prev, mpiTesting: e.target.value }))}
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
                    onChange={(e) => setManufacturedQty(prev => ({ ...prev, forging: e.target.value }))}
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
                    onChange={(e) => setManufacturedQty(prev => ({ ...prev, quenching: e.target.value }))}
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
                    onChange={(e) => setManufacturedQty(prev => ({ ...prev, tempering: e.target.value }))}
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

              {/* 10. Accepted - Completely Blank Row */}
              <tr>
                <td data-label="S.No.">10</td>
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
            onClick={() => {
              if (window.confirm('Are you sure you want to pause this inspection? You can resume it later.')) {
                markAsPaused(call?.call_no);
                alert('Inspection has been paused. You can resume it from the landing page.');
                onBack();
              }
            }}
          >
            Pause Inspection
          </button>
          <button
            className="btn btn-outline"
            onClick={handleOpenWithheldModal}
          >
            Withheld Inspection
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
    </div>
  );
};

export default ProcessDashboard;
