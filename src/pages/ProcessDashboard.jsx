import React, { useState } from 'react';
import { MOCK_PO_DATA } from '../data/mockData';
import { formatDate } from '../utils/helpers';

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


// Mock data for each manufacturing line
const LINE_DATA = {
  'Line-1': {
    lotNumbers: ['LOT-001', 'LOT-002'],
    heatNumbersMap: { 'LOT-001': 'H001', 'LOT-002': 'H002' },
    oilTankCounter: 45000,
    shearingPress: true,
    forgingPress: true,
    reheatingFurnace: true,
    quenchingTime: true
  },
  'Line-2': {
    lotNumbers: ['LOT-003'],
    heatNumbersMap: { 'LOT-003': 'H003' },
    oilTankCounter: 32000,
    shearingPress: true,
    forgingPress: false,
    reheatingFurnace: true,
    quenchingTime: true
  },
  'Line-3': {
    lotNumbers: ['LOT-004', 'LOT-005', 'LOT-006'],
    heatNumbersMap: { 'LOT-004': 'H004', 'LOT-005': 'H005', 'LOT-006': '' },
    oilTankCounter: 28500,
    shearingPress: true,
    forgingPress: true,
    reheatingFurnace: false,
    quenchingTime: true
  }
};

const ProcessDashboard = ({ onBack, onNavigateToSubModule, selectedLines = [] }) => {
  // Get PO data for header
  const poData = MOCK_PO_DATA["PO-2025-1001"];
  const initialLine = (selectedLines && selectedLines[0]) || 'Line-1';
  const [selectedLine, setSelectedLine] = useState(initialLine);

  // State that changes based on selected line
  const [lotNumbers, setLotNumbers] = useState(LINE_DATA[initialLine]?.lotNumbers || []);
  const [heatNumbersMap, setHeatNumbersMap] = useState(LINE_DATA[initialLine]?.heatNumbersMap || {});

  // Lot data is now auto-fetched from vendor call (read-only)

  // Final Inspection Results - Remarks (manual entry, required)
  const [finalInspectionRemarks, setFinalInspectionRemarks] = useState('');

  // Sample data - would be auto-fetched from sub-modules in real app
  const rawMaterialAccepted = 500; // Qty Accepted in Raw Material Stage
  const poOrderedQty = 450; // Qty Ordered in PO

  // Sample stage results - auto-populated from sub-modules
  const stageResults = {
    shearing: { manufactured: 120, accepted: 115, rejected: 5 },
    turning: { manufactured: 115, accepted: 112, rejected: 3 },
    mpiTesting: { manufactured: 112, accepted: 110, rejected: 2 },
    forging: { manufactured: 110, accepted: 108, rejected: 2 },
    tempering: { manufactured: 108, accepted: 106, rejected: 2 },
    dimensionsCheck: { manufactured: 106, accepted: 104, rejected: 2 },
    hardnessCheck: { manufactured: 104, accepted: 102, rejected: 2 },
    toeLoadCheck: { manufactured: 102, accepted: 100, rejected: 2 },
    visualInspection: { manufactured: 100, accepted: 98, rejected: 2 }
  };

  // Calculate grand totals
  const grandTotals = {
    manufactured: Object.values(stageResults).reduce((sum, s) => sum + s.manufactured, 0),
    accepted: Object.values(stageResults).reduce((sum, s) => sum + s.accepted, 0),
    rejected: Object.values(stageResults).reduce((sum, s) => sum + s.rejected, 0)
  };

  // Validation checks
  const processInspectionAccepted = grandTotals.accepted;
  const finalInspectionAccepted = stageResults.visualInspection.accepted; // Last stage accepted

  const validationErrors = [];
  if (rawMaterialAccepted < processInspectionAccepted) {
    validationErrors.push('Qty Accepted in Raw Material Stage must be ≥ Qty Accepted in Process Inspection');
  }
  if (processInspectionAccepted < finalInspectionAccepted) {
    validationErrors.push('Qty Accepted in Process Inspection must be ≥ Qty Accepted in Final Inspection');
  }
  if (finalInspectionAccepted > poOrderedQty) {
    validationErrors.push('Qty Accepted in Final Inspection must be ≤ Qty Ordered in PO');
  }

  // Handle line change - fetch data for selected line
  const handleLineChange = (line) => {
    setSelectedLine(line);
    const lineData = LINE_DATA[line];
    if (lineData) {
      setLotNumbers(lineData.lotNumbers);
      setHeatNumbersMap(lineData.heatNumbersMap);
    }
  };

  const manufacturingLines = (selectedLines && selectedLines.length > 0) ? selectedLines : ['Line-1'];

  // removed unused hourly data and validators to satisfy lint rules

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

      <div className="process-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <h1>ERC Process Inspection</h1>
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

      {/* Inspection Details (Static Data) - Same as Raw Material */}
      <div className="card" style={{ background: 'var(--color-gray-100)', marginBottom: 'var(--space-24)' }}>
        <div className="card-header">
          <h3 className="card-title">Inspection Details (Static Data)</h3>
          <p className="card-subtitle">Auto-fetched from PO/Sub PO information</p>
        </div>
        <div className="process-form-grid">
          <div className="process-form-group">
            <label className="process-form-label">PO / Sub PO Number</label>
            <input type="text" className="process-form-input" value={poData.sub_po_no || poData.po_no} disabled />
          </div>
          <div className="process-form-group">
            <label className="process-form-label">PO / Sub PO Date</label>
            <input type="text" className="process-form-input" value={formatDate(poData.sub_po_date || poData.po_date)} disabled />
          </div>
          <div className="process-form-group">
            <label className="process-form-label">Contractor Name</label>
            <input type="text" className="process-form-input" value={poData.contractor} disabled />
          </div>
          <div className="process-form-group">
            <label className="process-form-label">Manufacturer</label>
            <input type="text" className="process-form-input" value={poData.manufacturer} disabled />
          </div>
          <div className="process-form-group">
            <label className="process-form-label">Place of Inspection</label>
            <input type="text" className="process-form-input" value={poData.place_of_inspection} disabled />
          </div>
          <div className="process-form-group">
            <label className="process-form-label">Stage of Inspection</label>
            <input type="text" className="process-form-input" value="Process Material Inspection" disabled />
          </div>
        </div>
      </div>

      {/* Pre-Inspection Data Entry - Auto-fetched from vendor call */}
      <div className="card compact-card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header" style={{ paddingBottom: '8px' }}>
          <h3 className="card-title" style={{ marginBottom: '4px' }}>Pre-Inspection Data Entry - {selectedLine}</h3>
          {/* <span style={{ fontSize: '12px', color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>📥 Auto-fetched from Vendor Call</span> */}
        </div>

        {/* Compact Lot-Heat Mapping Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
          {lotNumbers.map(lot => (
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
                }}>{heatNumbersMap[lot] || 'H001'}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: '4px', color: '#1d4ed8' }}>ℹ️</span>
          3 readings per hour are required for all process parameters
        </div>
      </div>

      {/* Sub Module Session - Same design as Raw Material */}
      <div className="process-submodule-session">
        <div className="process-submodule-session-header">
          <h3 className="process-submodule-session-title">📋 Sub Module Session</h3>
          <p className="process-submodule-session-subtitle">Select a module to proceed with inspection</p>
        </div>
        <div className="process-submodule-buttons">
          <button className="process-submodule-btn" onClick={() => onNavigateToSubModule('process-calibration-documents')}>
            <span className="process-submodule-btn-icon">📄</span>
            <p className="process-submodule-btn-title">Calibration & Documents</p>
            <p className="process-submodule-btn-desc">Verify instrument calibration</p>
          </button>
          <button className="process-submodule-btn" onClick={() => onNavigateToSubModule('process-static-periodic-check')}>
            <span className="process-submodule-btn-icon">⚙️</span>
            <p className="process-submodule-btn-title">Static Periodic Check</p>
            <p className="process-submodule-btn-desc">Equipment verification</p>
          </button>
          <button className="process-submodule-btn" onClick={() => onNavigateToSubModule('process-oil-tank-counter')}>
            <span className="process-submodule-btn-icon">🛢️</span>
            <p className="process-submodule-btn-title">Oil Tank Counter</p>
            <p className="process-submodule-btn-desc">Monitor quenching count</p>
          </button>
          <button className="process-submodule-btn" onClick={() => onNavigateToSubModule('process-parameters-grid')}>
            <span className="process-submodule-btn-icon">🔬</span>
            <p className="process-submodule-btn-title">Process Parameters - 8 Hour Grid</p>
            <p className="process-submodule-btn-desc">Hourly production data entry</p>
          </button>
          <button className="process-submodule-btn" onClick={() => onNavigateToSubModule('process-summary-reports')}>
            <span className="process-submodule-btn-icon">📊</span>
            <p className="process-submodule-btn-title">Summary / Reports</p>
            <p className="process-submodule-btn-desc">View consolidated results</p>
          </button>
        </div>
      </div>

      {/* Final Inspection Results – Main Module (Auto Populated) */}
      <div className="card" style={{ marginTop: 'var(--space-24)', border: '2px solid #0d9488' }}>
        <div className="card-header" style={{ backgroundColor: '#f0fdfa' }}>
          <h3 className="card-title" style={{ color: '#0d9488' }}>📊 Final Inspection Results – Main Module (Auto Populated)</h3>
          <p className="card-subtitle">Summary of all stage-wise inspection results (Line-wise / Lot-wise / PO-wise / Total)</p>
        </div>

        {/* Validation Alerts */}
        {validationErrors.length > 0 && (
          <div className="alert alert-danger" style={{ margin: 'var(--space-16)', backgroundColor: '#fef2f2', border: '1px solid #ef4444' }}>
            <strong>⚠️ Validation Errors:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

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
              <tr style={{ backgroundColor: '#0d9488', color: 'white' }}>
                <th style={{ color: 'white' }}>S.No.</th>
                <th style={{ color: 'white' }}>Stage / Section</th>
                <th style={{ color: 'white' }}>Manufactured (pcs)</th>
                <th style={{ color: 'white' }}>Accepted (pcs)</th>
                <th style={{ color: 'white' }}>Rejected (pcs)</th>
                <th style={{ color: 'white' }}>Acceptance %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="S.No.">1</td>
                <td data-label="Stage"><strong>Shearing</strong></td>
                <td data-label="Manufactured">{stageResults.shearing.manufactured}</td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>{stageResults.shearing.accepted}</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>{stageResults.shearing.rejected}</td>
                <td data-label="Acceptance %">{stageResults.shearing.manufactured > 0 ? ((stageResults.shearing.accepted / stageResults.shearing.manufactured) * 100).toFixed(1) + '%' : '-'}</td>
              </tr>
              <tr>
                <td data-label="S.No.">2</td>
                <td data-label="Stage"><strong>Turning (Hydro Coping)</strong></td>
                <td data-label="Manufactured">{stageResults.turning.manufactured}</td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>{stageResults.turning.accepted}</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>{stageResults.turning.rejected}</td>
                <td data-label="Acceptance %">{stageResults.turning.manufactured > 0 ? ((stageResults.turning.accepted / stageResults.turning.manufactured) * 100).toFixed(1) + '%' : '-'}</td>
              </tr>
              <tr>
                <td data-label="S.No.">3</td>
                <td data-label="Stage"><strong>MPI Testing</strong></td>
                <td data-label="Manufactured">{stageResults.mpiTesting.manufactured}</td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>{stageResults.mpiTesting.accepted}</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>{stageResults.mpiTesting.rejected}</td>
                <td data-label="Acceptance %">{stageResults.mpiTesting.manufactured > 0 ? ((stageResults.mpiTesting.accepted / stageResults.mpiTesting.manufactured) * 100).toFixed(1) + '%' : '-'}</td>
              </tr>
              <tr>
                <td data-label="S.No.">4</td>
                <td data-label="Stage"><strong>Forging</strong></td>
                <td data-label="Manufactured">{stageResults.forging.manufactured}</td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>{stageResults.forging.accepted}</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>{stageResults.forging.rejected}</td>
                <td data-label="Acceptance %">{stageResults.forging.manufactured > 0 ? ((stageResults.forging.accepted / stageResults.forging.manufactured) * 100).toFixed(1) + '%' : '-'}</td>
              </tr>
              <tr>
                <td data-label="S.No.">5</td>
                <td data-label="Stage"><strong>Tempering</strong></td>
                <td data-label="Manufactured">{stageResults.tempering.manufactured}</td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>{stageResults.tempering.accepted}</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>{stageResults.tempering.rejected}</td>
                <td data-label="Acceptance %">{stageResults.tempering.manufactured > 0 ? ((stageResults.tempering.accepted / stageResults.tempering.manufactured) * 100).toFixed(1) + '%' : '-'}</td>
              </tr>
              <tr>
                <td data-label="S.No.">6</td>
                <td data-label="Stage"><strong>Dimensions Check</strong></td>
                <td data-label="Manufactured">{stageResults.dimensionsCheck.manufactured}</td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>{stageResults.dimensionsCheck.accepted}</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>{stageResults.dimensionsCheck.rejected}</td>
                <td data-label="Acceptance %">{stageResults.dimensionsCheck.manufactured > 0 ? ((stageResults.dimensionsCheck.accepted / stageResults.dimensionsCheck.manufactured) * 100).toFixed(1) + '%' : '-'}</td>
              </tr>
              <tr>
                <td data-label="S.No.">7</td>
                <td data-label="Stage"><strong>Hardness of Finished ERC</strong></td>
                <td data-label="Manufactured">{stageResults.hardnessCheck.manufactured}</td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>{stageResults.hardnessCheck.accepted}</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>{stageResults.hardnessCheck.rejected}</td>
                <td data-label="Acceptance %">{stageResults.hardnessCheck.manufactured > 0 ? ((stageResults.hardnessCheck.accepted / stageResults.hardnessCheck.manufactured) * 100).toFixed(1) + '%' : '-'}</td>
              </tr>
              <tr>
                <td data-label="S.No.">8</td>
                <td data-label="Stage"><strong>Toe Load of Finished ERC</strong></td>
                <td data-label="Manufactured">{stageResults.toeLoadCheck.manufactured}</td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>{stageResults.toeLoadCheck.accepted}</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>{stageResults.toeLoadCheck.rejected}</td>
                <td data-label="Acceptance %">{stageResults.toeLoadCheck.manufactured > 0 ? ((stageResults.toeLoadCheck.accepted / stageResults.toeLoadCheck.manufactured) * 100).toFixed(1) + '%' : '-'}</td>
              </tr>
              <tr>
                <td data-label="S.No.">9</td>
                <td data-label="Stage"><strong>Visual Inspection</strong></td>
                <td data-label="Manufactured">{stageResults.visualInspection.manufactured}</td>
                <td data-label="Accepted" style={{ color: '#22c55e', fontWeight: 600 }}>{stageResults.visualInspection.accepted}</td>
                <td data-label="Rejected" style={{ color: '#ef4444', fontWeight: 600 }}>{stageResults.visualInspection.rejected}</td>
                <td data-label="Acceptance %">{stageResults.visualInspection.manufactured > 0 ? ((stageResults.visualInspection.accepted / stageResults.visualInspection.manufactured) * 100).toFixed(1) + '%' : '-'}</td>
              </tr>
              {/* Total Results Row */}
              <tr className="total-row" style={{ backgroundColor: '#0d9488', color: 'white', fontWeight: 700 }}>
                <td colSpan="2" data-label="Total" style={{ color: 'white' }}>TOTAL RESULTS</td>
                <td data-label="Manufactured" style={{ color: 'white' }}>{grandTotals.manufactured}</td>
                <td data-label="Accepted" style={{ color: '#a7f3d0' }}>{grandTotals.accepted}</td>
                <td data-label="Rejected" style={{ color: '#fecaca' }}>{grandTotals.rejected}</td>
                <td data-label="Acceptance %" style={{ color: 'white' }}>{grandTotals.manufactured > 0 ? ((grandTotals.accepted / grandTotals.manufactured) * 100).toFixed(1) + '%' : '-'}</td>
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
     
        {/* Action Buttons */}
        <div className="rm-action-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: '24px' }}>
          <button className="btn btn-outline" style={{ minHeight: '44px', padding: '10px 20px' }}>Save Draft</button>
          {/* <button className="btn btn-secondary" style={{ minHeight: '44px', padding: '10px 20px' }} onClick={() => { if (window.confirm('Are you sure you want to reject this lot?')) { alert('Raw Material lot rejected'); } }}>Reject Lot</button>
          <button className="btn btn-primary" style={{ minHeight: '44px', padding: '10px 20px' }} onClick={() => { alert('Raw Material lot accepted and inspection completed!'); onBack(); }}>Accept Lot &amp; Complete Inspection</button> */}
           <button className="btn btn-outline">Pause Inspection</button>
          <button className="btn btn-outline">Withheld Inspection</button>
          <button className="btn btn-primary">Finish Inspection</button>
        </div>
        
      {/* Return button */}
      <div style={{ marginTop: 'var(--space-24)' }}>
        <button className="btn btn-secondary" onClick={onBack}>Return to Landing Page</button>
      </div>
    </div>
  );
};

export default ProcessDashboard;
