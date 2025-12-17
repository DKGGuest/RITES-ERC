import { useState } from 'react';
import ProcessLineToggle from '../components/ProcessLineToggle';
import ProcessSubmoduleNav from '../components/ProcessSubmoduleNav';
import ShearingSection from '../components/sections/ShearingSection';
import TurningSection from '../components/sections/TurningSection';
import MpiSection from '../components/sections/MpiSection';
import ForgingSection from '../components/sections/ForgingSection';
import QuenchingSection from '../components/sections/QuenchingSection';
import FinalCheckSection from '../components/sections/FinalCheckSection';
import TemperingSection from '../components/sections/TemperingSection';
import './ProcessParametersGridPage.css';

const ProcessParametersGridPage = ({ onBack, lotNumbers = [], shift: selectedShift = 'A', selectedLines = [], onNavigateSubmodule }) => {
  // Use lot numbers from main module (auto populated from Main Module)
  const availableLotNumbers = lotNumbers.length > 0 ? lotNumbers : ['LOT-001', 'LOT-002', 'LOT-003'];

  const [activeLine, setActiveLine] = useState((selectedLines && selectedLines[0]) || 'Line-1');

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

  // Product type for validation (can be changed based on selection)
  const [productType, setProductType] = useState('MK-III'); // Options: MK-III, MK-V, ERC-J

  const shift = selectedShift; // A, B, C, G - provided by parent (Section B)

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

  // Section collapse/expand states
  const [turningExpanded] = useState(true);
  const [mpiExpanded] = useState(true);
  const [forgingExpanded] = useState(true);
  const [quenchingExpanded] = useState(true);
  const [temperingExpanded] = useState(true);
  const [dimensionExpanded] = useState(true);


  // Helper to select rows to render: all 8 hours or only the current hour (per-section)

  // Per-section hour expand/collapse (current hour only vs all 8 hours)
  const [showAllShearing, setShowAllShearing] = useState(false);
  const [showAllTurning, setShowAllTurning] = useState(false);
  const [showAllMpi, setShowAllMpi] = useState(false);
  const [showAllForging, setShowAllForging] = useState(false);
  const [showAllQuenching, setShowAllQuenching] = useState(false);
  const [showAllTempering, setShowAllTempering] = useState(false);
  const [showAllDimension, setShowAllDimension] = useState(false);

  const visibleRows = (arr, showAll) => (
    (showAll ? arr.map((row, idx) => ({ row, idx }))
             : arr.map((row, idx) => ({ row, idx })).filter(({ idx }) => idx === currentHourIndex))
  );

  const updateTurningData = (index, field, value, sampleIndex = null) => {
    const updated = [...turningData];
    if (sampleIndex !== null && Array.isArray(updated[index][field])) {
      const fieldArray = [...updated[index][field]];
      fieldArray[sampleIndex] = value;
      updated[index][field] = fieldArray;
    } else {
      updated[index][field] = value;
    }
    setTurningData(updated);
  };

  const updateMpiData = (index, field, value, sampleIndex = null) => {
    const updated = [...mpiData];
    if (sampleIndex !== null && Array.isArray(updated[index][field])) {
      const fieldArray = [...updated[index][field]];
      fieldArray[sampleIndex] = value;
      updated[index][field] = fieldArray;
    } else {
      updated[index][field] = value;
    }
    setMpiData(updated);
  };

  const updateForgingData = (index, field, value, sampleIndex = null) => {
    const updated = [...forgingData];
    if (sampleIndex !== null && Array.isArray(updated[index][field])) {
      const fieldArray = [...updated[index][field]];
      fieldArray[sampleIndex] = value;
      updated[index][field] = fieldArray;
    } else {
      updated[index][field] = value;
    }
    setForgingData(updated);
  };

  const updateQuenchingData = (index, field, value) => {
    const updated = [...quenchingData];
    updated[index][field] = value;
    setQuenchingData(updated);
  };

  const updateTemperingData = (index, field, value) => {
    const updated = [...temperingData];
    updated[index][field] = value;
    setTemperingData(updated);
  };

  const updateDimensionData = (index, field, value) => {
    const updated = [...finalCheckData];
    updated[index][field] = value;
    setFinalCheckData(updated);
  };

  // Validation helpers
  const getQuenchingTempValidation = (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (num >= 70) return { error: true, message: 'Must be < 70°C' };
    return { error: false, message: '✓ Valid' };
  };

  const getQuenchingDurationValidation = (value) => {
    if (!value) return null;
    const num = parseInt(value);
    if (num <= 12) return { error: true, message: 'Must be > 12 min' };
    return { error: false, message: '✓ Valid' };
  };

  const getQuenchingHardnessValidation = (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (num < 45 || num > 55) return { error: true, message: 'Must be 45-55 HRc' };

    return { error: false, message: '✓ Valid' };
  };

  // Dimension grid validation helpers
  const getFinalHardnessValidation = (value) => {
    if (!value) return null;
    const num = parseInt(value);
    if (num < 40 || num > 44) return { error: true, message: 'Must be 40-44 HRc' };
    return { error: false, message: '✓ Valid' };
  };

  const getToeLoadValidation = (value, type) => {
    if (!value) return null;
    const num = parseInt(value);
    switch (type) {
      case 'MK-III':
        if (num < 850 || num > 1100) return { error: true, message: 'MK-III: 850-1100 KgF' };
        break;
      case 'MK-V':
        if (num < 1200 || num > 1500) return { error: true, message: 'MK-V: 1200-1500 KgF' };
        break;
      case 'ERC-J':
        if (num < 650) return { error: true, message: 'ERC-J: ≥650 KgF' };
        break;
      default:
        return null;
    }
    return { error: false, message: '✓ Valid' };
  };

  const getWeightValidation = (value, type) => {
    if (!value) return null;
    const num = parseFloat(value);
    switch (type) {
      case 'MK-III':
        if (num < 904) return { error: true, message: 'MK-III: ≥904 gm' };
        break;
      case 'MK-V':
        if (num < 1068) return { error: true, message: 'MK-V: ≥1068 gm' };
        break;
      case 'ERC-J':
        if (num < 904) return { error: true, message: 'ERC-J: ≥904 gm' };
        break;
      default:
        return null;
    }
    return { error: false, message: '✓ Valid' };
  };

  // Check if tempering temp/duration was entered in first hour (Once/Shift rule)
  const isTemperingTempTakenInFirstHour = temperingData[0].temperingTemperature !== '';
  const isTemperingDurationTakenInFirstHour = temperingData[0].temperingDuration !== '';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Process Parameters - 8 Hour Grid</h1>
          <p className="page-subtitle">Process Material Inspection - Hourly production data entry</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, padding: '6px 10px', border: '1px solid var(--color-gray-300)', borderRadius: '8px', background: '#fff' }}>{shiftLabel}</span>
          <button className="btn btn-outline" onClick={onBack}>
            ← Back to Process Dashboard
          </button>
        </div>
      {selectedLines && selectedLines.length > 0 && (
        <ProcessLineToggle selectedLines={selectedLines} activeLine={activeLine} onChange={setActiveLine} />
      )}

      </div>

      {/* Submodule Navigation */}
      <ProcessSubmoduleNav
        currentSubmodule="process-parameters-grid"
        onNavigate={onNavigateSubmodule}
      />

      {/* Shearing Section */}
      <ShearingSection
        data={shearingData}
        onDataChange={setShearingData}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllShearing}
        onToggleShowAll={() => setShowAllShearing(v => !v)}
      />

      {/* Turning Section */}
      <TurningSection
        data={turningData}
        onDataChange={setTurningData}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllTurning}
        onToggleShowAll={() => setShowAllTurning(v => !v)}
      />

      {/* MPI Section - 8 Hour Grid */}
      <MpiSection
        data={mpiData}
        onDataChange={setMpiData}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllMpi}
        onToggleShowAll={() => setShowAllMpi(v => !v)}
      />

      {/* Forging Section - 8 Hour Grid */}
      <ForgingSection
        data={forgingData}
        onDataChange={setForgingData}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllForging}
        onToggleShowAll={() => setShowAllForging(v => !v)}
      />

      {/* Quenching Section - 8 Hour Grid */}
      <QuenchingSection
        data={quenchingData}
        onDataChange={setQuenchingData}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllQuenching}
        onToggleShowAll={() => setShowAllQuenching(v => !v)}
      />

      {/* Tempering Section - 8 Hour Grid */}
      <TemperingSection
        data={temperingData}
        onDataChange={setTemperingData}
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
        onDataChange={setFinalCheckData}
        availableLotNumbers={availableLotNumbers}
        hourLabels={hourLabels}
        visibleRows={visibleRows}
        showAll={showAllDimension}
        onToggleShowAll={() => setShowAllDimension(v => !v)}
      />

      <div style={{ marginTop: 'var(--space-24)', display: 'flex', gap: 'var(--space-16)', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { alert('Process parameters saved!'); onBack(); }}>Save & Continue</button>
      </div>
    </div>
  );
};

export default ProcessParametersGridPage;

