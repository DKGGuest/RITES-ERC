import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { formatDate } from '../utils/helpers';
import HeatNumberDetails from '../components/HeatNumberDetails';
import { fetchPoDataForSections, updateColorCode } from '../services/poDataService';
import { finishInspection } from '../services/rmInspectionService';
import { useInspection } from '../context/InspectionContext';
import { markAsWithheld } from '../services/callStatusService';
import { saveInspectionInitiation } from '../services/vendorInspectionService';
import './RawMaterialDashboard.css';

// Reason options for withheld inspection
const WITHHELD_REASONS = [
  { value: '', label: 'Select Reason *' },
  { value: 'MATERIAL_NOT_AVAILABLE', label: 'Full quantity of material not available with firm at the time of inspection' },
  { value: 'PLACE_NOT_AS_PER_PO', label: 'Place of inspection is not as per the PO' },
  { value: 'VENDOR_WITHDRAWN', label: 'Vendor has withdrawn the inspection call' },
  { value: 'ANY_OTHER', label: 'Any other' },
];

// LocalStorage keys for submodule data
const STORAGE_KEYS = {
  VISUAL_INSPECTION: 'visual_inspection_draft_data',
  DIMENSIONAL_CHECK: 'dimensional_check_draft_data',
  MATERIAL_TESTING: 'material_testing_draft_data',
  PACKING_STORAGE: 'packing_storage_draft_data',
  CALIBRATION: 'calibration_draft_data',
  MAIN_INSPECTION: 'rm_main_inspection_data'
};

// localStorage key for dashboard draft data
const DASHBOARD_DRAFT_KEY = 'rm_dashboard_draft_';

const RawMaterialDashboard = ({ call, onBack, onNavigateToSubModule, onHeatsChange, onProductModelChange, onLadleValuesChange }) => {
  // Import cache functions from context
  const {
    getRmCachedData,
    updateRmPoDataCache,
    updateRmCallDataCache,
    updateRmHeatDataCache
  } = useInspection();

  // State for fetched data from backend
  const [fetchedPoData, setFetchedPoData] = useState(null);
  const [fetchedCallData, setFetchedCallData] = useState(null);
  const [fetchedHeatData, setFetchedHeatData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(false);

  // Pre-Inspection Data Entry State
  const [sourceOfRawMaterial, setSourceOfRawMaterial] = useState('');
  const [numberOfBundles, setNumberOfBundles] = useState('');
  // Per-heat remarks: { heatNo: 'remark text', ... }
  const [heatRemarks, setHeatRemarks] = useState({});

  // Finish Inspection state
  const [isSaving, setIsSaving] = useState(false);

  // Save Draft state
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Withheld modal state
  const [showWithheldModal, setShowWithheldModal] = useState(false);
  const [withheldReason, setWithheldReason] = useState('');
  const [withheldRemarks, setWithheldRemarks] = useState('');
  const [withheldError, setWithheldError] = useState('');

  // Submodule status tracking per heat (auto-populated from localStorage)
  // Structure: { heatNo: { calibration: 'OK', visual: 'Pending', ... }, ... }
  const [heatSubmoduleStatuses, setHeatSubmoduleStatuses] = useState({});

  // Ref to prevent duplicate API calls in React StrictMode
  const hasFetchedRef = useRef(false);
  const currentCallRef = useRef(null);
  const hasLoadedDraftRef = useRef(false);

  // Fetch data from new unified PO data API with caching
  useEffect(() => {
    const fetchInspectionData = async () => {
      // Get PO number and call number
      const poNo = call?.po_no;
      const callNo = call?.call_no;

      if (!poNo || !callNo) {
        console.log('No PO number or call number found');
        setIsLoading(false);
        return;
      }

      // Reset fetch flag if call changes
      if (currentCallRef.current !== callNo) {
        hasFetchedRef.current = false;
        hasLoadedDraftRef.current = false;
        currentCallRef.current = callNo;
      }

      // Prevent duplicate API calls (especially in React StrictMode)
      if (hasFetchedRef.current) {
        console.log('⏭️ Skipping duplicate API call (already fetched for this call)');
        return;
      }

      // Mark as fetched
      hasFetchedRef.current = true;

      // ==================== PERFORMANCE OPTIMIZATION: Check Cache First ====================
      const cachedData = getRmCachedData(callNo);

      if (cachedData.isCached) {
        console.log('✅ Using cached data for call:', callNo);
        setIsLoadingFromCache(true);

        // Load saved color codes from localStorage
        const mainKey = `${STORAGE_KEYS.MAIN_INSPECTION}_${callNo}`;
        const savedData = localStorage.getItem(mainKey);
        let savedColorCodes = {};
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            savedColorCodes = parsed.heatColorCodes || {};
            console.log('📦 Loaded saved color codes from localStorage:', savedColorCodes);
          } catch (e) {
            console.error('Error parsing saved color codes:', e);
          }
        }

        // Immediately set cached data (instant load!)
        if (cachedData.poData) setFetchedPoData(cachedData.poData);
        if (cachedData.callData) setFetchedCallData(cachedData.callData);
        if (cachedData.heatData) {
          // Merge color codes into cached heat data
          const heatsWithColorCodes = cachedData.heatData.map(heat => ({
            ...heat,
            colorCode: savedColorCodes[heat.heatNo] || heat.colorCode || ''
          }));
          setFetchedHeatData(heatsWithColorCodes);
        }

        setIsLoading(false);
        setIsLoadingFromCache(false);

        // Notify parent components
        if (cachedData.heatData && onHeatsChange) {
          onHeatsChange(cachedData.heatData);
        }

        console.log('📦 Cache hit! Data loaded instantly.');
        return;
      }

      // ==================== Cache Miss: Fetch from API ====================
      try {
        setIsLoading(true);
        console.log('🌐 Cache miss. Fetching PO data from API for PO Number:', poNo, 'Call Number:', callNo);

        const response = await fetchPoDataForSections(poNo, callNo);
        console.log('Fetched PO data:', response);

        if (response) {
          // Extract first heat details if available
          const firstHeat = response.rmHeatDetails && response.rmHeatDetails.length > 0
            ? response.rmHeatDetails[0]
            : null;

          // Map PO data from new unified API
          const poData = {
            po_no: response.poNo,
            po_date: response.poDate,
            po_description: response.itemDescription || response.itemDesc,
            po_qty: response.poQty,
            po_unit: response.unit || 'MT',
            vendor_name: response.vendorName,
            contractor: response.vendorName,
            manufacturer: firstHeat?.manufacturer || response.vendorName,
            place_of_inspection: response.inspPlace || call?.place_of_inspection || 'N/A',
            amendment_no: response.maNo || 'N/A',
            amendment_date: response.maDate || 'N/A',
            vendor_contact_name: '',
            vendor_contact_phone: '',
            rm_total_offered_qty_mt: firstHeat?.offeredQty || 0,
            rm_offered_qty_erc: 0,
            // Add sub PO details from first heat
            sub_po_no: firstHeat?.subPoNumber || response.poNo,
            sub_po_date: firstHeat?.subPoDate || response.poDate,
            sub_po_qty: firstHeat?.subPoQty || response.poQty,
            product_name: response.itemDescription || response.itemDesc
          };
          setFetchedPoData(poData);
          updateRmPoDataCache(callNo, poData); // Cache it!

          // Map call details
          const callData = {
            inspectionCallNo: call?.call_no,
            typeOfCall: call?.type_of_call || 'Regular',
            desiredInspectionDate: call?.desired_inspection_date,
            status: call?.status,
            remarks: call?.remarks || '',
            qtyAlreadyInspectedRm: 0,
            qtyAlreadyInspectedProcess: 0,
            qtyAlreadyInspectedFinal: 0
          };
          setFetchedCallData(callData);
          updateRmCallDataCache(callNo, callData); // Cache it!

          // Map RM heat details to heat data format
          if (response.rmHeatDetails && response.rmHeatDetails.length > 0) {
            // Check if we have saved color codes in localStorage
            const mainKey = `${STORAGE_KEYS.MAIN_INSPECTION}_${call?.call_no}`;
            const savedData = localStorage.getItem(mainKey);
            let savedColorCodes = {};
            if (savedData) {
              try {
                const parsed = JSON.parse(savedData);
                savedColorCodes = parsed.heatColorCodes || {};
              } catch (e) {
                console.error('Error parsing saved color codes:', e);
              }
            }

            const heatsData = response.rmHeatDetails.map((heat, index) => {
              const heatNo = heat.heatNumber || '';
              return {
                id: heat.id || index + 1,
                heatNo,
                weight: heat.offeredQty || '',
                tcNo: heat.tcNumber || '',
                tcDate: heat.tcDate || '',
                manufacturerName: heat.manufacturer || '',
                invoiceNumber: heat.invoiceNumber || '',
                invoiceDate: heat.invoiceDate || '',
                subPoNumber: heat.subPoNumber || '',
                subPoDate: heat.subPoDate || '',
                subPoQty: heat.subPoQty || '',
                totalValueOfPo: '',
                tcQuantity: heat.tcQty || '',
                offeredQty: heat.offeredQty || '',
                // Restore color code from localStorage if available
                colorCode: savedColorCodes[heatNo] || ''
              };
            });
            setFetchedHeatData(heatsData);
            updateRmHeatDataCache(callNo, heatsData); // Cache it!

            // Also restore numberOfBundles, sourceOfRawMaterial, and heatRemarks from localStorage
            if (savedData) {
              try {
                const parsed = JSON.parse(savedData);
                if (parsed.numberOfBundles) setNumberOfBundles(parsed.numberOfBundles);
                if (parsed.sourceOfRawMaterial) setSourceOfRawMaterial(parsed.sourceOfRawMaterial);
                if (parsed.heatRemarks) setHeatRemarks(parsed.heatRemarks);
              } catch (e) {
                console.error('Error restoring main inspection data:', e);
              }
            }
          }

          // Extract vendor ladle chemical composition values (if available in future)
          const ladleValues = {
            percentC: null,
            percentSi: null,
            percentMn: null,
            percentS: null,
            percentP: null
          };

          // Store ladle values in context if callback provided
          if (onLadleValuesChange) {
            onLadleValuesChange(ladleValues);
          }
        }
      } catch (error) {
        console.error('Error fetching PO data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInspectionData();
    // Only depend on call identifiers, not callbacks (prevents unnecessary re-fetches)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.po_no, call?.call_no]);

  // Use fetched data from backend (stabilized)
  const poData = useMemo(() => (fetchedPoData || {}), [fetchedPoData]);

  // Use fetched heat data from backend
  const activeHeats = useMemo(() => {
    return fetchedHeatData;
  }, [fetchedHeatData]);

  // Determine product model/type from PO data — fall back to MK-III if not specified
  const productModel = useMemo(() => {
    const name = (poData.product_name || poData.po_description || '').toString();
    if (/MK-III/i.test(name) || /MK III/i.test(name)) return 'MK-III';
    if (/MK-V/i.test(name) || /MK V/i.test(name)) return 'MK-V';
    if (poData.model && /MK-III/i.test(poData.model)) return 'MK-III';
    if (poData.model && /MK-V/i.test(poData.model)) return 'MK-V';
    return 'MK-III';
  }, [poData]);

  // Sync heats and productModel to parent for submodule pages
  useEffect(() => {
    if (onHeatsChange) onHeatsChange(activeHeats);
  }, [activeHeats, onHeatsChange]);

  useEffect(() => {
    if (onProductModelChange) onProductModelChange(productModel);
  }, [productModel, onProductModelChange]);

  // Save main inspection data to localStorage when it changes
  // Note: Restoration is done during API fetch to avoid race conditions
  useEffect(() => {
    const inspectionCallNo = call?.call_no;
    if (!inspectionCallNo) return;

    const mainKey = `${STORAGE_KEYS.MAIN_INSPECTION}_${inspectionCallNo}`;
    const dataToSave = {
      numberOfBundles,
      sourceOfRawMaterial,
      heatRemarks,
      heatColorCodes: fetchedHeatData.reduce((acc, heat) => {
        if (heat.heatNo && heat.colorCode) {
          acc[heat.heatNo] = heat.colorCode;
        }
        return acc;
      }, {})
    };
    localStorage.setItem(mainKey, JSON.stringify(dataToSave));
  }, [call?.call_no, numberOfBundles, sourceOfRawMaterial, heatRemarks, fetchedHeatData]);

  // Handler for heat data changes (e.g., colorCode updates from HeatNumberDetails)
  const handleHeatsUpdate = useCallback((updatedHeats) => {
    // Update local fetchedHeatData state
    setFetchedHeatData(updatedHeats);
    // Also notify parent if needed
    if (onHeatsChange) {
      onHeatsChange(updatedHeats);
    }
  }, [onHeatsChange]);

  // Auto-calculated values using activeHeats
  const totalQuantity = useMemo(() => {
    return activeHeats.reduce((sum, heat) => sum + (parseFloat(heat.weight) || 0), 0).toFixed(2);
  }, [activeHeats]);

  const numberOfHeats = useMemo(() => {
    return activeHeats.length;
  }, [activeHeats]);

  /**
   * Calculate No. of ERC (Finished) based on product model
   * MK-V:   Weight / 0.00114 (weight per clip in MT)
   * MK-III: Weight / 0.000092 (weight per clip in MT)
   */
  const numberOfERC = useMemo(() => {
    const weightMT = parseFloat(totalQuantity) || 0;
    if (productModel === 'MK-V') {
      return Math.floor(weightMT / 0.00114);
    } else {
      // MK-III
      return Math.floor(weightMT / 0.000092);
    }
  }, [totalQuantity, productModel]);

  // (defect lists and counts handled in visual module state)

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [sourceOfRawMaterial, activeHeats, numberOfBundles]);

  /**
   * Validate calibration product values for a heat
   * Rules: C: 0.5-0.6, Si: 1.5-2.0, Mn: 0.8-1.0, P: ≤0.030, S: ≤0.030
   */
  const validateCalibrationHeat = useCallback((heatData) => {
    if (!heatData) return 'Pending';

    const { percentC, percentSi, percentMn, percentP, percentS } = heatData;
    const hasData = percentC || percentSi || percentMn || percentP || percentS;
    if (!hasData) return 'Pending';

    const c = parseFloat(percentC);
    const si = parseFloat(percentSi);
    const mn = parseFloat(percentMn);
    const p = parseFloat(percentP);
    const s = parseFloat(percentS);

    const cFail = !isNaN(c) && (c < 0.5 || c > 0.6);
    const siFail = !isNaN(si) && (si < 1.5 || si > 2.0);
    const mnFail = !isNaN(mn) && (mn < 0.8 || mn > 1.0);
    const pFail = !isNaN(p) && p > 0.030;
    const sFail = !isNaN(s) && s > 0.030;

    return (cFail || siFail || mnFail || pFail || sFail) ? 'NOT OK' : 'OK';
  }, []);

  /**
   * Validate visual inspection for a heat
   * Rules: OK if "No Defect" is selected. NOT OK if any other defect is selected.
   */
  const validateVisualHeat = useCallback((heatVisualData) => {
    if (!heatVisualData?.selectedDefects) return 'Pending';

    const selected = heatVisualData.selectedDefects;
    const hasAnySelection = Object.values(selected).some(v => v);
    if (!hasAnySelection) return 'Pending';

    // If "No Defect" is selected, it's OK
    if (selected['No Defect']) return 'OK';

    // If any other defect is selected, it's NOT OK
    const hasDefects = Object.entries(selected).some(([key, val]) => key !== 'No Defect' && val);
    return hasDefects ? 'NOT OK' : 'OK';
  }, []);

  /**
   * Validate dimensional check for a heat
   * Rules: All samples must be within tolerance (MK-III: 20.47-20.84, MK-V: 22.81-23.23)
   */
  const validateDimensionalHeat = useCallback((dimSamples, model) => {
    if (!dimSamples || !Array.isArray(dimSamples)) return 'Pending';

    // Get tolerance based on product model
    const specs = model?.toUpperCase().includes('V')
      ? { min: 22.81, max: 23.23 }
      : { min: 20.47, max: 20.84 }; // Default MK-III

    const filledSamples = dimSamples.filter(s => s?.diameter && s.diameter !== '');
    if (filledSamples.length === 0) return 'Pending';

    // Check if any sample is outside tolerance
    const hasFailure = filledSamples.some(s => {
      const val = parseFloat(s.diameter);
      return !isNaN(val) && (val < specs.min || val > specs.max);
    });

    return hasFailure ? 'NOT OK' : 'OK';
  }, []);

  /**
   * Validate material testing for a heat
   * Rules: C: 0.5-0.6, Si: 1.5-2.0, Mn: 0.8-1.0, P: ≤0.030, S: ≤0.030, GrainSize: ≥6, Decarb: ≤0.25, Inclusions A/B/C/D: ≤2.0
   */
  const validateMaterialTestHeat = useCallback((heatMaterialData) => {
    if (!heatMaterialData?.samples || !Array.isArray(heatMaterialData.samples)) return 'Pending';

    const samples = heatMaterialData.samples;
    const hasData = samples.some(s => s.c || s.si || s.mn || s.p || s.s);
    if (!hasData) return 'Pending';

    // Check each sample for failures
    const hasFailure = samples.some(sample => {
      const c = parseFloat(sample.c);
      const si = parseFloat(sample.si);
      const mn = parseFloat(sample.mn);
      const p = parseFloat(sample.p);
      const s = parseFloat(sample.s);
      const grainSize = parseFloat(sample.grainSize);
      const decarb = parseFloat(sample.decarb);
      const inclA = parseFloat(sample.inclA);
      const inclB = parseFloat(sample.inclB);
      const inclC = parseFloat(sample.inclC);
      const inclD = parseFloat(sample.inclD);

      return (
        (!isNaN(c) && (c < 0.5 || c > 0.6)) ||
        (!isNaN(si) && (si < 1.5 || si > 2.0)) ||
        (!isNaN(mn) && (mn < 0.8 || mn > 1.0)) ||
        (!isNaN(p) && p > 0.030) ||
        (!isNaN(s) && s > 0.030) ||
        (!isNaN(grainSize) && grainSize < 6) ||
        (!isNaN(decarb) && decarb > 0.25) ||
        (!isNaN(inclA) && inclA > 2.0) ||
        (!isNaN(inclB) && inclB > 2.0) ||
        (!isNaN(inclC) && inclC > 2.0) ||
        (!isNaN(inclD) && inclD > 2.0)
      );
    });

    return hasFailure ? 'NOT OK' : 'OK';
  }, []);

  /**
   * Validate packing & storage checklist - per heat
   * Rules: All checklist items must be "Yes" for OK. Any "No" = NOT OK.
   */
  const validatePackingStorage = useCallback((packingData, heatIndex) => {
    if (!packingData?.packingDataByHeat) return 'Pending';

    const heatData = packingData.packingDataByHeat[heatIndex];
    if (!heatData) return 'Pending';

    const checkItems = ['bundlingSecure', 'tagsAttached', 'labelsCorrect', 'protectionAdequate', 'storageCondition', 'moistureProtection', 'stackingProper'];

    const hasData = checkItems.some(item => heatData[item] !== '' && heatData[item] !== undefined);
    if (!hasData) return 'Pending';

    const hasNo = checkItems.some(item => heatData[item] === 'No');
    return hasNo ? 'NOT OK' : 'OK';
  }, []);

  /**
   * Compute submodule statuses per heat from localStorage data
   * Runs on mount and when activeHeats changes
   */
  useEffect(() => {
    const inspectionCallNo = call?.call_no;
    if (!inspectionCallNo || !activeHeats?.length) return;

    const computeStatuses = () => {
      const heatStatuses = {};

      // Get calibration data
      const calKey = `${STORAGE_KEYS.CALIBRATION}_${inspectionCallNo}`;
      const calRaw = localStorage.getItem(calKey);
      const calData = calRaw ? JSON.parse(calRaw) : null;

      // Get visual inspection data
      const visualKey = `${STORAGE_KEYS.VISUAL_INSPECTION}_${inspectionCallNo}`;
      const visualRaw = localStorage.getItem(visualKey);
      const visualData = visualRaw ? JSON.parse(visualRaw) : [];

      // Get dimensional check data
      const dimKey = `${STORAGE_KEYS.DIMENSIONAL_CHECK}_${inspectionCallNo}`;
      const dimRaw = localStorage.getItem(dimKey);
      const dimData = dimRaw ? JSON.parse(dimRaw) : null;

      // Get material testing data
      const matKey = `${STORAGE_KEYS.MATERIAL_TESTING}_${inspectionCallNo}`;
      const matRaw = localStorage.getItem(matKey);
      const matData = matRaw ? JSON.parse(matRaw) : null;

      // Get packing & storage data
      const packKey = `${STORAGE_KEYS.PACKING_STORAGE}_${inspectionCallNo}`;
      const packRaw = localStorage.getItem(packKey);
      const packData = packRaw ? JSON.parse(packRaw) : null;

      // Compute status for each heat
      activeHeats.forEach((heat, heatIndex) => {
        // Support both heatNo and heat_no property names
        const heatNo = heat.heatNo || heat.heat_no;
        const statuses = {
          calibration: 'Pending',
          visual: 'Pending',
          dimensional: 'Pending',
          materialTest: 'Pending',
          packing: 'Pending'
        };

        // Calibration: Find this heat's product values and validate
        if (calData?.heats && Array.isArray(calData.heats)) {
          const heatCalData = calData.heats.find(h => h.heatNo === heatNo);
          statuses.calibration = validateCalibrationHeat(heatCalData);
        }

        // Visual: Data is stored as array by index, validate with our function
        if (Array.isArray(visualData) && visualData[heatIndex]) {
          statuses.visual = validateVisualHeat(visualData[heatIndex]);
        }

        // Dimensional: Data stored as array by index with dimSamples
        if (Array.isArray(dimData?.heatDimData) && dimData.heatDimData[heatIndex]?.dimSamples) {
          statuses.dimensional = validateDimensionalHeat(dimData.heatDimData[heatIndex].dimSamples, productModel);
        }

        // Material Test: Data stored as array by index
        if (Array.isArray(matData?.materialData) && matData.materialData[heatIndex]) {
          statuses.materialTest = validateMaterialTestHeat(matData.materialData[heatIndex]);
        }

        // Packing: Per-heat checklist
        statuses.packing = validatePackingStorage(packData, heatIndex);

        heatStatuses[heatNo] = statuses;
      });

      setHeatSubmoduleStatuses(heatStatuses);
    };

    computeStatuses();

    // Listen for storage changes (when user saves data in submodules)
    const handleStorageChange = () => computeStatuses();
    window.addEventListener('storage', handleStorageChange);

    // Also re-check when component regains focus (user navigates back)
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [call?.call_no, activeHeats, productModel, validateCalibrationHeat, validateVisualHeat, validateDimensionalHeat, validateMaterialTestHeat, validatePackingStorage]);

  /**
   * Handle Finish Inspection - collect all submodule data from localStorage and save to backend
   */
  const handleFinishInspection = useCallback(async () => {
    const inspectionCallNo = call?.call_no;
    if (!inspectionCallNo) {
      alert('No inspection call number found');
      return;
    }

    setIsSaving(true);
    try {
      // Collect Visual Inspection data - stored as array per heat index
      // Structure: [{ selectedDefects: {defectName: bool}, defectCounts: {defectName: string} }, ...]
      const visualKey = `${STORAGE_KEYS.VISUAL_INSPECTION}_${inspectionCallNo}`;
      const visualRaw = localStorage.getItem(visualKey);
      let visualInspectionData = [];
      if (visualRaw) {
        const visualParsed = JSON.parse(visualRaw);
        if (Array.isArray(visualParsed)) {
          visualParsed.forEach((heatData, heatIndex) => {
            const heatNo = activeHeats[heatIndex]?.heatNo || `Heat-${heatIndex + 1}`;
            if (heatData?.selectedDefects) {
              Object.entries(heatData.selectedDefects).forEach(([defectName, isSelected]) => {
                if (isSelected) {
                  visualInspectionData.push({
                    inspectionCallNo,
                    heatNo,
                    heatIndex,
                    defectName,
                    isSelected: true,
                    defectLengthMm: heatData.defectCounts?.[defectName] || null
                  });
                }
              });
            }
          });
        }
      }

      // Collect Dimensional Check data - stored as { heatDimData: { heatNo: [samples] } }
      const dimKey = `${STORAGE_KEYS.DIMENSIONAL_CHECK}_${inspectionCallNo}`;
      const dimRaw = localStorage.getItem(dimKey);
      let dimensionalCheckData = [];
      if (dimRaw) {
        const dimParsed = JSON.parse(dimRaw);
        if (dimParsed.heatDimData) {
          Object.entries(dimParsed.heatDimData).forEach(([heatNo, samples]) => {
            const heatIndex = activeHeats.findIndex(h => h.heatNo === heatNo);
            if (Array.isArray(samples)) {
              samples.forEach((diameter, idx) => {
                if (diameter !== null && diameter !== '') {
                  dimensionalCheckData.push({
                    inspectionCallNo,
                    heatNo,
                    heatIndex: heatIndex >= 0 ? heatIndex : 0,
                    sampleNumber: idx + 1,
                    diameter: parseFloat(diameter)
                  });
                }
              });
            }
          });
        }
      }

      // Collect Material Testing data - stored as { materialData: [{ samples: [{...}] }, ...] }
      const matKey = `${STORAGE_KEYS.MATERIAL_TESTING}_${inspectionCallNo}`;
      const matRaw = localStorage.getItem(matKey);
      let materialTestingData = [];
      // Helper to safely parse decimal values
      const parseDecimal = (val) => {
        if (val === null || val === undefined || val === '') return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      };
      if (matRaw) {
        const matParsed = JSON.parse(matRaw);
        if (Array.isArray(matParsed.materialData)) {
          matParsed.materialData.forEach((heatData, heatIndex) => {
            const heatNo = activeHeats[heatIndex]?.heatNo || `Heat-${heatIndex + 1}`;
            if (heatData?.samples && Array.isArray(heatData.samples)) {
              heatData.samples.forEach((sample, sampleIdx) => {
                materialTestingData.push({
                  inspectionCallNo,
                  heatNo,
                  heatIndex,
                  sampleNumber: sampleIdx + 1,
                  carbonPercent: parseDecimal(sample.c),
                  siliconPercent: parseDecimal(sample.si),
                  manganesePercent: parseDecimal(sample.mn),
                  phosphorusPercent: parseDecimal(sample.p),
                  sulphurPercent: parseDecimal(sample.s),
                  grainSize: parseDecimal(sample.grainSize),
                  hardnessHrc: parseDecimal(sample.hardness),
                  decarbDepthMm: parseDecimal(sample.decarb),
                  inclusionTypeA: sample.inclTypeA || null,
                  inclusionA: parseDecimal(sample.inclA),
                  inclusionTypeB: sample.inclTypeB || null,
                  inclusionB: parseDecimal(sample.inclB),
                  inclusionTypeC: sample.inclTypeC || null,
                  inclusionC: parseDecimal(sample.inclC),
                  inclusionTypeD: sample.inclTypeD || null,
                  inclusionD: parseDecimal(sample.inclD),
                  remarks: sample.remarks || null
                });
              });
            }
          });
        }
      }

      // Collect Packing & Storage data - per heat
      const packKey = `${STORAGE_KEYS.PACKING_STORAGE}_${inspectionCallNo}`;
      const packRaw = localStorage.getItem(packKey);
      let packingStorageData = [];
      if (packRaw) {
        const packParsed = JSON.parse(packRaw);
        if (packParsed.packingDataByHeat) {
          // Convert per-heat object to array
          Object.keys(packParsed.packingDataByHeat).forEach(heatIdx => {
            const heatData = packParsed.packingDataByHeat[heatIdx];
            const heat = activeHeats[parseInt(heatIdx)];
            if (heat) {
              packingStorageData.push({
                inspectionCallNo,
                heatNo: heat.heatNo,
                heatIndex: parseInt(heatIdx),
                bundlingSecure: heatData.bundlingSecure || null,
                tagsAttached: heatData.tagsAttached || null,
                labelsCorrect: heatData.labelsCorrect || null,
                protectionAdequate: heatData.protectionAdequate || null,
                storageCondition: heatData.storageCondition || null,
                moistureProtection: heatData.moistureProtection || null,
                stackingProper: heatData.stackingProper || null,
                remarks: heatData.remarks || null
              });
            }
          });
        }
      }

      // Collect Calibration Documents data
      const calKey = `${STORAGE_KEYS.CALIBRATION}_${inspectionCallNo}`;
      const calRaw = localStorage.getItem(calKey);
      let calibrationDocumentsData = [];
      if (calRaw) {
        const calParsed = JSON.parse(calRaw);
        // Structure: { rdsoApprovalValidity: {...}, heats: [{heatNo, percentC, percentSi, ...}], gaugesAvailable, vendorVerification: {...} }
        if (calParsed.heats && Array.isArray(calParsed.heats)) {
          calParsed.heats.forEach((heat, idx) => {
            calibrationDocumentsData.push({
              inspectionCallNo,
              heatNo: heat.heatNo || activeHeats[idx]?.heatNo || `Heat-${idx + 1}`,
              heatIndex: idx,
              rdsoApprovalId: calParsed.rdsoApprovalValidity?.approvalId || null,
              rdsoValidFrom: calParsed.rdsoApprovalValidity?.validFrom || null,
              rdsoValidTo: calParsed.rdsoApprovalValidity?.validTo || null,
              gaugesAvailable: calParsed.gaugesAvailable || false,
              ladleCarbonPercent: parseDecimal(heat.percentC),
              ladleSiliconPercent: parseDecimal(heat.percentSi),
              ladleManganesePercent: parseDecimal(heat.percentMn),
              ladlePhosphorusPercent: parseDecimal(heat.percentP),
              ladleSulphurPercent: parseDecimal(heat.percentS),
              vendorVerified: calParsed.vendorVerification?.verified || false,
              verifiedBy: calParsed.vendorVerification?.verifiedBy || null,
              verifiedAt: calParsed.vendorVerification?.verifiedAt || null
            });
          });
        }
      }

      // Collect pre-inspection data (heats, weights, bundles)
      const preInspectionData = {
        inspectionCallNo,
        totalHeatsOffered: activeHeats.length,
        totalQtyOfferedMt: activeHeats.reduce((sum, h) => sum + (parseFloat(h.weight) || 0), 0),
        numberOfBundles: numberOfBundles ? parseInt(numberOfBundles) : null,
        numberOfErc: numberOfERC || null,
        productModel: productModel || null,
        poNo: poData?.po_no || null,
        poDate: poData?.po_date || null,
        vendorName: poData?.vendor_name || null,
        placeOfInspection: poData?.place_of_inspection || null,
        sourceOfRawMaterial: sourceOfRawMaterial || null
      };

      // Collect final results per heat (status, weights, remarks) + all heat pre-inspection data
      const heatFinalResults = activeHeats.map((heat, heatIndex) => {
        const heatNo = heat.heatNo || heat.heat_no;
        const heatStatuses = heatSubmoduleStatuses[heatNo] || {
          calibration: 'Pending',
          visual: 'Pending',
          dimensional: 'Pending',
          materialTest: 'Pending',
          packing: 'Pending'
        };
        const hasNotOk = Object.values(heatStatuses).some(s => s === 'NOT OK');
        const allOk = Object.values(heatStatuses).every(s => s === 'OK');
        const isAccepted = allOk && !hasNotOk;
        const isRejected = hasNotOk;
        const weight = parseFloat(heat.weight) || parseFloat(heat.offeredQty) || 0;

        return {
          inspectionCallNo,
          heatIndex,
          heatNo,
          // Heat Pre-Inspection Data (from vendor call / HeatNumberDetails)
          tcNo: heat.tcNo || null,
          tcDate: heat.tcDate || null,
          manufacturerName: heat.manufacturerName || null,
          invoiceNumber: heat.invoiceNumber || null,
          invoiceDate: heat.invoiceDate || null,
          subPoNumber: heat.subPoNumber || null,
          subPoDate: heat.subPoDate || null,
          subPoQty: parseDecimal(heat.subPoQty),
          totalValueOfPo: heat.totalValueOfPo || null,
          tcQuantity: parseDecimal(heat.tcQuantity),
          offeredQty: parseDecimal(heat.offeredQty),
          colorCode: heat.colorCode || null, // Manual entry by inspector
          // Final Inspection Status
          status: isRejected ? 'REJECTED' : isAccepted ? 'ACCEPTED' : 'PENDING',
          weightOfferedMt: weight,
          weightAcceptedMt: isAccepted ? weight : 0,
          weightRejectedMt: isRejected ? weight : 0,
          // Per-Submodule Status
          calibrationStatus: heatStatuses.calibration,
          visualStatus: heatStatuses.visual,
          dimensionalStatus: heatStatuses.dimensional,
          materialTestStatus: heatStatuses.materialTest,
          packingStatus: heatStatuses.packing,
          remarks: heatRemarks[heatNo] || null
        };
      });

      // Build the complete payload
      const payload = {
        inspectionCallNo,
        preInspectionData,
        heatFinalResults,
        visualInspectionData,
        dimensionalCheckData,
        materialTestingData,
        packingStorageData,
        calibrationDocumentsData,
        inspectorDetails: {
          finishedBy: localStorage.getItem('username') || 'IE_USER',
          finishedAt: new Date().toISOString(),
          inspectionDate: sessionStorage.getItem('inspectionDate') || new Date().toISOString().split('T')[0],
          shiftOfInspection: sessionStorage.getItem('inspectionShift') || null
        }
      };

      // Debug: Log what we're sending
      console.log('Finish Inspection Payload:', JSON.stringify(payload, null, 2));

      // Step 1: Update color codes for all heats before saving inspection
      console.log('Updating color codes for heats...');
      const colorCodeUpdatePromises = activeHeats
        .filter(heat => heat.colorCode && heat.colorCode.trim() !== '') // Only update if color code is provided
        .map(heat => {
          const heatId = heat.id; // Heat ID from rm_heat_quantities table
          const colorCode = heat.colorCode;
          console.log(`Updating color code for heat ID ${heatId}: ${colorCode}`);
          return updateColorCode(heatId, colorCode).catch(err => {
            console.error(`Failed to update color code for heat ${heatId}:`, err);
            // Don't throw - continue with other updates
            return null;
          });
        });

      // Wait for all color code updates to complete
      await Promise.all(colorCodeUpdatePromises);
      console.log('Color codes updated successfully');

      // Step 2: Call the backend API to save inspection data
      await finishInspection(payload);

      // Clear localStorage after successful save
      localStorage.removeItem(visualKey);
      localStorage.removeItem(dimKey);
      localStorage.removeItem(matKey);
      localStorage.removeItem(packKey);
      localStorage.removeItem(calKey);

      alert('Raw Material Inspection completed successfully!');
      onBack();
    } catch (error) {
      console.error('Error finishing inspection:', error);
      alert(`Failed to save inspection data: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [call?.call_no, activeHeats, onBack, numberOfBundles, numberOfERC, sourceOfRawMaterial, poData, productModel, heatSubmoduleStatuses, heatRemarks]);

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

      // Raw Material: Call real API
      await saveInspectionInitiation(actionData);

      // Mark call as withheld in local storage
      markAsWithheld(call?.call_no, withheldRemarks.trim());

      // Clear all inspection data from localStorage
      const inspectionCallNo = call?.call_no;
      if (inspectionCallNo) {
        const visKey = `${STORAGE_KEYS.VISUAL_INSPECTION}_${inspectionCallNo}`;
        const dimKey = `${STORAGE_KEYS.DIMENSIONAL_CHECK}_${inspectionCallNo}`;
        const matKey = `${STORAGE_KEYS.MATERIAL_TESTING}_${inspectionCallNo}`;
        const packKey = `${STORAGE_KEYS.PACKING_STORAGE}_${inspectionCallNo}`;
        const calKey = `${STORAGE_KEYS.CALIBRATION}_${inspectionCallNo}`;
        const mainKey = `${STORAGE_KEYS.MAIN_INSPECTION}_${inspectionCallNo}`;

        localStorage.removeItem(visKey);
        localStorage.removeItem(dimKey);
        localStorage.removeItem(matKey);
        localStorage.removeItem(packKey);
        localStorage.removeItem(calKey);
        localStorage.removeItem(mainKey);
      }

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

  // Save Draft handler
  const handleSaveDraft = useCallback(() => {
    const inspectionCallNo = call?.call_no;
    if (!inspectionCallNo) {
      alert('Cannot save draft: No inspection call number found');
      return;
    }

    setIsSavingDraft(true);

    try {
      // Collect all dashboard form data
      const draftData = {
        savedAt: new Date().toISOString(),
        numberOfBundles: numberOfBundles,
        sourceOfRawMaterial: sourceOfRawMaterial,
        heatRemarks: heatRemarks,
        // Save heat color codes
        heatColorCodes: fetchedHeatData.reduce((acc, heat) => {
          if (heat.heatNo && heat.colorCode) {
            acc[heat.heatNo] = heat.colorCode;
          }
          return acc;
        }, {})
      };

      // Save to localStorage with inspection call number as key
      const storageKey = `${DASHBOARD_DRAFT_KEY}${inspectionCallNo}`;
      localStorage.setItem(storageKey, JSON.stringify(draftData));

      // Also save to main inspection data key (for color codes)
      const mainKey = `${STORAGE_KEYS.MAIN_INSPECTION}_${inspectionCallNo}`;
      localStorage.setItem(mainKey, JSON.stringify(draftData));

      alert(`✅ Draft saved successfully at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('Error saving draft:', error);
      alert(`Failed to save draft: ${error.message}`);
    } finally {
      setIsSavingDraft(false);
    }
  }, [call?.call_no, numberOfBundles, sourceOfRawMaterial, heatRemarks, fetchedHeatData]);

  // Load draft data from localStorage on mount (after heat data is loaded)
  useEffect(() => {
    const inspectionCallNo = call?.call_no;
    if (!inspectionCallNo || fetchedHeatData.length === 0 || hasLoadedDraftRef.current) return;

    // Mark as loaded to prevent re-running
    hasLoadedDraftRef.current = true;

    try {
      const storageKey = `${DASHBOARD_DRAFT_KEY}${inspectionCallNo}`;
      const savedDraft = localStorage.getItem(storageKey);

      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        console.log('📦 Loading draft data from localStorage:', draftData);

        // Restore form data
        if (draftData.numberOfBundles) setNumberOfBundles(draftData.numberOfBundles);
        if (draftData.sourceOfRawMaterial) setSourceOfRawMaterial(draftData.sourceOfRawMaterial);
        if (draftData.heatRemarks) setHeatRemarks(draftData.heatRemarks);

        // Restore color codes to heat data
        if (draftData.heatColorCodes && Object.keys(draftData.heatColorCodes).length > 0) {
          const heatsWithColorCodes = fetchedHeatData.map(heat => ({
            ...heat,
            colorCode: draftData.heatColorCodes[heat.heatNo] || heat.colorCode || ''
          }));
          setFetchedHeatData(heatsWithColorCodes);
          console.log('✅ Restored color codes to heat data');
        }

        console.log('✅ Draft data loaded successfully');
      }
    } catch (error) {
      console.error('Error loading draft data:', error);
    }
  }, [call?.call_no, fetchedHeatData]);

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <div className="rm-dashboard-container">
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-32)' }}>
          <p>{isLoadingFromCache ? '📦 Loading from cache...' : '🌐 Loading inspection data...'}</p>
        </div>
      </div>
    );
  }

  // Get call details for display
  const callNo = fetchedCallData?.inspectionCallNo || call?.call_no || 'N/A';
  // Read shift and date from sessionStorage (saved during Initiation) or fallback to fetched data
  const shiftOfInspection = sessionStorage.getItem('inspectionShift') || fetchedCallData?.shiftOfInspection || 'N/A';
  const dateOfInspection = sessionStorage.getItem('inspectionDate') || fetchedCallData?.dateOfInspection || 'N/A';

  return (
    <div className="rm-dashboard-container">
      <div className="breadcrumb">
        <div className="breadcrumb-item" onClick={onBack} style={{ cursor: 'pointer' }}>Landing Page</div>
        <span className="breadcrumb-separator">/</span>
        <div className="breadcrumb-item">Inspection Initiation</div>
        <span className="breadcrumb-separator">/</span>
        <div className="breadcrumb-item breadcrumb-active">ERC Raw Material</div>
      </div>

      {/* <div className="rm-page-header">
        <h1>ERC Raw Material Inspection - {callNo}</h1>
        <button className="rm-back-button" onClick={onBack}>
          ← Back to Landing Page
        </button>
      </div> */}

      {/* Inspection Call Info Banner */}
      <div className="card" style={{ background: 'var(--color-primary-light)', marginBottom: 'var(--space-16)', padding: 'var(--space-16)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-24)', flexWrap: 'wrap' }}>
          <div><strong>Call No:</strong> {callNo}</div>
          <div><strong>Shift:</strong> {shiftOfInspection}</div>
          <div><strong>Date of Inspection:</strong> {dateOfInspection}</div>
        </div>
      </div>

      {/* Header with Static Data */}
      <div className="card" style={{ background: 'var(--color-gray-100)', marginBottom: 'var(--space-24)' }}>
        <div className="card-header rm-card-header">
          <h3 className="card-title rm-card-title">Inspection Details </h3>
          <p className="card-subtitle">Auto-fetched from PO/Sub PO information</p>
        </div>
        <div className="rm-form-grid">
          <div className="rm-form-group">
            <label className="rm-form-label">PO Number</label>
            <input type="text" className="rm-form-input" value={poData.po_no || poData.sub_po_no} disabled />
          </div>
          <div className="rm-form-group">
            <label className="rm-form-label">PO Date</label>
            <input type="text" className="rm-form-input" value={formatDate(poData.po_date || poData.sub_po_date)} disabled />
          </div>
          <div className="rm-form-group">
            <label className="rm-form-label">Contractor Name</label>
            <input type="text" className="rm-form-input" value={poData.contractor || poData.vendor_name} disabled />
          </div>
          <div className="rm-form-group">
            <label className="rm-form-label">Manufacturer</label>
            <input type="text" className="rm-form-input" value={poData.manufacturer} disabled />
          </div>
          <div className="rm-form-group">
            <label className="rm-form-label">Place of Inspection</label>
            <input type="text" className="rm-form-input" value={poData.place_of_inspection} disabled />
          </div>
          <div className="rm-form-group">
            <label className="rm-form-label">Stage of Inspection</label>
            <input type="text" className="rm-form-input" value="Raw Material Inspection" disabled />
          </div>
        </div>
      </div>

      {/* Pre-Inspection Data Entry */}
      <div className="card" style={{ marginBottom: 'var(--space-24)' }}>
        <div className="card-header rm-card-header">
          <h3 className="card-title rm-card-title">Pre-Inspection Data Entry</h3>
          {/* <p className="card-subtitle">Heat data from vendor call + cumulative inspection summary</p> */}
        </div>

        {/* Section 1: Heat Data from Vendor Call (with Color Code manual entry) */}
        <HeatNumberDetails heats={activeHeats} onHeatsChange={handleHeatsUpdate} />

        {/* Section 2: Cumulative Data Summary - Single Row */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#166534' }}>
            📊 Cumulative Data Summary
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            {/* Total Heats Offered */}
            <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
              <label className="rm-form-label" style={{ fontSize: '12px' }}>Total Heats Offered</label>
              <input type="text" className="rm-form-input" value={numberOfHeats} disabled style={{ height: '38px' }} />
            </div>

            {/* Total Qty Offered */}
            <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
              <label className="rm-form-label" style={{ fontSize: '12px' }}>Total Qty Offered (MT)</label>
              <input type="text" className="rm-form-input" value={totalQuantity} disabled style={{ height: '38px' }} />
            </div>

            {/* No. of Bundles */}
            <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
              <label className="rm-form-label required" style={{ fontSize: '12px' }}>No. of Bundles</label>
              <input
                type="number"
                className="rm-form-input"
                value={numberOfBundles}
                onChange={(e) => setNumberOfBundles(e.target.value)}
                placeholder="Enter"
                style={{ backgroundColor: '#ffffff', height: '38px' }}
                required
              />
            </div>

            {/* No. of ERC */}
            <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
              <label className="rm-form-label" style={{ fontSize: '12px' }}>No. of ERC (Finished)</label>
              <input type="text" className="rm-form-input" value={numberOfERC.toLocaleString()} disabled style={{ height: '38px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Sub Module Session */}
      <div className="submodule-session">
        <div className="submodule-session-header">
          <h3 className="submodule-session-title">📋 Sub Module Session</h3>
          <p className="submodule-session-subtitle">Select a module to proceed with inspection</p>
        </div>
        <div className="submodule-buttons">
          <button className="submodule-btn" onClick={() => onNavigateToSubModule('calibration-documents')}>
            <span className="submodule-btn-icon">📄</span>
            <p className="submodule-btn-title">Calibration & Documents</p>
            <p className="submodule-btn-desc">Verify instrument calibration</p>
          </button>
          <button className="submodule-btn" onClick={() => onNavigateToSubModule('visual-inspection')}>
            <span className="submodule-btn-icon">👁️</span>
            <p className="submodule-btn-title">Visual Inspection</p>
            <p className="submodule-btn-desc">Visual check & defects</p>
          </button>
          <button className="submodule-btn" onClick={() => onNavigateToSubModule('dimensional-check')}>
            <span className="submodule-btn-icon">📐</span>
            <p className="submodule-btn-title">Dimensional Check</p>
            <p className="submodule-btn-desc">Check bar dimensions</p>
          </button>
          <button className="submodule-btn" onClick={() => onNavigateToSubModule('material-testing')}>
            <span className="submodule-btn-icon">🧪</span>
            <p className="submodule-btn-title">Material Testing</p>
            <p className="submodule-btn-desc">Chemical & mechanical tests</p>
          </button>
          <button className="submodule-btn" onClick={() => onNavigateToSubModule('packing-storage')}>
            <span className="submodule-btn-icon">📦</span>
            <p className="submodule-btn-title">Packing & Storage</p>
            <p className="submodule-btn-desc">Verify packing conditions</p>
          </button>
          <button className="submodule-btn" onClick={() => onNavigateToSubModule('summary-reports')}>
            <span className="submodule-btn-icon">📊</span>
            <p className="submodule-btn-title">Summary and Reports</p>
            <p className="submodule-btn-desc">View consolidated results</p>
          </button>
        </div>
      </div>

      {/* Post Inspection Session - Always visible at bottom of page */}
      <div className="card" style={{ marginTop: '32px', borderTop: '4px solid var(--color-primary)' }}>
        {/* <div className="card-header rm-card-header" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
          <h3 className="card-title rm-card-title" style={{ fontSize: '20px', color: '#0369a1' }}>🔍 Post Inspection Session</h3>
          <p className="card-subtitle" style={{ color: '#0284c7' }}>Final results and decision for the inspection</p>
        </div> */}

        {/* Final Results - Raw Material - One Block Per Heat */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Final Inspection Results</h4>

          {/* Heat Blocks - Each heat has its own section with status tags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeHeats.map((heat) => {
              const heatNo = heat.heatNo || heat.heat_no;
              const heatStatuses = heatSubmoduleStatuses[heatNo] || {
                calibration: 'Pending',
                visual: 'Pending',
                dimensional: 'Pending',
                materialTest: 'Pending',
                packing: 'Pending'
              };

              // Determine overall heat status
              const hasNotOk = Object.values(heatStatuses).some(s => s === 'NOT OK');
              const allOk = Object.values(heatStatuses).every(s => s === 'OK');
              const isAccepted = allOk && !hasNotOk;
              const isRejected = hasNotOk;

              // Container styling based on status
              const containerBg = isRejected ? '#fef2f2' : isAccepted ? '#f0fdf4' : '#fffbeb';
              const containerBorder = isRejected ? '#fecaca' : isAccepted ? '#bbf7d0' : '#fde68a';

              return (
                <div
                  key={heatNo}
                  style={{
                    background: containerBg,
                    border: `1px solid ${containerBorder}`,
                    borderRadius: '8px',
                    padding: '16px'
                  }}
                >
                  {/* Submodule Status Tags Row */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '16px'
                  }}>
                    {[
                      { key: 'calibration', label: 'Calibration' },
                      { key: 'visual', label: 'Visual' },
                      { key: 'dimensional', label: 'Dimensional' },
                      { key: 'materialTest', label: 'Material Test' },
                      { key: 'packing', label: 'Packing' }
                    ].map(({ key, label }) => {
                      const status = heatStatuses[key];
                      const isOk = status === 'OK';
                      const isNotOk = status === 'NOT OK';

                      return (
                        <span
                          key={key}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: isOk ? '#dcfce7' : isNotOk ? '#fee2e2' : '#fef3c7',
                            color: isOk ? '#166534' : isNotOk ? '#991b1b' : '#92400e',
                            border: `1px solid ${isOk ? '#86efac' : isNotOk ? '#fca5a5' : '#fcd34d'}`
                          }}
                        >
                          {label}: {status}
                        </span>
                      );
                    })}
                  </div>

                  {/* Heat Details Row - Single Row Layout */}
                  <div
                    className="heat-details-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: '12px',
                      alignItems: 'end'
                    }}
                  >
                    {/* Heat No. */}
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Heat No.</span>
                      <strong style={{ fontSize: '14px', color: '#1e293b' }}>{heatNo}</strong>
                    </div>

                    {/* Status */}
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Status</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 600,
                          background: isRejected ? '#fee2e2' : isAccepted ? '#dcfce7' : '#fef3c7',
                          color: isRejected ? '#991b1b' : isAccepted ? '#166534' : '#92400e'
                        }}>
                          {isRejected ? 'Invalid' : isAccepted ? 'Valid' : 'Pending'}
                        </span>
                        <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
                          {isRejected ? 'Rejected' : isAccepted ? 'Accepted' : 'Pending'}
                        </span>
                      </span>
                    </div>

                    {/* Weight Offered */}
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Wt. Offered (Tons)</span>
                      <strong style={{ fontSize: '14px', color: '#1e293b' }}>{heat.weight || '—'}</strong>
                    </div>

                    {/* Weight Accepted */}
                    <div>
                      <span style={{ fontSize: '11px', color: '#16a34a', display: 'block', marginBottom: '4px' }}>Wt. Accepted (Tons)</span>
                      <strong style={{ fontSize: '14px', color: '#16a34a' }}>
                        {isAccepted ? (heat.weight || '—') : '0'}
                      </strong>
                    </div>

                    {/* Weight Rejected */}
                    <div>
                      <span style={{ fontSize: '11px', color: '#dc2626', display: 'block', marginBottom: '4px' }}>Wt. Rejected (Tons)</span>
                      <strong style={{ fontSize: '14px', color: '#dc2626' }}>
                        {isRejected ? (heat.weight || '—') : '0'}
                      </strong>
                    </div>

                    {/* Remarks */}
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Remarks (Required)</span>
                      <input
                        type="text"
                        className="rm-form-input"
                        placeholder="Enter remarks..."
                        value={heatRemarks[heat.heatNo] || ''}
                        onChange={(e) => setHeatRemarks(prev => ({ ...prev, [heat.heatNo]: e.target.value }))}
                        required
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', height: '32px' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Responsive styles for heat details grid */}
          <style>{`
            @media (max-width: 1024px) {
              .heat-details-grid {
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 16px !important;
              }
            }
            @media (max-width: 768px) {
              .heat-details-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 12px !important;
              }
            }
            @media (max-width: 480px) {
              .heat-details-grid {
                grid-template-columns: 1fr 1fr !important;
                gap: 10px !important;
              }
            }
          `}</style>
        </div>

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
          <button className="btn btn-outline">Pause Inspection</button>
          <button className="btn btn-outline" onClick={handleOpenWithheldModal}>Withheld Inspection</button>
          <button
            className="btn btn-primary"
            onClick={handleFinishInspection}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Finish Inspection'}
          </button>
        </div>
      </div>

      <div className="rm-action-buttons" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <button className="rm-back-button" onClick={onBack} style={{ maxWidth: '300px' }}>
          ← Return to Landing Page
        </button>
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

export default RawMaterialDashboard;
