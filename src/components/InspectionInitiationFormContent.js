import { useState, useEffect } from 'react';
import { MOCK_PO_DATA } from '../data/mockData';
import { formatDate, getProductTypeDisplayName } from '../utils/helpers';
import {
  saveSectionA,
  approveSectionA,
  rejectSectionA,
  saveSectionB,
  approveSectionB,
  rejectSectionB,
  saveSectionCBatch,
  approveAllSectionC,
  rejectAllSectionC
} from '../services/inspectionSectionService';
import { performTransitionAction } from '../services/workflowService';
import { getStoredUser } from '../services/authService';
import { fetchPoDataForSections } from '../services/poDataService';
import '../styles/inspectionInitiationPage.css';



const InspectionInitiationFormContent = ({ call, formData, onFormDataChange, showSectionA = true, showSectionB = true }) => {
  // State for fetched/mock data
  const [fetchedPoData, setFetchedPoData] = useState(null);
  const [fetchedSubPoData, setFetchedSubPoData] = useState(null);
  const [subPoList, setSubPoList] = useState([]); // Multiple sub POs from database
  const [isLoading, setIsLoading] = useState(true);
  const [isFromDatabase, setIsFromDatabase] = useState(false);
  const [currentCallId, setCurrentCallId] = useState(call.id); // Track which call we have data for

  // Reset data states when call changes (switching tabs in multi-tab mode)
  useEffect(() => {
    if (call.id !== currentCallId) {
      setFetchedPoData(null);
      setFetchedSubPoData(null);
      setSubPoList([]);
      setIsLoading(true);
      setIsFromDatabase(false);
      setCurrentCallId(call.id);
    }
  }, [call.id, currentCallId]);

  // Use fetched data if available, otherwise fallback to mock data
  const mockPoData = MOCK_PO_DATA[call.po_no] || {};
  const poData = fetchedPoData || mockPoData;

  // Sub PO data fallback - use fetched data, then mock data fields, then hardcoded defaults
  const subPoData = fetchedSubPoData || {
    raw_material_name: mockPoData.raw_material_name || mockPoData.product_name || 'Steel Bars Grade 45C8',
    sub_po_no: mockPoData.sub_po_no || 'SUB-PO-2025-001',
    sub_po_date: mockPoData.sub_po_date || '2025-10-18',
    contractor: mockPoData.contractor || 'Premium Materials Inc',
    manufacturer: mockPoData.manufacturer || 'Steel Works Ltd',
    place_of_inspection: mockPoData.place_of_inspection || call.place_of_inspection || 'Vendor Site',
    bpo: mockPoData.bpo || 'BPO-002',
    consignee: mockPoData.consignee || 'Central Warehouse'
  };

  const [sectionAExpanded, setSectionAExpanded] = useState(true);
  const [sectionBExpanded, setSectionBExpanded] = useState(false);
  const [sectionCExpanded, setSectionCExpanded] = useState(false);

  /* State for API operations */
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Check if this is a Process inspection
  const isProcessInspection = call.product_type?.includes('Process');

  // Fetch data from API if api_id exists, otherwise use mock data
  // Runs when call changes (switching tabs)
  useEffect(() => {
    // Skip if data already loaded for current call
    if (fetchedPoData && currentCallId === call.id) return;

    const loadData = async () => {
      setIsLoading(true);

      // Check if this is Process or Final Product - use mock data only (no API calls)
      // Handle multiple product type formats: "PROCESS_MATERIAL", "ERC Process", "Process", "FINAL_PRODUCT", "Final Product"
      const productType = call.product_type || '';
      const isProcessOrFinal =
        productType === 'PROCESS_MATERIAL' ||
        productType === 'FINAL_PRODUCT' ||
        productType.includes('Process') ||
        productType.includes('Final');

      if (isProcessOrFinal) {
        console.log('🏭 Process/Final Product: Using MOCK data only (no API call)', productType);
        const mockPo = MOCK_PO_DATA[call.po_no] || {};

        if (Object.keys(mockPo).length > 0) {
          setFetchedPoData(mockPo);
          setIsFromDatabase(false);

          if (mockPo.sub_po_no) {
            const mockSubPoData = {
              raw_material_name: mockPo.product_name,
              sub_po_no: mockPo.sub_po_no,
              sub_po_date: mockPo.sub_po_date,
              contractor: mockPo.contractor,
              manufacturer: mockPo.manufacturer,
              place_of_inspection: mockPo.place_of_inspection,
              bpo: mockPo.bpo,
              consignee: mockPo.consignee || ''
            };
            setFetchedSubPoData(mockSubPoData);
          }
        }

        setIsLoading(false);
        return; // Exit early - skip API call
      }

      // PRIORITY 1: Try to fetch PO data from database tables (po_header, po_item, po_ma_header, po_ma_detail)
      // This runs FIRST for Raw Material calls with a PO number
      if (call.po_no) {
        try {
          console.log('🔍 Fetching PO data from database for PO:', call.po_no, 'Request ID:', call.call_no);
          const poDataFromDb = await fetchPoDataForSections(call.po_no, call.call_no);

          if (poDataFromDb) {
            console.log('✅ PO data fetched from database:', poDataFromDb);
            setIsFromDatabase(true);

            // Transform database response to match expected format
            const transformedPoData = {
              po_no: poDataFromDb.poNo,
              rly_po_no: poDataFromDb.rlyPoNo, // NEW: RLY/PO_NO format
              po_serial_no: poDataFromDb.poSerialNo, // NEW: PO Serial Number
              rly_po_no_serial: poDataFromDb.rlyPoNoSerial, // NEW: RLY/PO_NO/PO_SR format
              po_date: poDataFromDb.poDate,
              po_amend_no: poDataFromDb.maNo || 'N/A',
              po_amend_dates: poDataFromDb.maDate || 'N/A',
              product_name: poDataFromDb.itemDesc || call.product_name,
              pl_no: poDataFromDb.plNo || 'N/A',
              vendor_name: poDataFromDb.vendorName,
              vendor_code: poDataFromDb.vendorCode,
              vendor_address: poDataFromDb.vendorDetails,
              place_of_inspection: poDataFromDb.inspPlace || call.place_of_inspection,
              manufacturer: poDataFromDb.vendorName,
              consignee_rly: poDataFromDb.rlyCd,
              consignee: poDataFromDb.consignee,
              po_qty: poDataFromDb.poQty,
              unit: poDataFromDb.unit || 'Nos',
              orig_dp: poDataFromDb.deliveryDate,
              ext_dp: poDataFromDb.extendedDeliveryDate || 'N/A',
              purchasing_authority: poDataFromDb.purchasingAuthority,
              bpo: poDataFromDb.billPayingOfficer,
              cond_title: poDataFromDb.condTitle,
              cond_text: poDataFromDb.condText,
              po_cond_sr_no: poDataFromDb.poCondSrNo
            };

            setFetchedPoData(transformedPoData);

            // Transform RM Heat Details to subPoList for Section C
            if (poDataFromDb.rmHeatDetails && poDataFromDb.rmHeatDetails.length > 0) {
              const transformedSubPoList = poDataFromDb.rmHeatDetails.map(heat => ({
                rawMaterialName: heat.rawMaterialName,
                grade: heat.grade,
                heatNumber: heat.heatNumber,
                manufacturer: heat.manufacturer,
                tcNumber: heat.tcNumber,
                tcDate: heat.tcDate,
                subPoNumber: heat.subPoNumber,
                subPoDate: heat.subPoDate,
                subPoQty: heat.subPoQty,
                invoiceNo: heat.invoiceNumber,
                invoiceDate: heat.invoiceDate,
                offeredQty: heat.offeredQty
              }));
              setSubPoList(transformedSubPoList);
              console.log(`✅ Loaded ${transformedSubPoList.length} RM heat details for Section C`);
            }

            setIsLoading(false);
            console.log('✅ Section A, B, C data loaded from database');
            return; // Exit early - we have the data we need
          }
        } catch (error) {
          console.error('❌ Error fetching PO data from database:', error);
          // Continue to fallback
        }
      }

      // PRIORITY 2: Fallback to mock data
      const mockPo = MOCK_PO_DATA[call.po_no] || {};

      if (Object.keys(mockPo).length > 0) {
        setFetchedPoData(mockPo);

        if (mockPo.sub_po_no) {
          const mockSubPoData = {
            raw_material_name: mockPo.product_name,
            sub_po_no: mockPo.sub_po_no,
            sub_po_date: mockPo.sub_po_date,
            contractor: mockPo.contractor,
            manufacturer: mockPo.manufacturer,
            place_of_inspection: mockPo.place_of_inspection,
            bpo: mockPo.bpo,
            consignee: mockPo.consignee || ''
          };
          setFetchedSubPoData(mockSubPoData);
        }
      }

      setIsLoading(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call.id, call.po_no, call.api_id, isProcessInspection, currentCallId]);

  // Auto-select current inspection call into first line and auto-fill dependent fields
  // Runs only once on mount - uses data from call object (from API)
  useEffect(() => {
    try {
      if (!formData.productionLines || formData.productionLines.length === 0) return;
      const first = formData.productionLines[0] || {};
      const defaultCallNo = call?.call_no;
      if (!defaultCallNo) return;
      if (!first.icNumber) {
        // Use data from the call object directly (comes from API)
        const updated = [...formData.productionLines];
        updated[0] = {
          ...first,
          icNumber: defaultCallNo,
          poNumber: call.po_no || '',
          rawMaterialICs: call.rm_heat_tc_mapping ? call.rm_heat_tc_mapping.map(m => m.icNumber || m.subPoNumber) : [],
          productType: call.product_type || ''
        };
        onFormDataChange({ productionLines: updated });
      }
    } catch (e) {
      // no-op
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call.call_no]);


  /* Convert date from dd/MM/yyyy to yyyy-MM-dd format for backend */
  const convertDateToISO = (dateStr) => {
    if (!dateStr) return null;

    // If already in ISO format (yyyy-MM-dd), return as is
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return dateStr.split(' ')[0].split('T')[0];
    }

    // Convert from dd/MM/yyyy to yyyy-MM-dd
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }

    return null;
  };

  /* Build Section A payload for API */
  const buildSectionAPayload = () => ({
    inspectionCallNo: call.call_no,
    poNo: poData.po_no || call.po_no,
    poDate: convertDateToISO(poData.po_date || call.po_date),
    vendorCode: poData.vendor_code || '',
    vendorName: poData.vendor_name || call.vendor_name,
    vendorAddress: poData.vendor_address || '',
    placeOfInspection: poData.place_of_inspection || call.place_of_inspection,
    manufacturer: poData.manufacturer || '',
    consigneeRly: poData.consignee_rly || '',
    consignee: poData.consignee || call.consignee,
    itemDescription: poData.product_name || call.product_name,
    poQty: poData.po_qty || call.po_qty,
    unit: poData.unit || 'Nos',
    origDp: convertDateToISO(poData.orig_dp || call.delivery_period),
    extDp: convertDateToISO(poData.ext_dp),
    origDpStart: convertDateToISO(poData.orig_dp_start || poData.po_date),
    bpo: poData.bpo || '',
    dateOfInspection: formData.dateOfInspection,
    shiftOfInspection: formData.shiftOfInspection,
    offeredQty: formData.offeredQty,
    status: 'approved'
  });

  /* Build Section B payload for API */
  const buildSectionBPayload = () => {
    // Extract date only (YYYY-MM-DD) - backend expects LocalDate, not datetime
    const extractDateOnly = (dateStr) => {
      if (!dateStr) return null;
      // Handle datetime format "2025-12-25 09:11:48" -> "2025-12-25"
      return dateStr.split(' ')[0].split('T')[0];
    };

    return {
      inspectionCallNo: call.call_no,
      inspectionCallDate: extractDateOnly(call.call_date || call.requested_date),
      inspectionDesiredDate: extractDateOnly(call.desired_inspection_date || call.requested_date),
      rlyPoNoSr: poData.rly_po_no_serial || `${call.po_no || ''} / ${call.po_sr || ''}`,
      itemDesc: poData.product_name || call.product_name,
      productType: call.product_type,
      poQty: poData.po_qty || call.po_qty,
      unit: poData.unit || 'Nos',
      consigneeRly: poData.consignee_rly || '',
      consignee: poData.consignee || call.consignee,
      origDp: convertDateToISO(poData.orig_dp || call.delivery_period),
      extDp: convertDateToISO(poData.ext_dp || ''),
      origDpStart: convertDateToISO(poData.orig_dp_start || poData.po_date),
      stageOfInspection: call.stage,
      callQty: call.call_qty,
      placeOfInspection: call.place_of_inspection,
      rmIcNumber: call.rm_ic_number || poData.rm_ic_number || '',
      processIcNumber: call.process_ic_number || poData.process_ic_number || '',
      remarks: call.remarks || poData.remarks || '',
      status: 'approved'
    };
  };

  /* Build Section C payload for API (batch) */
  const buildSectionCPayload = () => {
    const dataList = subPoList.length > 0 ? subPoList : [subPoData];
    return dataList.map(item => ({
      inspectionCallNo: call.call_no,
      rawMaterialName: item.raw_material_name || item.product_name || '',
      gradeSpec: item.grade_spec || item.grade || '',
      heatNo: item.heat_no || '',
      manufacturerSteelBars: item.manufacturer || item.manufacturer_steel_bars || '',
      tcNo: item.tc_no || '',
      tcDate: convertDateToISO(item.tc_date) || null,
      subPoNo: item.sub_po_no || '',
      subPoDate: convertDateToISO(item.sub_po_date) || null,
      invoiceNo: item.invoice_no || '',
      invoiceDate: convertDateToISO(item.invoice_date) || null,
      subPoQty: item.sub_po_qty || item.qty || null,
      unit: item.unit || 'Nos',
      placeOfInspection: item.place_of_inspection || call.place_of_inspection,
      status: 'approved'
    }));
  };

  /* Handle Section A OK/Not OK - Azure API Integration */
  const handleSectionAApprove = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Check if this is Process or Final Product - skip API calls
      const productType = call.product_type || '';
      const isProcessOrFinal =
        productType === 'PROCESS_MATERIAL' ||
        productType === 'FINAL_PRODUCT' ||
        productType.includes('Process') ||
        productType.includes('Final');

      if (isProcessOrFinal) {
        console.log('🏭 Process/Final Product: Section A approved (no API call)');
        // Just update local state - no API calls
        onFormDataChange({ sectionAVerified: true, sectionAStatus: 'approved' });
        if (showSectionB) {
          setSectionBExpanded(true);
        }
      } else {
        // Raw Material: Call real APIs
        const currentUser = getStoredUser();
        const userId = currentUser?.userId || 0;

        // Call Azure API for PO verification - OK action
        const actionData = {
          workflowTransitionId: call.workflowTransitionId || call.id,
          requestId: call.call_no,
          action: 'VERIFY_PO_DETAILS',
          remarks: 'PO details verified - Section A OK',
          actionBy: userId,
          pincode: '560001'
        };

        await performTransitionAction(actionData);

        // Persist Section A to backend and mark approved
        try {
          const payload = buildSectionAPayload();
          await saveSectionA(payload);
          await approveSectionA(call.call_no);
        } catch (e) {
          console.warn('Section A save/approve failed:', e);
        }

        onFormDataChange({ sectionAVerified: true, sectionAStatus: 'approved' });
        if (showSectionB) {
          setSectionBExpanded(true);
        }
      }
    } catch (error) {
      console.error('Error saving Section A:', error);
      setSaveError(error.message || 'Failed to save Section A. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionAReject = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Check if this is Process or Final Product - skip API calls
      const productType = call.product_type || '';
      const isProcessOrFinal =
        productType === 'PROCESS_MATERIAL' ||
        productType === 'FINAL_PRODUCT' ||
        productType.includes('Process') ||
        productType.includes('Final');

      if (isProcessOrFinal) {
        console.log('🏭 Process/Final Product: Section A rejected (no API call)');
        // Just update local state - no API calls
        onFormDataChange({ sectionAVerified: false, sectionAStatus: 'rejected' });
        setSectionBExpanded(false);
      } else {
        // Raw Material: Call real APIs
        const currentUser = getStoredUser();
        const userId = currentUser?.userId || 0;

        // Call Azure API for correction request - Not OK action
        const actionData = {
          workflowTransitionId: call.workflowTransitionId || call.id,
          requestId: call.call_no,
          action: 'REQUEST_CORRECTION_TO_CM',
          remarks: 'PO details need correction - Section A Not OK',
          actionBy: userId,
          pincode: '560001'
        };

        await performTransitionAction(actionData);

        // Persist Section A rejection to backend
        try {
          const payload = { ...buildSectionAPayload(), status: 'rejected' };
          await saveSectionA(payload);
          await rejectSectionA(call.call_no, 'Rejected by IE');
        } catch (e) {
          console.warn('Section A reject save failed:', e);
        }

        onFormDataChange({ sectionAVerified: false, sectionAStatus: 'rejected' });
        setSectionBExpanded(false);
      }
    } catch (error) {
      console.error('Error rejecting Section A:', error);
      setSaveError(error.message || 'Failed to reject Section A. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /* Handle Section B OK/Not OK - Azure API Integration */
  const handleSectionBApprove = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Check if this is Process or Final Product - skip API calls
      const productType = call.product_type || '';
      const isProcessOrFinal =
        productType === 'PROCESS_MATERIAL' ||
        productType === 'FINAL_PRODUCT' ||
        productType.includes('Process') ||
        productType.includes('Final');

      if (isProcessOrFinal) {
        console.log('🏭 Process/Final Product: Section B approved (no API call)');
        // Just update local state - no API calls
        onFormDataChange({ sectionBVerified: true, sectionBStatus: 'approved' });
        const productType = call?.product_type || '';
        const isSectionCRequired = productType === 'Raw Material' || productType.includes('Process');
        if (isSectionCRequired) {
          setSectionCExpanded(true);
        }
      } else {
        // Raw Material: Call real APIs
        const currentUser = getStoredUser();
        const userId = currentUser?.userId || 0;

        // Call Azure API for call details verification - OK action
        const actionData = {
          workflowTransitionId: call.workflowTransitionId || call.id,
          requestId: call.call_no,
          action: 'VERIFY_PO_DETAILS',
          remarks: 'Inspection call details verified - Section B OK',
          actionBy: userId,
          pincode: '560001'
        };

        await performTransitionAction(actionData);

        // Persist Section B to backend and mark approved
        try {
          const payload = buildSectionBPayload();
          await saveSectionB(payload);
          await approveSectionB(call.call_no);
        } catch (e) {
          console.warn('Section B save/approve failed:', e);
        }

        onFormDataChange({ sectionBVerified: true, sectionBStatus: 'approved' });
        const productType = call?.product_type || '';
        const isSectionCRequired = productType === 'Raw Material' || productType.includes('Process');
        if (isSectionCRequired) {
          setSectionCExpanded(true);
        }
      }
    } catch (error) {
      console.error('Error saving Section B:', error);
      setSaveError(error.message || 'Failed to save Section B. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionBReject = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Check if this is Process or Final Product - skip API calls
      const productType = call.product_type || '';
      const isProcessOrFinal =
        productType === 'PROCESS_MATERIAL' ||
        productType === 'FINAL_PRODUCT' ||
        productType.includes('Process') ||
        productType.includes('Final');

      if (isProcessOrFinal) {
        console.log('🏭 Process/Final Product: Section B rejected (no API call)');
        // Just update local state - no API calls
        onFormDataChange({ sectionBVerified: false, sectionBStatus: 'rejected' });
        setSectionCExpanded(false);
      } else {
        // Raw Material: Call real APIs
        const currentUser = getStoredUser();
        const userId = currentUser?.userId || 0;

        // Call Azure API for correction request - Not OK action
        const actionData = {
          workflowTransitionId: call.workflowTransitionId || call.id,
          requestId: call.call_no,
          action: 'REQUEST_CORRECTION_TO_CM',
          remarks: 'Inspection call details need correction - Section B Not OK',
          actionBy: userId,
          pincode: '560001'
        };

        await performTransitionAction(actionData);

        // Persist Section B rejection to backend
        try {
          const payload = { ...buildSectionBPayload(), status: 'rejected' };
          await saveSectionB(payload);
          await rejectSectionB(call.call_no, 'Rejected by IE');
        } catch (e) {
          console.warn('Section B reject save failed:', e);
        }

        onFormDataChange({ sectionBVerified: false, sectionBStatus: 'rejected' });
        setSectionCExpanded(false);
      }
    } catch (error) {
      console.error('Error rejecting Section B:', error);
      setSaveError(error.message || 'Failed to reject Section B. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /* Handle Section C OK/Not OK - Azure API Integration */
  const handleSectionCApprove = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Check if this is Process Material - skip API calls (Final Product doesn't have Section C)
      const productType = call.product_type || '';
      const isProcessMaterial =
        productType === 'PROCESS_MATERIAL' ||
        productType.includes('Process');

      if (isProcessMaterial) {
        console.log('🏭 Process Material: Section C approved (no API call)');
        // Just update local state - no API calls
        onFormDataChange({ sectionCVerified: true, sectionCStatus: 'approved' });
      } else {
        // Raw Material: Call real APIs
        const currentUser = getStoredUser();
        const userId = currentUser?.userId || 0;

        // Call Azure API for Sub PO verification - OK action
        const actionData = {
          workflowTransitionId: call.workflowTransitionId || call.id,
          requestId: call.call_no,
          action: 'VERIFY_PO_DETAILS',
          remarks: 'Sub PO details verified - Section C OK',
          actionBy: userId,
          pincode: '560001'
        };

        await performTransitionAction(actionData);

        // Persist Section C batch and mark approved
        try {
          const payload = buildSectionCPayload();
          await saveSectionCBatch(payload);
          await approveAllSectionC(call.call_no);
        } catch (e) {
          console.warn('Section C save/approve failed:', e);
        }

        onFormDataChange({ sectionCVerified: true, sectionCStatus: 'approved' });
      }
    } catch (error) {
      console.error('Error saving Section C:', error);
      setSaveError(error.message || 'Failed to save Section C. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionCReject = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Check if this is Process Material - skip API calls (Final Product doesn't have Section C)
      const productType = call.product_type || '';
      const isProcessMaterial =
        productType === 'PROCESS_MATERIAL' ||
        productType.includes('Process');

      if (isProcessMaterial) {
        console.log('🏭 Process Material: Section C rejected (no API call)');
        // Just update local state - no API calls
        onFormDataChange({ sectionCVerified: false, sectionCStatus: 'rejected' });
      } else {
        // Raw Material: Call real APIs
        const currentUser = getStoredUser();
        const userId = currentUser?.userId || 0;

        // Call Azure API for correction request - Not OK action
        const actionData = {
          workflowTransitionId: call.workflowTransitionId || call.id,
          requestId: call.call_no,
          action: 'REQUEST_CORRECTION_TO_CM',
          remarks: 'Sub PO details need correction - Section C Not OK',
          actionBy: userId,
          pincode: '560001'
        };

        await performTransitionAction(actionData);

        // Persist Section C rejection batch to backend
        try {
          const payload = buildSectionCPayload().map(item => ({ ...item, status: 'rejected' }));
          await saveSectionCBatch(payload);
          await rejectAllSectionC(call.call_no, 'Rejected by IE');
        } catch (e) {
          console.warn('Section C reject save failed:', e);
        }

        onFormDataChange({ sectionCVerified: false, sectionCStatus: 'rejected' });
      }
    } catch (error) {
      console.error('Error rejecting Section C:', error);
      setSaveError(error.message || 'Failed to reject Section C. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <div className="form-container inspection-form-container">
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-32)' }}>
          <p>Loading inspection data...</p>
        </div>
      </div>
    );
  }

  // Get PO number suffix for section titles
  const poSuffix = call.po_no ? ` - ${call.po_no}` : '';

  return (
    <div className="form-container inspection-form-container">
      {/* Error message display */}
      {saveError && (
        <div className="card" style={{ backgroundColor: 'var(--color-error-bg, #fee2e2)', borderColor: 'var(--color-error)', marginBottom: 'var(--space-16)' }}>
          <p style={{ color: 'var(--color-error)', margin: 0 }}>{saveError}</p>
        </div>
      )}

      {/* SECTION A: Main PO Information */}
      {showSectionA && (
      <div className={`card ${formData.showValidationErrors && !formData.sectionAVerified ? 'card--incomplete' : ''}`}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">SECTION A: Main PO Information{poSuffix} {isFromDatabase ? <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}></span> : fetchedPoData ? '(Auto-Fetched)' : ''}</h3>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSectionAExpanded(!sectionAExpanded)}
            style={{ padding: 'var(--space-8) var(--space-16)', fontSize: 'var(--font-size-xl)' }}
          >
            {sectionAExpanded ? '-' : '+'}
          </button>
        </div>
        {sectionAExpanded && (
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">RLY + PO_NO</label>
            <input type="text" className="form-input" value={poData.rly_po_no || poData.po_no || call.po_no} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">PO DATE</label>
            <input type="text" className="form-input" value={poData.po_date || formatDate(call.po_date)} disabled />
            <small style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>✓ PO Date ≤ Today</small>
          </div>
          <div className="form-group">
            <label className="form-label">PO_QTY</label>
            <input type="text" className="form-input" value={poData.po_qty || call.po_qty} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">INSP_PLACE</label>
            <input type="text" className="form-input" value={poData.place_of_inspection || call.place_of_inspection || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">VENDOR_NAME</label>
            <input type="text" className="form-input" value={poData.vendor_name || call.vendor_name} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">MA_NO</label>
            <input type="text" className="form-input" value={poData.po_amend_no || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">MA_DATE</label>
            <input type="text" className="form-input" value={poData.po_amend_dates || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">PURCHASING AUTHORITY</label>
            <input type="text" className="form-input" value={poData.purchasing_authority || 'Manager, Procurement'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">BILL PAYING OFFICER</label>
            <input type="text" className="form-input" value={poData.bpo || 'BPO-001'} disabled />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">PO_COND SR. NO.</label>
            <div className="form-grid" style={{ marginTop: 'var(--space-8)' }}>
              <div className="form-group">
                <label className="form-label">COND_TITLE</label>
                <input type="text" className="form-input" value={poData.cond_title || 'N/A'} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">COND_TEXT</label>
                <input type="text" className="form-input" value={poData.cond_text || 'N/A'} disabled />
              </div>
            </div>
          </div>

          {/* Section A OK/Not OK Buttons */}
          <div className="section-action-buttons" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-16)', paddingTop: 'var(--space-16)', borderTop: '1px solid var(--color-gray-300)' }}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleSectionAReject}
              disabled={isSaving || formData.sectionAStatus === 'rejected'}
            >
              {isSaving ? 'Saving...' : formData.sectionAStatus === 'rejected' ? 'Not OK' : 'Not OK'}
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSectionAApprove}
              disabled={isSaving || formData.sectionAStatus === 'approved'}
            >
              {isSaving ? 'Saving...' : formData.sectionAStatus === 'approved' ? 'OK' : 'OK'}
            </button>
          </div>
        </div>
        )}
      </div>
      )}

      {/* SECTION B: Inspection Call Details - Only shown when Section A is approved */}
      {showSectionB && formData.sectionAStatus === 'approved' && (
      <div className={`card ${formData.showValidationErrors && !formData.sectionBVerified ? 'card--incomplete' : ''}`}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">SECTION B: Inspection Call Details{poSuffix}</h3>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSectionBExpanded(!sectionBExpanded)}
            style={{ padding: 'var(--space-8) var(--space-16)', fontSize: 'var(--font-size-xxl)' }}
          >
            {sectionBExpanded ? '-' : '+'}
          </button>
        </div>
        {sectionBExpanded && (
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">INSPECTION CALL NO.</label>
            <input type="text" className="form-input" value={call.call_no} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">INSPECTION CALL DATE</label>
            <input type="text" className="form-input" value={formatDate(call.call_date || call.requested_date)} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">INSPECTION DESIRED DATE</label>
            <input type="text" className="form-input" value={formatDate(call.desired_inspection_date || call.requested_date)} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">RLY + PO_NO + PO_SR</label>
            <input type="text" className="form-input" value={poData.rly_po_no_serial || `${poData.po_no || call.po_no} / ${poData.pl_no || '1'}`} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">ITEM DESC</label>
            <input type="text" className="form-input" value={poData.product_name || 'ERC Components'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">PRODUCT TYPE</label>
            <input type="text" className="form-input" value={getProductTypeDisplayName(call.product_type)} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">PO_QTY + UNIT</label>
            <input type="text" className="form-input" value={`${poData.po_qty || call.po_qty} ${poData.unit || 'Nos'}`} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">CONSIGNEE_RLY + CONSIGNEE</label>
            <input type="text" className="form-input" value={poData.consignee || call.consignee || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">ORIG_DP</label>
            <input type="text" className="form-input" value={poData.orig_dp || call.delivery_period || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">EXT_DP</label>
            <input type="text" className="form-input" value={poData.ext_dp || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">ORIG_DP_START</label>
            <input type="text" className="form-input" value={poData.orig_dp_start || poData.po_date || formatDate(call.po_date)} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">STAGE OF INSPECTION</label>
            <input type="text" className="form-input" value={
              call.product_type?.includes('Process') ? 'Process Material' :
              call.product_type === 'Final Product' ? 'Final' :
              'Raw Material'
            } disabled />
          </div>
          <div className="form-group">
            <label className="form-label">CALL QTY</label>
            <input type="text" className="form-input" value={call.call_qty || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">PLACE OF INSPECTION</label>
            <input type="text" className="form-input" value={poData.place_of_inspection || call.place_of_inspection || 'N/A'} disabled />
          </div>
          {/* RM IC NUMBER - Only for Process & Final Inspection */}
          {(call.product_type?.includes('Process') || call.product_type === 'Final Product') && (
            <div className="form-group">
              <label className="form-label">RM IC NUMBER</label>
              <input type="text" className="form-input" value={call.rm_ic_number || poData.rm_ic_number || 'N/A'} disabled />
            </div>
          )}
          {/* PROCESS IC NUMBER - Only for Final Inspection */}
          {call.product_type === 'Final Product' && (
            <div className="form-group">
              <label className="form-label">PROCESS IC NUMBER</label>
              <input type="text" className="form-input" value={call.process_ic_number || poData.process_ic_number || 'N/A'} disabled />
            </div>
          )}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">REMARKS</label>
            <textarea className="form-textarea" rows="2" value={call.remarks || poData.remarks || ''} disabled />
          </div>

          {/* Section B OK/Not OK Buttons */}
          <div className="section-action-buttons" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-16)', paddingTop: 'var(--space-16)', borderTop: '1px solid var(--color-gray-300)' }}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleSectionBReject}
              disabled={isSaving || formData.sectionBStatus === 'rejected'}
            >
              {isSaving ? 'Saving...' : formData.sectionBStatus === 'rejected' ? 'Not OK' : 'Not OK'}
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSectionBApprove}
              disabled={isSaving || formData.sectionBStatus === 'approved'}
            >
              {isSaving ? 'Saving...' : formData.sectionBStatus === 'approved' ? 'OK' : 'OK'}
            </button>
          </div>
        </div>
        )}
      </div>
      )}

      {/* SECTION C: Sub PO Details (if applicable) - Only shown when Section B is approved */}
      {((call?.product_type || '') === 'Raw Material' || (call?.product_type || '').includes('Process')) && formData.sectionBStatus === 'approved' && (
        <div className={`card ${formData.showValidationErrors && !formData.sectionCVerified ? 'card--incomplete' : ''}`}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              SECTION C: Details of Sub PO in case inspection call is requested for Raw Material / process{poSuffix}
              {subPoList.length > 1 && <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginLeft: 'var(--space-8)' }}>({subPoList.length} Heats)</span>}
            </h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSectionCExpanded(!sectionCExpanded)}
              style={{ padding: 'var(--space-8) var(--space-16)', fontSize: 'var(--font-size-xl)' }}
            >
              {sectionCExpanded ? '-' : '+'}
            </button>
          </div>
          {sectionCExpanded && (
          <div>
            {/* Display multiple sub POs if available from database */}
            {subPoList.length > 0 ? (
              subPoList.map((subPo, index) => (
                <div key={index} style={{
                  marginBottom: index < subPoList.length - 1 ? 'var(--space-24)' : '0',
                  paddingBottom: index < subPoList.length - 1 ? 'var(--space-24)' : '0',
                  borderBottom: index < subPoList.length - 1 ? '2px solid var(--color-gray-300)' : 'none'
                }}>
                  {subPoList.length > 1 && (
                    <h4 style={{
                      color: 'var(--color-primary)',
                      marginBottom: 'var(--space-16)',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 'var(--space-8)'
                    }}>
                      <span>Heat {index + 1}: {subPo.heatNumber || subPo.heatNumbers?.[0] || ''}</span>
                      <span style={{ color: 'var(--color-gray-600)', fontWeight: 'var(--font-weight-normal)' }}>
                        Sub PO: {subPo.subPoNumber}
                      </span>
                    </h4>
                  )}
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">RAW MATERIAL NAME</label>
                      <input type="text" className="form-input" value={subPo.rawMaterialName || poData.product_name || poData.po_description || 'Raw Material'} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GRADE / SPEC</label>
                      <input type="text" className="form-input" value={subPo.grade || subPo.spec || poData.grade || 'N/A'} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">HEAT NO./ NO.S</label>
                      <input type="text" className="form-input" value={subPo.heatNumber || subPo.heatNumbers?.join(', ') || 'N/A'} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">MANUFACTURER OF STEEL BARS</label>
                      <input type="text" className="form-input" value={subPo.manufacturer || poData.manufacturer || 'N/A'} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">TC NO</label>
                      <input type="text" className="form-input" value={subPo.tcNumber || 'N/A'} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">TC DATE</label>
                      <input type="text" className="form-input" value={subPo.tcDate || 'N/A'} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SUB PO NO.</label>
                      <input type="text" className="form-input" value={subPo.subPoNumber || 'N/A'} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SUB PO DATE</label>
                      <input type="text" className="form-input" value={subPo.subPoDate || 'N/A'} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SUB PO QTY</label>
                      <input type="text" className="form-input" value={subPo.subPoQty || 'N/A'} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">INVOICE NO.</label>
                      <input type="text" className="form-input" value={subPo.invoiceNo || subPo.invoice_no || 'N/A'} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">INVOICE DATE</label>
                      <input type="text" className="form-input" value={subPo.invoiceDate || subPo.invoice_date || 'N/A'} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">OFFERED QTY</label>
                      <input type="text" className="form-input" value={subPo.offeredQty || 'N/A'} disabled />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Fallback to single sub PO display (mock data or single sub PO) */
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">RAW MATERIAL NAME</label>
                  <input type="text" className="form-input" value={subPoData.raw_material_name || 'N/A'} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">GRADE / SPEC</label>
                  <input type="text" className="form-input" value={subPoData.grade || subPoData.spec || 'N/A'} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">HEAT NO./ NO.S</label>
                  <input type="text" className="form-input" value={subPoData.heat_no || subPoData.heat_numbers || 'N/A'} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">MANUFACTURER OF STEEL BARS</label>
                  <input type="text" className="form-input" value={subPoData.manufacturer || 'N/A'} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">TC NO</label>
                  <input type="text" className="form-input" value={subPoData.tc_no || 'N/A'} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">TC DATE</label>
                  <input type="text" className="form-input" value={subPoData.tc_date || 'N/A'} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">SUB PO NO.</label>
                  <input type="text" className="form-input" value={subPoData.sub_po_no || 'N/A'} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">SUB PO DATE</label>
                  <input type="text" className="form-input" value={subPoData.sub_po_date || 'N/A'} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">INVOICE NO.</label>
                  <input type="text" className="form-input" value={subPoData.invoice_no || 'N/A'} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">INVOICE DATE</label>
                  <input type="text" className="form-input" value={subPoData.invoice_date || 'N/A'} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">SUB PO QTY</label>
                  <input type="text" className="form-input" value={subPoData.sub_po_qty || 'N/A'} disabled />
                </div>
              </div>
            )}

            {/* Place of Inspection - Common for all heats */}
            <div className="form-grid" style={{ marginTop: 'var(--space-16)', paddingTop: 'var(--space-16)', borderTop: '1px solid var(--color-gray-300)' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">PLACE OF INSPECTION</label>
                <input type="text" className="form-input" value={poData.place_of_inspection || call.place_of_inspection || 'N/A'} disabled />
              </div>
            </div>

            {/* Section C OK/Not OK Buttons */}
            <div className="section-action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-16)', paddingTop: 'var(--space-16)', borderTop: '1px solid var(--color-gray-300)' }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleSectionCReject}
                disabled={isSaving || formData.sectionCStatus === 'rejected'}
              >
                {isSaving ? 'Saving...' : formData.sectionCStatus === 'rejected' ? 'Not OK' : 'Not OK'}
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSectionCApprove}
                disabled={isSaving || formData.sectionCStatus === 'approved'}
              >
                {isSaving ? 'Saving...' : formData.sectionCStatus === 'approved' ? 'OK' : 'OK'}
              </button>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InspectionInitiationFormContent;
