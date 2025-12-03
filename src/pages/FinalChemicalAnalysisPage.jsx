import { useState, useMemo } from 'react';

const FinalChemicalAnalysisPage = ({ onBack }) => {
  // Mock lot data from Process IC
  const availableLots = [
    { lotNo: 'LOT-001', heatNo: 'HT-2025-A1', quantity: 500,
      ladleAnalysis: { c: 0.55, si: 1.75, mn: 0.90, s: 0.020, p: 0.025 } },
    { lotNo: 'LOT-002', heatNo: 'HT-2025-A2', quantity: 800,
      ladleAnalysis: { c: 0.54, si: 1.80, mn: 0.88, s: 0.018, p: 0.022 } },
    { lotNo: 'LOT-003', heatNo: 'HT-2025-B1', quantity: 1200,
      ladleAnalysis: { c: 0.56, si: 1.70, mn: 0.92, s: 0.015, p: 0.020 } }
  ];

  const [selectedLot, setSelectedLot] = useState(availableLots[0].lotNo);
  const [colorCode, setColorCode] = useState('');
  const [remarks, setRemarks] = useState('');

  // Chemical values state
  const [chemValues, setChemValues] = useState({
    c: '', si: '', mn: '', s: '', p: ''
  });

  const currentLot = useMemo(() =>
    availableLots.find(l => l.lotNo === selectedLot) || availableLots[0],
    [selectedLot, availableLots]
  );

  const handleChemChange = (element, value) => {
    setChemValues(prev => ({ ...prev, [element]: value }));
  };

  // Validation logic for each element
  const validateElement = (element, value) => {
    if (!value || value === '') return { valid: null, message: '' };
    const val = parseFloat(value);
    const ladle = currentLot.ladleAnalysis;

    switch(element) {
      case 'c': {
        const min = 0.50, max = 0.60;
        const ladleMin = ladle.c - 0.03, ladleMax = ladle.c + 0.03;
        const inRange = val >= min && val <= max;
        const inLadleTolerance = val >= ladleMin && val <= ladleMax;
        return {
          valid: inRange && inLadleTolerance,
          message: `Range: ${min}-${max} | Ladle±0.03: ${ladleMin.toFixed(2)}-${ladleMax.toFixed(2)}`
        };
      }
      case 'si': {
        const min = 1.50, max = 2.00;
        const ladleMin = ladle.si - 0.04, ladleMax = ladle.si + 0.04;
        const inRange = val >= min && val <= max;
        const inLadleTolerance = val >= ladleMin && val <= ladleMax;
        return {
          valid: inRange && inLadleTolerance,
          message: `Range: ${min}-${max} | Ladle±0.04: ${ladleMin.toFixed(2)}-${ladleMax.toFixed(2)}`
        };
      }
      case 'mn': {
        const min = 0.80, max = 1.00;
        const ladleMin = ladle.mn - 0.05, ladleMax = ladle.mn + 0.05;
        const inRange = val >= min && val <= max;
        const inLadleTolerance = val >= ladleMin && val <= ladleMax;
        return {
          valid: inRange && inLadleTolerance,
          message: `Range: ${min}-${max} | Ladle±0.05: ${ladleMin.toFixed(2)}-${ladleMax.toFixed(2)}`
        };
      }
      case 's': {
        const maxSpec = 0.030;
        const ladleMax = ladle.s + 0.005;
        const inRange = val <= maxSpec;
        const inLadleTolerance = val <= ladleMax;
        return {
          valid: inRange && inLadleTolerance,
          message: `Max: ${maxSpec} | Ladle+0.005: ${ladleMax.toFixed(3)}`
        };
      }
      case 'p': {
        const maxSpec = 0.030;
        const ladleMax = ladle.p + 0.005;
        const inRange = val <= maxSpec;
        const inLadleTolerance = val <= ladleMax;
        return {
          valid: inRange && inLadleTolerance,
          message: `Max: ${maxSpec} | Ladle+0.005: ${ladleMax.toFixed(3)}`
        };
      }
      default:
        return { valid: null, message: '' };
    }
  };

  // Calculate overall result
  const overallResult = useMemo(() => {
    const elements = ['c', 'si', 'mn', 's', 'p'];
    const results = elements.map(el => validateElement(el, chemValues[el]));

    const anyFailed = results.some(r => r.valid === false);
    const allPassed = results.every(r => r.valid === true);
    const anyEmpty = elements.some(el => !chemValues[el] || chemValues[el] === '');

    if (anyFailed) return { status: 'REJECTED', color: '#ef4444', icon: '✗' };
    if (allPassed && !anyEmpty) return { status: 'ACCEPTED', color: '#22c55e', icon: '✓' };
    return { status: 'PENDING', color: '#f59e0b', icon: '⏳' };
  }, [chemValues, currentLot, validateElement]);

  const chemicalFields = [
    { id: 'c', label: '% C (Carbon)', range: '0.50 - 0.60', tolerance: '±0.03 from Ladle' },
    { id: 'si', label: '% Si (Silicon)', range: '1.50 - 2.00', tolerance: '±0.04 from Ladle' },
    { id: 'mn', label: '% Mn (Manganese)', range: '0.80 - 1.00', tolerance: '±0.05 from Ladle' },
    { id: 's', label: '% S (Sulphur)', range: '0.030 max', tolerance: 'Ladle + 0.005 max' },
    { id: 'p', label: '% P (Phosphorus)', range: '0.030 max', tolerance: 'Ladle + 0.005 max' }
  ];

  const pageStyles = `
    .chem-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .chem-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .chem-label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }
    .chem-label.required::after {
      content: ' *';
      color: #ef4444;
    }
    .chem-input {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
    }
    .chem-input:focus {
      outline: none;
      border-color: #0ea5e9;
    }
    .chem-input:disabled {
      background: #f1f5f9;
      color: #64748b;
    }
    .chem-input.valid {
      border-color: #22c55e;
      background: #f0fdf4;
    }
    .chem-input.invalid {
      border-color: #ef4444;
      background: #fef2f2;
    }
    .chem-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .chem-section-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .chem-element-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .chem-element-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .chem-element-name {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
    .chem-element-specs {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .chem-spec-badge {
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 4px;
      background: #f1f5f9;
      color: #475569;
    }
    .chem-element-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      align-items: end;
    }
    .chem-validation-msg {
      font-size: 10px;
      margin-top: 4px;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .chem-validation-msg.valid {
      background: #dcfce7;
      color: #166534;
    }
    .chem-validation-msg.invalid {
      background: #fee2e2;
      color: #991b1b;
    }
    .chem-result-box {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .chem-info-note {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 12px;
      font-size: 12px;
      color: #92400e;
      margin-top: 12px;
    }
    @media (max-width: 768px) {
      .chem-form-grid {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .chem-element-row {
        grid-template-columns: 1fr;
      }
      .page-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 12px;
      }
      .page-header .btn {
        width: 100%;
      }
    }
    @media (max-width: 480px) {
      .chem-form-grid {
        grid-template-columns: 1fr;
      }
      .chem-element-specs {
        flex-direction: column;
        gap: 4px;
      }
    }
  `;

  return (
    <div>
      <style>{pageStyles}</style>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 className="page-title">Chemical Analysis</h1>
          <p className="page-subtitle">Final Product Inspection - Separate section for each lot (1 sample per Lot)</p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Lot Selection */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">📦 Lot Information</h3>
          <p className="card-subtitle">Select lot - Data auto-fetched from Process IC</p>
        </div>
        <div className="chem-form-grid">
          <div className="chem-field">
            <label className="chem-label required">Lot No.</label>
            <select className="chem-input" value={selectedLot} onChange={e => setSelectedLot(e.target.value)}>
              {availableLots.map(lot => (
                <option key={lot.lotNo} value={lot.lotNo}>{lot.lotNo}</option>
              ))}
            </select>
          </div>
          <div className="chem-field">
            <label className="chem-label">Heat No.</label>
            <input type="text" className="chem-input" value={currentLot.heatNo} disabled />
          </div>
          <div className="chem-field">
            <label className="chem-label">Quantity of Lot</label>
            <input type="number" className="chem-input" value={currentLot.quantity} disabled />
          </div>
          <div className="chem-field">
            <label className="chem-label required">Color Code</label>
            <input type="text" className="chem-input" value={colorCode} onChange={e => setColorCode(e.target.value)} placeholder="Enter color code" />
          </div>
        </div>
      </div>

      {/* Ladle Analysis Reference */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">📋 Ladle Analysis (Vendor Data)</h3>
          <p className="card-subtitle">Reference values from vendor test certificate</p>
        </div>
        <div className="chem-form-grid">
          <div className="chem-field">
            <label className="chem-label">% C</label>
            <input type="text" className="chem-input" value={currentLot.ladleAnalysis.c.toFixed(2)} disabled />
          </div>
          <div className="chem-field">
            <label className="chem-label">% Si</label>
            <input type="text" className="chem-input" value={currentLot.ladleAnalysis.si.toFixed(2)} disabled />
          </div>
          <div className="chem-field">
            <label className="chem-label">% Mn</label>
            <input type="text" className="chem-input" value={currentLot.ladleAnalysis.mn.toFixed(2)} disabled />
          </div>
          <div className="chem-field">
            <label className="chem-label">% S</label>
            <input type="text" className="chem-input" value={currentLot.ladleAnalysis.s.toFixed(3)} disabled />
          </div>
          <div className="chem-field">
            <label className="chem-label">% P</label>
            <input type="text" className="chem-input" value={currentLot.ladleAnalysis.p.toFixed(3)} disabled />
          </div>
        </div>
        <div className="chem-info-note">
          ℹ️ If Heat has multiple test certificates, average of all certificates is used for automatic ladle analysis calculation.
        </div>
      </div>

      {/* Chemical Analysis Input */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">🧪 Chemical Analysis - Product Sample</h3>
          <p className="card-subtitle">Enter analysis values for 1 sample from Lot: {selectedLot}</p>
        </div>

        {chemicalFields.map(field => {
          const validation = validateElement(field.id, chemValues[field.id]);
          const inputClass = validation.valid === true ? 'valid' : validation.valid === false ? 'invalid' : '';

          return (
            <div key={field.id} className="chem-element-card">
              <div className="chem-element-header">
                <span className="chem-element-name">{field.label}</span>
                <div className="chem-element-specs">
                  <span className="chem-spec-badge">📊 {field.range}</span>
                  <span className="chem-spec-badge">📐 {field.tolerance}</span>
                </div>
              </div>
              <div className="chem-element-row">
                <div className="chem-field">
                  <label className="chem-label">Ladle Value</label>
                  <input type="text" className="chem-input"
                    value={currentLot.ladleAnalysis[field.id]?.toFixed(field.id === 's' || field.id === 'p' ? 3 : 2)}
                    disabled />
                </div>
                <div className="chem-field">
                  <label className="chem-label required">Product Value</label>
                  <input
                    type="number"
                    step="0.001"
                    className={`chem-input ${inputClass}`}
                    value={chemValues[field.id]}
                    onChange={e => handleChemChange(field.id, e.target.value)}
                    placeholder="Enter value"
                  />
                </div>
                <div className="chem-field">
                  <label className="chem-label">Status</label>
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: validation.valid === true ? '#dcfce7' : validation.valid === false ? '#fee2e2' : '#f1f5f9',
                    color: validation.valid === true ? '#166534' : validation.valid === false ? '#991b1b' : '#64748b',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}>
                    {validation.valid === true ? '✓ Within Tolerance' : validation.valid === false ? '✗ Out of Tolerance' : '— Enter Value'}
                  </div>
                </div>
              </div>
              {validation.message && (
                <div className={`chem-validation-msg ${validation.valid === true ? 'valid' : validation.valid === false ? 'invalid' : ''}`}>
                  {validation.message}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Result & Remarks */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">📊 Result of Chemical Analysis</h3>
          <p className="card-subtitle">Auto-calculated - Lot rejected if any chemical value is out of tolerance</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div className="chem-result-box" style={{
            background: overallResult.color + '20',
            color: overallResult.color,
            border: `2px solid ${overallResult.color}`
          }}>
            {overallResult.icon} {overallResult.status}
          </div>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            {overallResult.status === 'REJECTED'
              ? 'One or more elements are out of tolerance'
              : overallResult.status === 'ACCEPTED'
                ? 'All elements within tolerance'
                : 'Enter all values to see result'}
          </span>
        </div>
        <div className="chem-field">
          <label className="chem-label required">Remarks</label>
          <textarea
            className="chem-input"
            rows="3"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Enter remarks..."
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: 'var(--space-24)', display: 'flex', gap: 'var(--space-16)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { alert('Chemical Analysis data saved!'); onBack(); }}>Save & Continue</button>
      </div>
    </div>
  );
};

export default FinalChemicalAnalysisPage;

