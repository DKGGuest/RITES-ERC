import React, { useState } from 'react';

const ProcessParametersGridPage = ({ onBack, lotNumbers = [] }) => {
  // Use lot numbers from main module (auto populated from Main Module)
  const availableLotNumbers = lotNumbers.length > 0 ? lotNumbers : ['LOT-001', 'LOT-002', 'LOT-003'];

  const [shearingData, setShearingData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      noProduction: false,
      lotNo: '',
      lengthCutBar: '',
      sharpEdges: false,
      acceptedQty: '',
      rejectedQty: '',
      remarks: ''
    }))
  );

  const [turningData, setTurningData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      noProduction: false,
      lotNo: '',
      straightLength: '',
      taperLength: '',
      dia: '',
      acceptedQty: '',
      rejectedQty: '',
      remarks: ''
    }))
  );

  // MPI Section - 8 Hour Grid
  const [mpiData, setMpiData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      noProduction: false,
      lotNo: '',
      testResults: '',
      acceptedQty: '',
      rejectedQty: '',
      remarks: ''
    }))
  );

  // Forging Section - 8 Hour Grid
  const [forgingData, setForgingData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      noProduction: false,
      lotNo: '',
      forgingTemperature: '',
      acceptedQty: '',
      rejectedQty: '',
      remarks: ''
    }))
  );

  // Quenching Section - 8 Hour Grid (NO "No Production" checkbox)
  const [quenchingData, setQuenchingData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      lotNo: '',
      quenchingTemperature: '',
      quenchingDuration: '',
      quenchingHardness: '',
      acceptedQty: '',
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

  // Dimension, Hardness, Toe Load & Weight Section - 8 Hour Grid
  const [dimensionData, setDimensionData] = useState(
    Array(8).fill(null).map((_, i) => ({
      hour: i + 1,
      noProduction: false,
      lotNo: '',
      dimensionalCheck: '',
      finalHardness: '',
      toeLoad: '',
      weight: '',
      acceptedQty: '',
      rejectedQty: '',
      remarks: ''
    }))
  );

  // Product type for validation (can be changed based on selection)
  const [productType, setProductType] = useState('MK-III'); // Options: MK-III, MK-V, ERC-J

  // Section collapse/expand states
  const [shearingExpanded, setShearingExpanded] = useState(true);
  const [turningExpanded, setTurningExpanded] = useState(true);
  const [mpiExpanded, setMpiExpanded] = useState(true);
  const [forgingExpanded, setForgingExpanded] = useState(true);
  const [quenchingExpanded, setQuenchingExpanded] = useState(true);
  const [temperingExpanded, setTemperingExpanded] = useState(true);
  const [dimensionExpanded, setDimensionExpanded] = useState(true);

  const updateShearingData = (index, field, value) => {
    const updated = [...shearingData];
    updated[index][field] = value;
    setShearingData(updated);
  };

  const updateTurningData = (index, field, value) => {
    const updated = [...turningData];
    updated[index][field] = value;
    setTurningData(updated);
  };

  const updateMpiData = (index, field, value) => {
    const updated = [...mpiData];
    updated[index][field] = value;
    setMpiData(updated);
  };

  const updateForgingData = (index, field, value) => {
    const updated = [...forgingData];
    updated[index][field] = value;
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
    const updated = [...dimensionData];
    updated[index][field] = value;
    setDimensionData(updated);
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 className="page-title">Process Parameters - 8 Hour Grid</h1>
          <p className="page-subtitle">Process Material Inspection - Hourly production data entry</p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>
          ← Back to Process Dashboard
        </button>
      </div>

      {/* Shearing Section */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">Shearing Section - 8 Hour Grid</h3>
            <p className="card-subtitle">Enter hourly shearing production data</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShearingExpanded(!shearingExpanded)}
            style={{ padding: 'var(--space-8) var(--space-16)', fontSize: 'var(--font-size-xl)' }}
          >
            {shearingExpanded ? '−' : '+'}
          </button>
        </div>
        {shearingExpanded && (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Hour</th>
                <th>No Production</th>
                <th>Lot No.</th>
                <th>Length of Cut Bar</th>
                <th>Sharp Edges</th>
                <th>Accepted Qty</th>
                <th>Rejected Qty</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {shearingData.map((row, idx) => (
                <tr key={row.hour}>
                  <td><strong>Hour {row.hour}</strong></td>
                  <td><input type="checkbox" checked={row.noProduction} onChange={e => updateShearingData(idx, 'noProduction', e.target.checked)} /></td>
                  <td>
                    <select
                      className="form-control"
                      value={row.lotNo}
                      onChange={e => updateShearingData(idx, 'lotNo', e.target.value)}
                      disabled={row.noProduction}
                      style={{ minWidth: '120px' }}
                    >
                      <option value="">Select Lot No.</option>
                      {availableLotNumbers.map(lot => (
                        <option key={lot} value={lot}>{lot}</option>
                      ))}
                    </select>
                  </td>
                  <td><input type="text" className="form-control" value={row.lengthCutBar} onChange={e => updateShearingData(idx, 'lengthCutBar', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="checkbox" checked={row.sharpEdges} onChange={e => updateShearingData(idx, 'sharpEdges', e.target.checked)} disabled={row.noProduction} /></td>
                  <td><input type="number" className="form-control" value={row.acceptedQty} onChange={e => updateShearingData(idx, 'acceptedQty', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="number" className="form-control" value={row.rejectedQty} onChange={e => updateShearingData(idx, 'rejectedQty', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="text" className="form-control" value={row.remarks} onChange={e => updateShearingData(idx, 'remarks', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Turning Section */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">Turning Section - 8 Hour Grid</h3>
            <p className="card-subtitle">Enter hourly turning production data</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setTurningExpanded(!turningExpanded)}
            style={{ padding: 'var(--space-8) var(--space-16)', fontSize: 'var(--font-size-xl)' }}
          >
            {turningExpanded ? '−' : '+'}
          </button>
        </div>
        {turningExpanded && (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Hour</th>
                <th>No Production</th>
                <th>Lot No.</th>
                <th>Straight Length</th>
                <th>Taper Length</th>
                <th>Diameter</th>
                <th>Accepted Qty</th>
                <th>Rejected Qty</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {turningData.map((row, idx) => (
                <tr key={row.hour}>
                  <td><strong>Hour {row.hour}</strong></td>
                  <td><input type="checkbox" checked={row.noProduction} onChange={e => updateTurningData(idx, 'noProduction', e.target.checked)} /></td>
                  <td>
                    <select
                      className="form-control"
                      value={row.lotNo}
                      onChange={e => updateTurningData(idx, 'lotNo', e.target.value)}
                      disabled={row.noProduction}
                      style={{ minWidth: '120px' }}
                    >
                      <option value="">Select Lot No.</option>
                      {availableLotNumbers.map(lot => (
                        <option key={lot} value={lot}>{lot}</option>
                      ))}
                    </select>
                  </td>
                  <td><input type="text" className="form-control" value={row.straightLength} onChange={e => updateTurningData(idx, 'straightLength', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="text" className="form-control" value={row.taperLength} onChange={e => updateTurningData(idx, 'taperLength', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="text" className="form-control" value={row.dia} onChange={e => updateTurningData(idx, 'dia', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="number" className="form-control" value={row.acceptedQty} onChange={e => updateTurningData(idx, 'acceptedQty', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="number" className="form-control" value={row.rejectedQty} onChange={e => updateTurningData(idx, 'rejectedQty', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="text" className="form-control" value={row.remarks} onChange={e => updateTurningData(idx, 'remarks', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* MPI Section - 8 Hour Grid */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">MPI Section - 8 Hour Grid</h3>
            <p className="card-subtitle">Enter hourly MPI (Magnetic Particle Inspection) production data</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setMpiExpanded(!mpiExpanded)}
            style={{ padding: 'var(--space-8) var(--space-16)', fontSize: 'var(--font-size-xl)' }}
          >
            {mpiExpanded ? '−' : '+'}
          </button>
        </div>
        {mpiExpanded && (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Hour</th>
                <th>No Production</th>
                <th>Lot No.</th>
                <th>Test Results</th>
                <th>Accepted Qty</th>
                <th>Rejected Qty</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {mpiData.map((row, idx) => (
                <tr key={row.hour}>
                  <td><strong>Hour {row.hour}</strong></td>
                  <td><input type="checkbox" checked={row.noProduction} onChange={e => updateMpiData(idx, 'noProduction', e.target.checked)} /></td>
                  <td>
                    <select
                      className="form-control"
                      value={row.lotNo}
                      onChange={e => updateMpiData(idx, 'lotNo', e.target.value)}
                      disabled={row.noProduction}
                      style={{ minWidth: '120px' }}
                    >
                      <option value="">Select Lot No.</option>
                      {availableLotNumbers.map(lot => (
                        <option key={lot} value={lot}>{lot}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      value={row.testResults}
                      onChange={e => updateMpiData(idx, 'testResults', e.target.value)}
                      disabled={row.noProduction}
                      style={{ minWidth: '130px' }}
                    >
                      <option value="">Select Result</option>
                      <option value="OK">OK</option>
                      <option value="Not OK">Not OK</option>
                      <option value="Partially OK">Partially OK</option>
                    </select>
                  </td>
                  <td><input type="number" className="form-control" value={row.acceptedQty} onChange={e => updateMpiData(idx, 'acceptedQty', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="number" className="form-control" value={row.rejectedQty} onChange={e => updateMpiData(idx, 'rejectedQty', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="text" className="form-control" value={row.remarks} onChange={e => updateMpiData(idx, 'remarks', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Forging Section - 8 Hour Grid */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">Forging Section - 8 Hour Grid</h3>
            <p className="card-subtitle">Enter hourly forging production data</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setForgingExpanded(!forgingExpanded)}
            style={{ padding: 'var(--space-8) var(--space-16)', fontSize: 'var(--font-size-xl)' }}
          >
            {forgingExpanded ? '−' : '+'}
          </button>
        </div>
        {forgingExpanded && (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Hour</th>
                <th>No Production</th>
                <th>Lot No.</th>
                <th>Forging Temperature (°C)</th>
                <th>Accepted Qty</th>
                <th>Rejected Qty</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {forgingData.map((row, idx) => (
                <tr key={row.hour}>
                  <td><strong>Hour {row.hour}</strong></td>
                  <td><input type="checkbox" checked={row.noProduction} onChange={e => updateForgingData(idx, 'noProduction', e.target.checked)} /></td>
                  <td>
                    <select
                      className="form-control"
                      value={row.lotNo}
                      onChange={e => updateForgingData(idx, 'lotNo', e.target.value)}
                      disabled={row.noProduction}
                      style={{ minWidth: '120px' }}
                    >
                      <option value="">Select Lot No.</option>
                      {availableLotNumbers.map(lot => (
                        <option key={lot} value={lot}>{lot}</option>
                      ))}
                    </select>
                  </td>
                  <td><input type="number" className="form-control" placeholder="e.g., 950" value={row.forgingTemperature} onChange={e => updateForgingData(idx, 'forgingTemperature', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="number" className="form-control" value={row.acceptedQty} onChange={e => updateForgingData(idx, 'acceptedQty', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="number" className="form-control" value={row.rejectedQty} onChange={e => updateForgingData(idx, 'rejectedQty', e.target.value)} disabled={row.noProduction} /></td>
                  <td><input type="text" className="form-control" value={row.remarks} onChange={e => updateForgingData(idx, 'remarks', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Quenching Section - 8 Hour Grid (NO "No Production" checkbox) */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">Quenching Section - 8 Hour Grid</h3>
            <p className="card-subtitle">Enter hourly quenching production data (No "No Production" option - all hours required)</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setQuenchingExpanded(!quenchingExpanded)}
            style={{ padding: 'var(--space-8) var(--space-16)', fontSize: 'var(--font-size-xl)' }}
          >
            {quenchingExpanded ? '−' : '+'}
          </button>
        </div>
        {quenchingExpanded && (
        <>
        <div className="alert alert-info" style={{ margin: '0 0 var(--space-16) 0' }}>
          <strong>Validation Rules:</strong> Temperature must be &lt; 70°C | Duration must be &gt; 12 min | Hardness must be 45-55 HRc (2 ERC/Hour)
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Hour</th>
                <th>Lot No. *</th>
                <th>Quenching Temp (°C) *<br/><small style={{fontWeight: 'normal', color: '#666'}}>Once/Hour, &lt;70°C</small></th>
                <th>Quenching Duration (min) *<br/><small style={{fontWeight: 'normal', color: '#666'}}>&gt;12 min</small></th>
                <th>Quenching Hardness (HRc) *<br/><small style={{fontWeight: 'normal', color: '#666'}}>45-55 HRc, 2 ERC/Hour</small></th>
                <th>Accepted Qty</th>
                <th>Rejected Qty</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {quenchingData.map((row, idx) => {
                const tempValidation = getQuenchingTempValidation(row.quenchingTemperature);
                const durationValidation = getQuenchingDurationValidation(row.quenchingDuration);
                const hardnessValidation = getQuenchingHardnessValidation(row.quenchingHardness);
                return (
                  <tr key={row.hour}>
                    <td><strong>Hour {row.hour}</strong></td>
                    <td>
                      <select
                        className="form-control"
                        value={row.lotNo}
                        onChange={e => updateQuenchingData(idx, 'lotNo', e.target.value)}
                        style={{ minWidth: '120px', borderColor: !row.lotNo ? '#f59e0b' : undefined }}
                        required
                      >
                        <option value="">Select Lot No.</option>
                        {availableLotNumbers.map(lot => (
                          <option key={lot} value={lot}>{lot}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="< 70"
                        value={row.quenchingTemperature}
                        onChange={e => updateQuenchingData(idx, 'quenchingTemperature', e.target.value)}
                        style={{ borderColor: tempValidation?.error ? '#ef4444' : tempValidation ? '#22c55e' : undefined }}
                      />
                      {tempValidation && (
                        <small style={{ color: tempValidation.error ? '#ef4444' : '#22c55e', fontSize: '11px' }}>{tempValidation.message}</small>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="> 12"
                        value={row.quenchingDuration}
                        onChange={e => updateQuenchingData(idx, 'quenchingDuration', e.target.value)}
                        style={{ borderColor: durationValidation?.error ? '#ef4444' : durationValidation ? '#22c55e' : undefined }}
                      />
                      {durationValidation && (
                        <small style={{ color: durationValidation.error ? '#ef4444' : '#22c55e', fontSize: '11px' }}>{durationValidation.message}</small>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="45-55"
                        value={row.quenchingHardness}
                        onChange={e => updateQuenchingData(idx, 'quenchingHardness', e.target.value)}
                        style={{ borderColor: hardnessValidation?.error ? '#ef4444' : hardnessValidation ? '#22c55e' : undefined }}
                        required
                      />
                      {hardnessValidation && (
                        <small style={{ color: hardnessValidation.error ? '#ef4444' : '#22c55e', fontSize: '11px' }}>{hardnessValidation.message}</small>
                      )}
                    </td>
                    <td><input type="number" className="form-control" value={row.acceptedQty} onChange={e => updateQuenchingData(idx, 'acceptedQty', e.target.value)} /></td>
                    <td><input type="number" className="form-control" value={row.rejectedQty} onChange={e => updateQuenchingData(idx, 'rejectedQty', e.target.value)} /></td>
                    <td><input type="text" className="form-control" value={row.remarks} onChange={e => updateQuenchingData(idx, 'remarks', e.target.value)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>

      {/* Tempering Section - 8 Hour Grid */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">Tempering Section - 8 Hour Grid</h3>
            <p className="card-subtitle">Enter hourly tempering production data</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setTemperingExpanded(!temperingExpanded)}
            style={{ padding: 'var(--space-8) var(--space-16)', fontSize: 'var(--font-size-xl)' }}
          >
            {temperingExpanded ? '−' : '+'}
          </button>
        </div>
        {temperingExpanded && (
        <>
        <div className="alert alert-info" style={{ margin: '0 0 var(--space-16) 0' }}>
          <strong>Once/Shift Rule:</strong> Temperature & Duration only required in 1st hour. If taken in Hour 1, not required in other hours.
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Hour</th>
                <th>No Production</th>
                <th>Lot No. *<br/><small style={{fontWeight: 'normal', color: '#666'}}>Once/Hour</small></th>
                <th>Tempering Temp (°C)<br/><small style={{fontWeight: 'normal', color: '#666'}}>Once/Shift</small></th>
                <th>Tempering Duration (min)<br/><small style={{fontWeight: 'normal', color: '#666'}}>Once/Shift</small></th>
                <th>Accepted Qty *</th>
                <th>Rejected Qty</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {temperingData.map((row, idx) => {
                // Once/Shift rule: if Hour 1 has value, other hours don't need it
                const isTempRequired = idx === 0; // Only required in first hour
                const isDurationRequired = idx === 0; // Only required in first hour
                const showTempHint = idx > 0 && isTemperingTempTakenInFirstHour;
                const showDurationHint = idx > 0 && isTemperingDurationTakenInFirstHour;

                return (
                  <tr key={row.hour} style={{ opacity: row.noProduction ? 0.5 : 1 }}>
                    <td><strong>Hour {row.hour}</strong></td>
                    <td>
                      <input
                        type="checkbox"
                        checked={row.noProduction}
                        onChange={e => updateTemperingData(idx, 'noProduction', e.target.checked)}
                      />
                    </td>
                    <td>
                      <select
                        className="form-control"
                        value={row.lotNo}
                        onChange={e => updateTemperingData(idx, 'lotNo', e.target.value)}
                        disabled={row.noProduction}
                        style={{ minWidth: '120px', borderColor: !row.noProduction && !row.lotNo ? '#f59e0b' : undefined }}
                        required={!row.noProduction}
                      >
                        <option value="">Select Lot No.</option>
                        {availableLotNumbers.map(lot => (
                          <option key={lot} value={lot}>{lot}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder={showTempHint ? "N/A (taken in Hr 1)" : "e.g., 450"}
                        value={row.temperingTemperature}
                        onChange={e => updateTemperingData(idx, 'temperingTemperature', e.target.value)}
                        disabled={row.noProduction || showTempHint}
                        style={{ backgroundColor: showTempHint ? '#f3f4f6' : undefined }}
                      />
                      {showTempHint && <small style={{ color: '#22c55e', fontSize: '11px' }}>✓ Taken in Hour 1</small>}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        placeholder={showDurationHint ? "N/A (taken in Hr 1)" : "e.g., 60"}
                        value={row.temperingDuration}
                        onChange={e => updateTemperingData(idx, 'temperingDuration', e.target.value)}
                        disabled={row.noProduction || showDurationHint}
                        style={{ backgroundColor: showDurationHint ? '#f3f4f6' : undefined }}
                      />
                      {showDurationHint && <small style={{ color: '#22c55e', fontSize: '11px' }}>✓ Taken in Hour 1</small>}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={row.acceptedQty}
                        onChange={e => updateTemperingData(idx, 'acceptedQty', e.target.value)}
                        disabled={row.noProduction}
                        style={{ borderColor: !row.noProduction && !row.acceptedQty ? '#f59e0b' : undefined }}
                        required={!row.noProduction}
                      />
                    </td>
                    <td><input type="number" className="form-control" value={row.rejectedQty} onChange={e => updateTemperingData(idx, 'rejectedQty', e.target.value)} disabled={row.noProduction} /></td>
                    <td><input type="text" className="form-control" value={row.remarks} onChange={e => updateTemperingData(idx, 'remarks', e.target.value)} disabled={row.noProduction} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>

      {/* Dimension, Hardness, Toe Load & Weight Section - 8 Hour Grid */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">Dimension, Hardness, Toe Load & Weight - 8 Hour Grid</h3>
            <p className="card-subtitle">Enter hourly dimension, hardness, toe load & weight data (2 ERC/Hour)</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDimensionExpanded(!dimensionExpanded)}
            style={{ padding: 'var(--space-8) var(--space-16)', fontSize: 'var(--font-size-xl)' }}
          >
            {dimensionExpanded ? '−' : '+'}
          </button>
        </div>
        {dimensionExpanded && (
        <>
        {/* Product Type Selector for validation */}
        <div style={{ padding: '0 var(--space-16) var(--space-16)', display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
          <label style={{ fontWeight: 600 }}>Product Type (for validation):</label>
          <select
            className="form-control"
            value={productType}
            onChange={e => setProductType(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="MK-III">MK-III</option>
            <option value="MK-V">MK-V</option>
            <option value="ERC-J">ERC-J</option>
          </select>
          <small style={{ color: '#666' }}>
            {productType === 'MK-III' && 'Toe Load: 850-1100 KgF | Weight: ≥904 gm'}
            {productType === 'MK-V' && 'Toe Load: 1200-1500 KgF | Weight: ≥1068 gm'}
            {productType === 'ERC-J' && 'Toe Load: ≥650 KgF | Weight: ≥904 gm'}
          </small>
        </div>

        <div className="alert alert-info" style={{ margin: '0 var(--space-16) var(--space-16)' }}>
          <strong>Validation Rules:</strong> Hardness: 40-44 HRc (Required) | Toe Load & Weight validations based on product type above
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Hour</th>
                <th>No Production</th>
                <th>Lot No.<br/><small style={{fontWeight: 'normal', color: '#666'}}>Once/Hour</small></th>
                <th>Dimensional Check<br/><small style={{fontWeight: 'normal', color: '#666'}}>Go/No-GO Gauges</small></th>
                <th>Final Hardness (HRc) *<br/><small style={{fontWeight: 'normal', color: '#666'}}>40-44 HRc, 2 ERC/Hr</small></th>
                <th>Toe Load (KgF) *<br/><small style={{fontWeight: 'normal', color: '#666'}}>2 ERC/Hour</small></th>
                <th>Weight (gm) *<br/><small style={{fontWeight: 'normal', color: '#666'}}>2 ERC/Hour</small></th>
                <th>Accepted Qty</th>
                <th>Rejected Qty</th>
                <th>Remarks<br/><small style={{fontWeight: 'normal', color: '#666'}}>Once/Hour</small></th>
              </tr>
            </thead>
            <tbody>
              {dimensionData.map((row, idx) => {
                const hardnessValidation = getFinalHardnessValidation(row.finalHardness);
                const toeLoadValidation = getToeLoadValidation(row.toeLoad, productType);
                const weightValidation = getWeightValidation(row.weight, productType);

                return (
                  <tr key={row.hour} style={{ opacity: row.noProduction ? 0.5 : 1 }}>
                    <td><strong>Hour {row.hour}</strong></td>
                    <td>
                      <input
                        type="checkbox"
                        checked={row.noProduction}
                        onChange={e => updateDimensionData(idx, 'noProduction', e.target.checked)}
                      />
                    </td>
                    <td>
                      <select
                        className="form-control"
                        value={row.lotNo}
                        onChange={e => updateDimensionData(idx, 'lotNo', e.target.value)}
                        disabled={row.noProduction}
                        style={{ minWidth: '120px' }}
                      >
                        <option value="">Select Lot No.</option>
                        {availableLotNumbers.map(lot => (
                          <option key={lot} value={lot}>{lot}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-control"
                        value={row.dimensionalCheck}
                        onChange={e => updateDimensionData(idx, 'dimensionalCheck', e.target.value)}
                        disabled={row.noProduction}
                        style={{ minWidth: '100px' }}
                      >
                        <option value="">Select</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="40-44"
                        value={row.finalHardness}
                        onChange={e => updateDimensionData(idx, 'finalHardness', e.target.value)}
                        disabled={row.noProduction}
                        style={{
                          borderColor: row.noProduction ? undefined : (hardnessValidation?.error ? '#ef4444' : hardnessValidation ? '#22c55e' : (!row.finalHardness ? '#f59e0b' : undefined))
                        }}
                        required={!row.noProduction}
                      />
                      {!row.noProduction && hardnessValidation && (
                        <small style={{ color: hardnessValidation.error ? '#ef4444' : '#22c55e', fontSize: '11px' }}>{hardnessValidation.message}</small>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        placeholder={productType === 'MK-III' ? '850-1100' : productType === 'MK-V' ? '1200-1500' : '≥650'}
                        value={row.toeLoad}
                        onChange={e => updateDimensionData(idx, 'toeLoad', e.target.value)}
                        disabled={row.noProduction}
                        style={{
                          borderColor: row.noProduction ? undefined : (toeLoadValidation?.error ? '#ef4444' : toeLoadValidation ? '#22c55e' : (!row.toeLoad ? '#f59e0b' : undefined))
                        }}
                        required={!row.noProduction}
                      />
                      {!row.noProduction && toeLoadValidation && (
                        <small style={{ color: toeLoadValidation.error ? '#ef4444' : '#22c55e', fontSize: '11px' }}>{toeLoadValidation.message}</small>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder={productType === 'MK-V' ? '≥1068' : '≥904'}
                        value={row.weight}
                        onChange={e => updateDimensionData(idx, 'weight', e.target.value)}
                        disabled={row.noProduction}
                        style={{
                          borderColor: row.noProduction ? undefined : (weightValidation?.error ? '#ef4444' : weightValidation ? '#22c55e' : (!row.weight ? '#f59e0b' : undefined))
                        }}
                        required={!row.noProduction}
                      />
                      {!row.noProduction && weightValidation && (
                        <small style={{ color: weightValidation.error ? '#ef4444' : '#22c55e', fontSize: '11px' }}>{weightValidation.message}</small>
                      )}
                    </td>
                    <td><input type="number" className="form-control" value={row.acceptedQty} onChange={e => updateDimensionData(idx, 'acceptedQty', e.target.value)} disabled={row.noProduction} /></td>
                    <td><input type="number" className="form-control" value={row.rejectedQty} onChange={e => updateDimensionData(idx, 'rejectedQty', e.target.value)} disabled={row.noProduction} /></td>
                    <td><input type="text" className="form-control" value={row.remarks} onChange={e => updateDimensionData(idx, 'remarks', e.target.value)} disabled={row.noProduction} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>

      <div style={{ marginTop: 'var(--space-24)', display: 'flex', gap: 'var(--space-16)', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { alert('Process parameters saved!'); onBack(); }}>Save & Continue</button>
      </div>
    </div>
  );
};

export default ProcessParametersGridPage;

