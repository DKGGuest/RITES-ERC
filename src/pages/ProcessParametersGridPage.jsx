import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ProcessLineToggle from '../components/ProcessLineToggle';
import ProcessSubmoduleNav from '../components/ProcessSubmoduleNav';
import ShearingSection from '../components/sections/ShearingSection';
import TurningSection from '../components/sections/TurningSection';
import MpiSection from '../components/sections/MpiSection';
import ForgingSection from '../components/sections/ForgingSection';
import QuenchingSection from '../components/sections/QuenchingSection';
import FinalCheckSection from '../components/sections/FinalCheckSection';
import TemperingSection from '../components/sections/TemperingSection';
import {
  shearingDataService,
  turningDataService,
  mpiDataService,
  forgingDataService,
  quenchingDataService,
  temperingDataService,
  finalCheckDataService
} from '../services/processMaterialService';
import {
  saveGridDataForLine,
  loadGridDataForLine
} from '../services/processLocalStorageService';
import './ProcessParametersGridPage.css';

const ProcessParametersGridPage = ({ call, onBack, lotNumbers = [], shift: selectedShift = 'A', selectedLines = [], onNavigateSubmodule, productionLines = [], allCallOptions = [] }) => {
  const [activeLine, setActiveLine] = useState((selectedLines && selectedLines[0]) || 'Line-1');

  // Get line index for active line
  const activeLineIndex = useMemo(() => {
    return parseInt(activeLine.replace('Line-', '')) - 1;
  }, [activeLine]);

  // Get current production line data (has icNumber, poNumber structure from dashboard)
  const currentProductionLine = useMemo(() => {
    return productionLines[activeLineIndex] || null;
  }, [activeLineIndex, productionLines]);

  // Get the call data from allCallOptions based on the icNumber selected in production line
  const currentCallData = useMemo(() => {
    if (currentProductionLine?.icNumber) {
      return allCallOptions.find(c => c.call_no === currentProductionLine.icNumber) || null;
    }
    return null;
  }, [currentProductionLine, allCallOptions]);

  // Get PO number for active line
  const activeLinePoNo = useMemo(() => {
    // First try from production line (poNumber field)
    if (currentProductionLine?.poNumber) {
      return currentProductionLine.poNumber;
    }
    // Then try from call data (po_no field)
    if (currentCallData?.po_no) {
      return currentCallData.po_no;
    }
    // Fallback to main call
    return call?.po_no || '';
  }, [currentProductionLine, currentCallData, call]);

  const poNo = activeLinePoNo;

  // Get lot numbers for active line from rm_heat_tc_mapping of the selected call
  const availableLotNumbers = useMemo(() => {
    // Get rm_heat_tc_mapping from the call data (this contains lot/heat mappings)
    const rmHeatMapping = currentCallData?.rm_heat_tc_mapping || [];
    if (rmHeatMapping.length > 0) {
      return rmHeatMapping.map((mapping, idx) => mapping.subPoNumber || `LOT-${idx + 1}`);
    }
    // Fallback to passed lotNumbers or default
    return lotNumbers.length > 0 ? lotNumbers : [];
  }, [currentCallData, lotNumbers]);

  const [shearingData, setShearingData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      noProduction: false,
      lotNo: '',
      // 3 inputs for Length of Cut Bar
      lengthCutBar: ['', '', ''],
      // 3 checkboxes for Sharp Edges (stacked vertically)
      sharpEdges: [false, false, false],
      // 2 inputs for Rejected Quantity (one under Length of Cut Bar, one under No Sharp Edges)
      rejectedQty: ['', ''],
      remarks: ''
    }))
  );

  const [turningData, setTurningData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      noProduction: false,
      lotNo: '',
      straightLength: ['', '', ''],
      taperLength: ['', '', ''],
      dia: ['', '', ''],
      acceptedQty: '',
      rejectedQty: ['', ''],
      remarks: ''
    }))
  );

  // MPI Section - 8 Hour Grid
  const [mpiData, setMpiData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      noProduction: false,
      lotNo: '',
      testResults: ['', '', ''],
      rejectedQty: ['', ''],
      remarks: ''
    }))
  );

  // Forging Section - 8 Hour Grid
  const [forgingData, setForgingData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      noProduction: false,
      lotNo: '',
      forgingTemperature: ['', '', ''],
      acceptedQty: '',
      rejectedQty: '',
      remarks: ''
    }))
  );

  // Quenching Section - 8 Hour Grid
  const [quenchingData, setQuenchingData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      noProduction: false,
      lotNo: '',
      quenchingTemperature: '',
      quenchingDuration: '',
      quenchingHardness: ['', ''],
      rejectedQty: '',
      remarks: ''
    }))
  );

  // Tempering Section - 8 Hour Grid
  const [temperingData, setTemperingData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      noProduction: false,
      lotNo: '',
      temperingTemperature: '',
      temperingDuration: '',
      acceptedQty: '',
      rejectedQty: '',
      remarks: ''
    }))
  );

  // Final Check Section - 8 Hour Grid (renamed from Dimension section)
  const [finalCheckData, setFinalCheckData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      noProduction: false,
      lotNo: '',
      visualCheck: ['', ''],
      dimensionCheck: ['', ''],
      hardnessCheck: ['', ''],
      rejectedNo: ['', '', ''],
      remarks: ''
    }))
  );

  // Loading and saving states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const inspectionCallNo = currentCallData?.call_no || call?.call_no || '';

  const shift = selectedShift; // A, B, C, G - provided by parent (Section B)

  // Track previous line to save data before switching
  const prevLineRef = useRef(activeLine);
  const prevPoNoRef = useRef(poNo);

  // Flag to prevent saving during initial load (prevents overwriting data with empty state)
  const isInitialLoadComplete = useRef(false);
  const hasDataBeenModified = useRef(false);

  /**
   * Save current grid data to localStorage
   * Only saves if initial load is complete and data has been modified
   */
  const saveCurrentDataToLocalStorage = useCallback(() => {
    if (!inspectionCallNo || !poNo) {
      console.log('Cannot save - missing inspectionCallNo or poNo:', { inspectionCallNo, poNo });
      return;
    }

    // Don't save during initial load to prevent overwriting existing data with empty state
    if (!isInitialLoadComplete.current) {
      console.log('Skipping save - initial load not complete');
      return;
    }

    // Only save if data has been modified by user
    if (!hasDataBeenModified.current) {
      console.log('Skipping save - no data modifications');
      return;
    }

    console.log('Saving grid data to localStorage:', { inspectionCallNo, poNo, activeLine });
    saveGridDataForLine(inspectionCallNo, poNo, activeLine, {
      shearing: shearingData,
      turning: turningData,
      mpi: mpiData,
      forging: forgingData,
      quenching: quenchingData,
      tempering: temperingData,
      finalCheck: finalCheckData
    });
  }, [inspectionCallNo, poNo, activeLine, shearingData, turningData, mpiData, forgingData, quenchingData, temperingData, finalCheckData]);



  // Use refs to track current data and context for saving (avoids stale closure issues)
  const currentDataRef = useRef({
    shearing: shearingData,
    turning: turningData,
    mpi: mpiData,
    forging: forgingData,
    quenching: quenchingData,
    tempering: temperingData,
    finalCheck: finalCheckData
  });

  const currentContextRef = useRef({
    inspectionCallNo,
    poNo,
    activeLine
  });

  // Keep refs updated with latest data
  useEffect(() => {
    currentDataRef.current = {
      shearing: shearingData,
      turning: turningData,
      mpi: mpiData,
      forging: forgingData,
      quenching: quenchingData,
      tempering: temperingData,
      finalCheck: finalCheckData
    };
  }, [shearingData, turningData, mpiData, forgingData, quenchingData, temperingData, finalCheckData]);

  // Keep context ref updated
  useEffect(() => {
    currentContextRef.current = {
      inspectionCallNo,
      poNo,
      activeLine
    };
  }, [inspectionCallNo, poNo, activeLine]);

  // Save to localStorage when data changes (debounced 500ms for faster persistence)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveCurrentDataToLocalStorage();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [shearingData, turningData, mpiData, forgingData, quenchingData, temperingData, finalCheckData, saveCurrentDataToLocalStorage]);

  // Save to localStorage on browser refresh/close and visibility change (uses refs to avoid stale closures)
  useEffect(() => {
    const saveCurrentData = () => {
      // Only save if initial load is complete and data has been modified
      if (!isInitialLoadComplete.current || !hasDataBeenModified.current) {
        console.log('Skipping beforeunload/visibility save - no modifications or initial load incomplete');
        return;
      }

      const { inspectionCallNo: callNo, poNo: po, activeLine: line } = currentContextRef.current;
      if (callNo && po && line) {
        console.log('Saving data on beforeunload/visibilitychange:', { callNo, po, line });
        saveGridDataForLine(callNo, po, line, currentDataRef.current);
      }
    };

    const handleBeforeUnload = () => {
      saveCurrentData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveCurrentData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Save on unmount using refs
      saveCurrentData();
    };
  }, []); // Empty dependency - uses refs which always have latest values

  // Default empty data generators for each section
  const getDefaultShearingData = useCallback(() =>
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1, noProduction: false, lotNo: '',
      lengthCutBar: ['', '', ''], sharpEdges: [false, false, false],
      rejectedQty: ['', ''], remarks: ''
    })), []);

  const getDefaultTurningData = useCallback(() =>
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1, noProduction: false, lotNo: '',
      straightLength: ['', '', ''], taperLength: ['', '', ''],
      dia: ['', '', ''], acceptedQty: '', rejectedQty: ['', ''], remarks: ''
    })), []);

  const getDefaultMpiData = useCallback(() =>
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1, noProduction: false, lotNo: '',
      testResults: ['', '', ''], rejectedQty: ['', ''], remarks: ''
    })), []);

  const getDefaultForgingData = useCallback(() =>
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1, noProduction: false, lotNo: '',
      forgingTemperature: ['', '', ''], acceptedQty: '', rejectedQty: '', remarks: ''
    })), []);

  const getDefaultQuenchingData = useCallback(() =>
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1, noProduction: false, lotNo: '',
      quenchingTemperature: '', quenchingDuration: '',
      quenchingHardness: ['', ''], rejectedQty: '', remarks: ''
    })), []);

  const getDefaultTemperingData = useCallback(() =>
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1, noProduction: false, lotNo: '',
      temperingTemperature: '', temperingDuration: '',
      acceptedQty: '', rejectedQty: '', remarks: ''
    })), []);

  const getDefaultFinalCheckData = useCallback(() =>
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1, noProduction: false, lotNo: '',
      visualCheck: ['', ''], dimensionCheck: ['', ''],
      hardnessCheck: ['', ''], rejectedNo: ['', '', ''], remarks: ''
    })), []);

  /**
   * Fetch all 8-hour grid data - first from localStorage, then from backend
   * Reset to empty data if no saved data exists for the line
   */
  const fetchAllGridData = useCallback(async () => {
    if (!inspectionCallNo || !poNo) {
      console.log('fetchAllGridData: missing inspectionCallNo or poNo');
      return;
    }

    // Reset flags when loading new data
    isInitialLoadComplete.current = false;
    hasDataBeenModified.current = false;

    // Save previous line's data before loading new line (only if data was modified)
    if (prevLineRef.current && prevPoNoRef.current &&
        (prevLineRef.current !== activeLine || prevPoNoRef.current !== poNo)) {
      console.log('Saving previous line data before loading new line:', prevLineRef.current);
      // Force save when switching lines (bypass the modification check)
      saveGridDataForLine(inspectionCallNo, prevPoNoRef.current, prevLineRef.current, currentDataRef.current);
    }

    // Update refs to current line
    prevLineRef.current = activeLine;
    prevPoNoRef.current = poNo;

    console.log('fetchAllGridData: Loading data for', { inspectionCallNo, poNo, activeLine });

    // First try to load from localStorage directly
    const storedData = loadGridDataForLine(inspectionCallNo, poNo, activeLine);
    console.log('fetchAllGridData: storedData from localStorage:', storedData);

    // Check if any data exists for this line
    const hasShearing = storedData.shearing && storedData.shearing.length > 0;
    const hasTurning = storedData.turning && storedData.turning.length > 0;
    const hasMpi = storedData.mpi && storedData.mpi.length > 0;
    const hasForging = storedData.forging && storedData.forging.length > 0;
    const hasQuenching = storedData.quenching && storedData.quenching.length > 0;
    const hasTempering = storedData.tempering && storedData.tempering.length > 0;
    const hasFinalCheck = storedData.finalCheck && storedData.finalCheck.length > 0;

    console.log('fetchAllGridData: Has data flags:', {
      hasShearing, hasTurning, hasMpi, hasForging, hasQuenching, hasTempering, hasFinalCheck,
      shearingData: storedData.shearing
    });

    // Set data from localStorage if exists, otherwise reset to empty defaults
    if (hasShearing) {
      console.log('Setting shearing data from localStorage:', storedData.shearing);
      setShearingData(storedData.shearing);
    } else {
      setShearingData(getDefaultShearingData());
    }

    if (hasTurning) {
      console.log('Setting turning data from localStorage:', storedData.turning);
      setTurningData(storedData.turning);
    } else {
      setTurningData(getDefaultTurningData());
    }

    if (hasMpi) {
      setMpiData(storedData.mpi);
    } else {
      setMpiData(getDefaultMpiData());
    }

    if (hasForging) {
      setForgingData(storedData.forging);
    } else {
      setForgingData(getDefaultForgingData());
    }

    if (hasQuenching) {
      setQuenchingData(storedData.quenching);
    } else {
      setQuenchingData(getDefaultQuenchingData());
    }

    if (hasTempering) {
      setTemperingData(storedData.tempering);
    } else {
      setTemperingData(getDefaultTemperingData());
    }

    if (hasFinalCheck) {
      setFinalCheckData(storedData.finalCheck);
    } else {
      setFinalCheckData(getDefaultFinalCheckData());
    }

    const hasLocalData = hasShearing || hasTurning || hasMpi || hasForging || hasQuenching || hasTempering || hasFinalCheck;

    // Mark initial load as complete after setting state from localStorage
    // Use setTimeout to ensure this runs after React state updates
    setTimeout(() => {
      isInitialLoadComplete.current = true;
      console.log('Initial load complete for line:', activeLine);
    }, 100);

    if (hasLocalData) {
      console.log('Grid data loaded from localStorage for line:', activeLine);
      return;
    }

    // If no localStorage data, fetch from backend
    setIsLoading(true);
    try {
      const [shearing, turning, mpi, forging, quenching, tempering, finalCheck] = await Promise.allSettled([
        shearingDataService.getByPoLine(inspectionCallNo, poNo, activeLine),
        turningDataService.getByPoLine(inspectionCallNo, poNo, activeLine),
        mpiDataService.getByPoLine(inspectionCallNo, poNo, activeLine),
        forgingDataService.getByPoLine(inspectionCallNo, poNo, activeLine),
        quenchingDataService.getByPoLine(inspectionCallNo, poNo, activeLine),
        temperingDataService.getByPoLine(inspectionCallNo, poNo, activeLine),
        finalCheckDataService.getByPoLine(inspectionCallNo, poNo, activeLine)
      ]);

      // Process fetched data if available
      if (shearing.status === 'fulfilled' && shearing.value?.responseData?.length > 0) {
        console.log('Shearing data loaded from backend');
      }
      if (turning.status === 'fulfilled' && turning.value?.responseData?.length > 0) {
        console.log('Turning data loaded from backend');
      }
      if (mpi.status === 'fulfilled' && mpi.value?.responseData?.length > 0) {
        console.log('MPI data loaded from backend');
      }
      if (forging.status === 'fulfilled' && forging.value?.responseData?.length > 0) {
        console.log('Forging data loaded from backend');
      }
      if (quenching.status === 'fulfilled' && quenching.value?.responseData?.length > 0) {
        console.log('Quenching data loaded from backend');
      }
      if (tempering.status === 'fulfilled' && tempering.value?.responseData?.length > 0) {
        console.log('Tempering data loaded from backend');
      }
      if (finalCheck.status === 'fulfilled' && finalCheck.value?.responseData?.length > 0) {
        console.log('Final Check data loaded from backend');
      }
    } catch (err) {
      console.log('Using default grid data:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [inspectionCallNo, poNo, activeLine, getDefaultShearingData, getDefaultTurningData, getDefaultMpiData, getDefaultForgingData, getDefaultQuenchingData, getDefaultTemperingData, getDefaultFinalCheckData]);

  // Load data on mount and when line/PO changes
  useEffect(() => {
    fetchAllGridData();
  }, [fetchAllGridData]);

  /**
   * Transform frontend state to backend DTO format
   */
  const transformToDto = (data, hourLabels, section) => {
    return data.map((row, idx) => ({
      inspectionCallNo,
      poNo,
      lineNo: activeLine,
      shift,
      hourIndex: idx,
      hourLabel: hourLabels[idx],
      noProduction: row.noProduction,
      lotNo: row.lotNo,
      remarks: row.remarks,
      ...row // Include section-specific fields
    }));
  };

  /**
   * Save all grid data to backend
   */
  const handleSaveAll = async () => {
    if (!inspectionCallNo || !poNo) {
      alert('Missing call or PO information');
      return;
    }

    setIsSaving(true);
    try {
      // Compute hour labels for DTO
      const SHIFT_STARTS = { A: { h: 6, m: 0 }, B: { h: 14, m: 0 }, C: { h: 22, m: 0 }, G: { h: 9, m: 0 } };
      const pad = (n) => n.toString().padStart(2, '0');
      const format = (h, m) => `${((h % 12) || 12)}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
      const addHours = (h, m, dh) => ({ h: (h + dh) % 24, m });
      const s = SHIFT_STARTS[shift] || SHIFT_STARTS.A;
      const labels = [];
      for (let i = 0; i < 8; i++) {
        const start = addHours(s.h, s.m, i);
        const end = addHours(s.h, s.m, i + 1);
        labels.push(`${format(start.h, start.m)} - ${format(end.h, end.m)}`);
      }

      await Promise.all([
        shearingDataService.saveBatch(transformToDto(shearingData, labels, 'shearing')),
        turningDataService.saveBatch(transformToDto(turningData, labels, 'turning')),
        mpiDataService.saveBatch(transformToDto(mpiData, labels, 'mpi')),
        forgingDataService.saveBatch(transformToDto(forgingData, labels, 'forging')),
        quenchingDataService.saveBatch(transformToDto(quenchingData, labels, 'quenching')),
        temperingDataService.saveBatch(transformToDto(temperingData, labels, 'tempering')),
        finalCheckDataService.saveBatch(transformToDto(finalCheckData, labels, 'finalCheck'))
      ]);

      alert('All process parameters saved successfully!');
      onBack();
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Compute 8 one-hour labels based on shift
  const SHIFT_STARTS = { A: { h: 6, m: 0 }, B: { h: 14, m: 0 }, C: { h: 22, m: 0 }, G: { h: 9, m: 0 } };
  const pad = (n) => n.toString().padStart(2, '0');
  const format = (h, m) => `${((h % 12) || 12)}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
  const addHours = (h, m, dh) => ({ h: (h + dh) % 24, m });
  const shiftLabel = (() => {
    const s = SHIFT_STARTS[shift] || SHIFT_STARTS.A;
    const end = addHours(s.h, s.m, 8);
    return `${shift} (${format(s.h, s.m)} - ${format(end.h, end.m)})`;
  })();

  const hourLabels = (() => {
    const s = SHIFT_STARTS[shift] || SHIFT_STARTS.A;
    const labels = [];
    for (let i = 0; i < 8; i++) {
      const start = addHours(s.h, s.m, i);
      const end = addHours(s.h, s.m, i + 1);
      labels.push(`${format(start.h, start.m)} - ${format(end.h, end.m)}`);
    }
    return labels;
  })();
  const currentHourIndex = (() => {
    const now = new Date();
    const s = SHIFT_STARTS[shift] || SHIFT_STARTS.A;
    const base = new Date(now);
    base.setHours(s.h, s.m, 0, 0);
    // For C shift (22:00-06:00 next day), if now is after midnight but before 06:00, treat base as yesterday 22:00
    if (shift === 'C' && now.getHours() < 6) {
      base.setDate(base.getDate() - 1);
    }
    let diffMs = now.getTime() - base.getTime();
    let idx = Math.floor(diffMs / (60 * 60 * 1000));
    if (isNaN(idx) || idx < 0) idx = 0;
    if (idx > 7) idx = 7;
    return idx;
  })();

  // Per-section hour expand/collapse (current hour only vs all 8 hours)
  const [showAllShearing, setShowAllShearing] = useState(false);
  const [showAllTurning, setShowAllTurning] = useState(false);
  const [showAllMpi, setShowAllMpi] = useState(false);
  const [showAllForging, setShowAllForging] = useState(false);
  const [showAllQuenching, setShowAllQuenching] = useState(false);
  const [showAllTempering, setShowAllTempering] = useState(false);
  const [showAllDimension, setShowAllDimension] = useState(false);

  // Helper to select rows to render: all 8 hours or only the current hour (per-section)
  const visibleRows = (arr, showAll) => (
    (showAll ? arr.map((row, idx) => ({ row, idx }))
             : arr.map((row, idx) => ({ row, idx })).filter(({ idx }) => idx === currentHourIndex))
  );

  // Wrapper functions to mark data as modified when user changes data
  const handleShearingChange = useCallback((newData) => {
    hasDataBeenModified.current = true;
    setShearingData(newData);
  }, []);

  const handleTurningChange = useCallback((newData) => {
    hasDataBeenModified.current = true;
    setTurningData(newData);
  }, []);

  const handleMpiChange = useCallback((newData) => {
    hasDataBeenModified.current = true;
    setMpiData(newData);
  }, []);

  const handleForgingChange = useCallback((newData) => {
    hasDataBeenModified.current = true;
    setForgingData(newData);
  }, []);

  const handleQuenchingChange = useCallback((newData) => {
    hasDataBeenModified.current = true;
    setQuenchingData(newData);
  }, []);

  const handleTemperingChange = useCallback((newData) => {
    hasDataBeenModified.current = true;
    setTemperingData(newData);
  }, []);

  const handleFinalCheckChange = useCallback((newData) => {
    hasDataBeenModified.current = true;
    setFinalCheckData(newData);
  }, []);

  return (
    <div>
      {/* 1. Submodule Navigation - Above everything */}
      <ProcessSubmoduleNav
        currentSubmodule="process-parameters-grid"
        onNavigate={onNavigateSubmodule}
      />

      {/* 2. Line Toggle */}
      {selectedLines && selectedLines.length > 0 && (
        <ProcessLineToggle selectedLines={selectedLines} activeLine={activeLine} onChange={setActiveLine} />
      )}

      {/* 3. Heading with PO */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Process Parameters - 8 Hour Grid {poNo && <span style={{ color: '#0d9488', fontSize: 'var(--font-size-lg)' }}>- PO: {poNo}</span>}</h1>
          <p className="page-subtitle">Process Material Inspection - Hourly production data entry</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, padding: '6px 10px', border: '1px solid var(--color-gray-300)', borderRadius: '8px', background: '#fff' }}>{shiftLabel}</span>
          <button className="btn btn-outline" onClick={onBack}>
            ← Back to Process Dashboard
          </button>
        </div>
      </div>

      {/* Shearing Section */}
      <ShearingSection
        data={shearingData}
        onDataChange={handleShearingChange}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllShearing}
        onToggleShowAll={() => setShowAllShearing(v => !v)}
      />

      {/* Turning Section */}
      <TurningSection
        data={turningData}
        onDataChange={handleTurningChange}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllTurning}
        onToggleShowAll={() => setShowAllTurning(v => !v)}
      />

      {/* MPI Section - 8 Hour Grid */}
      <MpiSection
        data={mpiData}
        onDataChange={handleMpiChange}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllMpi}
        onToggleShowAll={() => setShowAllMpi(v => !v)}
      />

      {/* Forging Section - 8 Hour Grid */}
      <ForgingSection
        data={forgingData}
        onDataChange={handleForgingChange}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllForging}
        onToggleShowAll={() => setShowAllForging(v => !v)}
      />

      {/* Quenching Section - 8 Hour Grid */}
      <QuenchingSection
        data={quenchingData}
        onDataChange={handleQuenchingChange}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllQuenching}
        onToggleShowAll={() => setShowAllQuenching(v => !v)}
      />

      {/* Tempering Section - 8 Hour Grid */}
      <TemperingSection
        data={temperingData}
        onDataChange={handleTemperingChange}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllTempering}
        onToggleShowAll={() => setShowAllTempering(v => !v)}
        finalCheckData={finalCheckData}
      />

      {/* Final Check Section - 8 Hour Grid */}
      <FinalCheckSection
        data={finalCheckData}
        onDataChange={handleFinalCheckChange}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllDimension}
        onToggleShowAll={() => setShowAllDimension(v => !v)}
      />

      {isLoading && (
        <div className="alert alert-info" style={{ marginBottom: 'var(--space-16)' }}>
          Loading grid data...
        </div>
      )}

      <div style={{ marginTop: 'var(--space-24)', display: 'flex', gap: 'var(--space-16)', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button
          className="btn btn-primary"
          onClick={handleSaveAll}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
};

export default ProcessParametersGridPage;

