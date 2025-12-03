import React, { useState, useMemo } from 'react';

const FinalVisualDimensionalPage = ({ onBack }) => {
  // Mock lot data from Process IC
  const availableLots = [
    { lotNo: 'LOT-001', heatNo: 'HT-2025-A1', quantity: 500, sampleSize: 50, accpNo: 2, rejNo: 3, cummRejNo: 4 },
    { lotNo: 'LOT-002', heatNo: 'HT-2025-A2', quantity: 800, sampleSize: 80, accpNo: 3, rejNo: 4, cummRejNo: 6 },
    { lotNo: 'LOT-003', heatNo: 'HT-2025-B1', quantity: 1200, sampleSize: 125, accpNo: 5, rejNo: 6, cummRejNo: 8 }
  ];

  const [selectedLot, setSelectedLot] = useState(availableLots[0].lotNo);
  const [colorCode, setColorCode] = useState('');

  // Visual Inspection state
  const [visualR1, setVisualR1] = useState(0);
  const [visualR2, setVisualR2] = useState(0);
  const [visualRemark, setVisualRemark] = useState('');

  // Dimensional Inspection state
  const [dimGoGauges1st, setDimGoGauges1st] = useState(0);
  const [dimNoGoGauges1st, setDimNoGoGauges1st] = useState(0);
  const [dimFlatBearing1st, setDimFlatBearing1st] = useState(0);
  const [dimGoGauges2nd, setDimGoGauges2nd] = useState(0);
  const [dimNoGoGauges2nd, setDimNoGoGauges2nd] = useState(0);
  const [dimFlatBearing2nd, setDimFlatBearing2nd] = useState(0);
  const [dimRemark, setDimRemark] = useState('');

  const currentLot = useMemo(() =>
    availableLots.find(l => l.lotNo === selectedLot) || availableLots[0],
    [selectedLot]
  );

  // Check if 2nd sampling is needed for Visual
  const showVisual2ndSampling = useMemo(() => {
    return visualR1 > currentLot.accpNo && visualR1 < currentLot.rejNo;
  }, [visualR1, currentLot]);

  // Total visual rejected
  const totalVisualRejected = useMemo(() => {
    return showVisual2ndSampling ? visualR1 + visualR2 : visualR1;
  }, [visualR1, visualR2, showVisual2ndSampling]);

  // Visual inspection result
  const visualResult = useMemo(() => {
    if (visualR1 <= currentLot.accpNo) return { status: 'OK', color: '#22c55e' };
    if (visualR1 > currentLot.accpNo && visualR1 < currentLot.rejNo && (visualR1 + visualR2) < currentLot.cummRejNo) {
      return { status: 'OK', color: '#22c55e' };
    }
    if (visualR1 >= currentLot.rejNo || (visualR1 + visualR2) >= currentLot.cummRejNo) {
      return { status: 'NOT OK', color: '#ef4444' };
    }
    return { status: 'Pending', color: '#f59e0b' };
  }, [visualR1, visualR2, currentLot]);

  // Total 1st sampling rejected (dimensional)
  const totalDim1stRejected = dimGoGauges1st + dimNoGoGauges1st + dimFlatBearing1st;

  // Check if 2nd sampling needed for Dimensional
  const showDim2ndSampling = useMemo(() => {
    return totalDim1stRejected > currentLot.accpNo && totalDim1stRejected < currentLot.rejNo;
  }, [totalDim1stRejected, currentLot]);

  // Total dimensional rejected
  const totalDim2ndRejected = dimGoGauges2nd + dimNoGoGauges2nd + dimFlatBearing2nd;
  const totalDimRejected = showDim2ndSampling ? totalDim1stRejected + totalDim2ndRejected : totalDim1stRejected;

  // Dimensional inspection result
  const dimResult = useMemo(() => {
    const r1 = totalDim1stRejected;
    const r1r2 = totalDimRejected;
    if (r1 <= currentLot.accpNo) return { status: 'OK', color: '#22c55e' };
    if (r1 > currentLot.accpNo && r1 < currentLot.rejNo && r1r2 < currentLot.cummRejNo) {
      return { status: 'OK', color: '#22c55e' };
    }
    if (r1 >= currentLot.rejNo || r1r2 >= currentLot.cummRejNo) {
      return { status: 'NOT OK', color: '#ef4444' };
    }
    return { status: 'Pending', color: '#f59e0b' };
  }, [totalDim1stRejected, totalDimRejected, currentLot]);

  const pageStyles = `
    .vd-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .vd-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .vd-label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }
    .vd-label.required::after {
      content: ' *';
      color: #ef4444;
    }
    .vd-input {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
    }
    .vd-input:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
    }
    .vd-input:disabled {
      background: #f1f5f9;
      color: #64748b;
    }
    .vd-result-box {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
    }
    .vd-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .vd-section-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .vd-2nd-sampling {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 12px;
      margin-top: 12px;
    }
    .vd-2nd-sampling-note {
      font-size: 11px;
      color: #92400e;
      margin-bottom: 12px;
    }
    .vd-result-logic {
      font-size: 11px;
      color: #64748b;
      background: #f1f5f9;
      padding: 8px 12px;
      border-radius: 6px;
      margin-top: 12px;
    }
    .vd-result-logic code {
      background: #e2e8f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
    @media (max-width: 768px) {
      .vd-form-grid {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
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
      .vd-form-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  return (
    <div>
      <style>{pageStyles}</style>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 className="page-title">Visual & Dimensional Check</h1>
          <p className="page-subtitle">Final Product Inspection - Separate section for each lot</p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Lot Selection & Header Info */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">📦 Lot Information</h3>
          <p className="card-subtitle">Select lot and verify auto-fetched details</p>
        </div>
        <div className="vd-form-grid">
          <div className="vd-field">
            <label className="vd-label required">Lot No.</label>
            <select className="vd-input" value={selectedLot} onChange={e => setSelectedLot(e.target.value)}>
              {availableLots.map(lot => (
                <option key={lot.lotNo} value={lot.lotNo}>{lot.lotNo}</option>
              ))}
            </select>
          </div>
          <div className="vd-field">
            <label className="vd-label">Heat No.</label>
            <input type="text" className="vd-input" value={currentLot.heatNo} disabled />
          </div>
          <div className="vd-field">
            <label className="vd-label">Quantity of Lot</label>
            <input type="number" className="vd-input" value={currentLot.quantity} disabled />
          </div>
          <div className="vd-field">
            <label className="vd-label">Sample Size</label>
            <input type="number" className="vd-input" value={currentLot.sampleSize} disabled />
          </div>
          <div className="vd-field">
            <label className="vd-label required">Color Code</label>
            <input type="text" className="vd-input" value={colorCode} onChange={e => setColorCode(e.target.value)} placeholder="Enter color code" />
          </div>
          <div className="vd-field">
            <label className="vd-label">AQL Limits</label>
            <input type="text" className="vd-input" value={`Accp: ${currentLot.accpNo} | Rej: ${currentLot.rejNo} | Cumm: ${currentLot.cummRejNo}`} disabled />
          </div>
        </div>
      </div>

      {/* Visual Inspection */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">👁️ Visual Inspection</h3>
          <p className="card-subtitle">Record pieces failing visual inspection</p>
        </div>

        <div className="vd-section">
          <h4 className="vd-section-title">1st Sampling</h4>
          <div className="vd-form-grid">
            <div className="vd-field">
              <label className="vd-label required">No. of Pieces Failing in Visual Inspection (R1)</label>
              <input type="number" className="vd-input" min="0" value={visualR1} onChange={e => setVisualR1(parseInt(e.target.value) || 0)} />
            </div>
          </div>
        </div>

        {showVisual2ndSampling && (
          <div className="vd-2nd-sampling">
            <p className="vd-2nd-sampling-note">
              ⚠️ 2nd Sampling Required: R1 ({visualR1}) is greater than acceptance no. ({currentLot.accpNo}) but less than rejection no. ({currentLot.rejNo})
            </p>
            <div className="vd-form-grid">
              <div className="vd-field">
                <label className="vd-label required">No. of Pieces Failing in 2nd Sampling (R2)</label>
                <input type="number" className="vd-input" min="0" value={visualR2} onChange={e => setVisualR2(parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>
        )}

        <div className="vd-section" style={{ marginTop: '16px' }}>
          <div className="vd-form-grid">
            <div className="vd-field">
              <label className="vd-label">Total No. of Pieces Rejected (R1 + R2)</label>
              <input type="number" className="vd-input" value={totalVisualRejected} disabled />
            </div>
            <div className="vd-field">
              <label className="vd-label">Result of Visual Inspection</label>
              <div className="vd-result-box" style={{ background: visualResult.color + '20', color: visualResult.color, border: `1px solid ${visualResult.color}` }}>
                {visualResult.status === 'OK' ? '✓' : visualResult.status === 'NOT OK' ? '✗' : '⏳'} {visualResult.status}
              </div>
            </div>
            <div className="vd-field">
              <label className="vd-label required">Remark of Visual Inspection</label>
              <input type="text" className="vd-input" value={visualRemark} onChange={e => setVisualRemark(e.target.value)} placeholder="Enter remarks" />
            </div>
          </div>
          <div className="vd-result-logic">
            <strong>Result Logic:</strong> <code>OK</code> if R1 ≤ Accp No. | <code>OK</code> if R1 &gt; Accp & R1 &lt; Rej & R1+R2 &lt; Cumm Rej | <code>NOT OK</code> if R1 ≥ Rej or R1+R2 ≥ Cumm Rej
          </div>
        </div>
      </div>

      {/* Dimensional Inspection */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">📏 Dimensional Inspection</h3>
          <p className="card-subtitle">Record pieces failing dimensional checks (Lot: {selectedLot})</p>
        </div>

        <div className="vd-section">
          <h4 className="vd-section-title">1st Sampling</h4>
          <div className="vd-form-grid">
            <div className="vd-field">
              <label className="vd-label required">No. of Pieces Failing in Go Gauges</label>
              <input type="number" className="vd-input" min="0" value={dimGoGauges1st} onChange={e => setDimGoGauges1st(parseInt(e.target.value) || 0)} />
            </div>
            <div className="vd-field">
              <label className="vd-label required">No. of Pieces Failing in No Go Gauges</label>
              <input type="number" className="vd-input" min="0" value={dimNoGoGauges1st} onChange={e => setDimNoGoGauges1st(parseInt(e.target.value) || 0)} />
            </div>
            <div className="vd-field">
              <label className="vd-label required">No. of Pieces Rejected in Flat Bearing Area</label>
              <input type="number" className="vd-input" min="0" value={dimFlatBearing1st} onChange={e => setDimFlatBearing1st(parseInt(e.target.value) || 0)} />
            </div>
            <div className="vd-field">
              <label className="vd-label">Total No. of Pieces Rejected in 1st Sampling</label>
              <input type="number" className="vd-input" value={totalDim1stRejected} disabled />
            </div>
          </div>
        </div>

        {showDim2ndSampling && (
          <div className="vd-2nd-sampling">
            <p className="vd-2nd-sampling-note">
              ⚠️ 2nd Sampling Required: Total rejected ({totalDim1stRejected}) is greater than acceptance no. ({currentLot.accpNo}) but less than rejection no. ({currentLot.rejNo})
            </p>
            <div className="vd-form-grid">
              <div className="vd-field">
                <label className="vd-label required">No. of Pieces Failing in Go Gauges</label>
                <input type="number" className="vd-input" min="0" value={dimGoGauges2nd} onChange={e => setDimGoGauges2nd(parseInt(e.target.value) || 0)} />
              </div>
              <div className="vd-field">
                <label className="vd-label required">No. of Pieces Failing in No Go Gauges</label>
                <input type="number" className="vd-input" min="0" value={dimNoGoGauges2nd} onChange={e => setDimNoGoGauges2nd(parseInt(e.target.value) || 0)} />
              </div>
              <div className="vd-field">
                <label className="vd-label required">No. of Pieces Rejected in Flat Bearing Area</label>
                <input type="number" className="vd-input" min="0" value={dimFlatBearing2nd} onChange={e => setDimFlatBearing2nd(parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>
        )}

        <div className="vd-section" style={{ marginTop: '16px' }}>
          <div className="vd-form-grid">
            <div className="vd-field">
              <label className="vd-label">Total No. of Pieces Rejected (R1 + R2)</label>
              <input type="number" className="vd-input" value={totalDimRejected} disabled />
            </div>
            <div className="vd-field">
              <label className="vd-label">Result of Dimensional Inspection</label>
              <div className="vd-result-box" style={{ background: dimResult.color + '20', color: dimResult.color, border: `1px solid ${dimResult.color}` }}>
                {dimResult.status === 'OK' ? '✓' : dimResult.status === 'NOT OK' ? '✗' : '⏳'} {dimResult.status}
              </div>
            </div>
            <div className="vd-field">
              <label className="vd-label required">Remarks</label>
              <input type="text" className="vd-input" value={dimRemark} onChange={e => setDimRemark(e.target.value)} placeholder="Enter remarks" />
            </div>
          </div>
          <div className="vd-result-logic">
            <strong>Result Logic:</strong> <code>OK</code> if R1 ≤ Accp No. | <code>OK</code> if R1 &gt; Accp & R1 &lt; Rej & R1+R2 &lt; Cumm Rej | <code>NOT OK</code> if R1 ≥ Rej or R1+R2 ≥ Cumm Rej
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: 'var(--space-24)', display: 'flex', gap: 'var(--space-16)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { alert('Visual & Dimensional data saved!'); onBack(); }}>Save & Continue</button>
      </div>
    </div>
  );
};

export default FinalVisualDimensionalPage;

