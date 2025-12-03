import { useState, useMemo } from 'react';

const FinalHardnessTestPage = ({ onBack }) => {
  // Mock lot data from Process IC
  const availableLots = [
    { lotNo: 'LOT-001', heatNo: 'HT-2025-A1', quantity: 500, sampleSize: 50, accpNo: 2, rejNo: 3, cummRejNo: 4 },
    { lotNo: 'LOT-002', heatNo: 'HT-2025-A2', quantity: 800, sampleSize: 80, accpNo: 3, rejNo: 4, cummRejNo: 6 },
    { lotNo: 'LOT-003', heatNo: 'HT-2025-B1', quantity: 1200, sampleSize: 125, accpNo: 5, rejNo: 6, cummRejNo: 8 }
  ];

  const [selectedLot, setSelectedLot] = useState(availableLots[0].lotNo);
  const [colorCode, setColorCode] = useState('');
  const [remarks, setRemarks] = useState('');

  // Hardness values for 1st sampling (array of values)
  const [hardnessValues1st, setHardnessValues1st] = useState(Array(10).fill(''));
  // Hardness values for 2nd sampling
  const [hardnessValues2nd, setHardnessValues2nd] = useState(Array(10).fill(''));

  const currentLot = useMemo(() =>
    availableLots.find(l => l.lotNo === selectedLot) || availableLots[0],
    [selectedLot]
  );

  // Count rejected pieces in 1st sampling (hardness outside 40-44 range)
  const rejected1st = useMemo(() => {
    return hardnessValues1st.filter(v => {
      if (!v || v === '') return false;
      const val = parseFloat(v);
      return val < 40 || val > 44;
    }).length;
  }, [hardnessValues1st]);

  // Check if 2nd sampling needed
  const show2ndSampling = useMemo(() => {
    return rejected1st > currentLot.accpNo && rejected1st < currentLot.rejNo;
  }, [rejected1st, currentLot]);

  // Count rejected in 2nd sampling
  const rejected2nd = useMemo(() => {
    return hardnessValues2nd.filter(v => {
      if (!v || v === '') return false;
      const val = parseFloat(v);
      return val < 40 || val > 44;
    }).length;
  }, [hardnessValues2nd]);

  const totalRejected = show2ndSampling ? rejected1st + rejected2nd : rejected1st;

  // Calculate result
  const result = useMemo(() => {
    const r1 = rejected1st;
    const r1r2 = totalRejected;
    if (r1 <= currentLot.accpNo) return { status: 'OK', color: '#22c55e', icon: '✓' };
    if (r1 > currentLot.accpNo && r1 < currentLot.rejNo && r1r2 < currentLot.cummRejNo) {
      return { status: 'OK', color: '#22c55e', icon: '✓' };
    }
    if (r1 >= currentLot.rejNo || r1r2 >= currentLot.cummRejNo) {
      return { status: 'NOT OK', color: '#ef4444', icon: '✗' };
    }
    return { status: 'PENDING', color: '#f59e0b', icon: '⏳' };
  }, [rejected1st, totalRejected, currentLot]);

  const handleHardnessChange = (index, value, is2nd = false) => {
    if (is2nd) {
      setHardnessValues2nd(prev => { const arr = [...prev]; arr[index] = value; return arr; });
    } else {
      setHardnessValues1st(prev => { const arr = [...prev]; arr[index] = value; return arr; });
    }
  };

  const getValueStatus = (value) => {
    if (!value || value === '') return 'empty';
    const val = parseFloat(value);
    return (val >= 40 && val <= 44) ? 'pass' : 'fail';
  };

  const pageStyles = `
    .ht-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .ht-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ht-label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }
    .ht-label.required::after {
      content: ' *';
      color: #ef4444;
    }
    .ht-input {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
    }
    .ht-input:focus {
      outline: none;
      border-color: #0ea5e9;
    }
    .ht-input:disabled {
      background: #f1f5f9;
      color: #64748b;
    }
    .ht-values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 10px;
    }
    .ht-value-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ht-value-label {
      font-size: 10px;
      color: #64748b;
      font-weight: 500;
    }
    .ht-value-input {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
    }
    .ht-value-input:focus {
      outline: none;
      border-color: #0ea5e9;
    }
    .ht-value-input.pass {
      border-color: #22c55e;
      background: #f0fdf4;
    }
    .ht-value-input.fail {
      border-color: #ef4444;
      background: #fef2f2;
    }
    .ht-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .ht-section-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ht-2nd-sampling {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
    }
    .ht-2nd-note {
      font-size: 11px;
      color: #92400e;
      margin-bottom: 12px;
    }
    .ht-upload-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      padding: 12px;
      background: #f0f9ff;
      border: 1px dashed #0ea5e9;
      border-radius: 8px;
    }
    .ht-upload-btn {
      padding: 8px 16px;
      background: #0ea5e9;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }
    .ht-upload-text {
      font-size: 11px;
      color: #0369a1;
    }
    .ht-result-box {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .ht-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .ht-stat-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .ht-stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }
    .ht-stat-label {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    @media (max-width: 768px) {
      .ht-form-grid {
        grid-template-columns: 1fr 1fr;
      }
      .ht-values-grid {
        grid-template-columns: repeat(5, 1fr);
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
      .ht-form-grid {
        grid-template-columns: 1fr;
      }
      .ht-values-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `;

  return (
    <div>
      <style>{pageStyles}</style>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 className="page-title">Hardness Test</h1>
          <p className="page-subtitle">Final Product Inspection - Separate section for each lot</p>
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
        <div className="ht-form-grid">
          <div className="ht-field">
            <label className="ht-label required">Lot No.</label>
            <select className="ht-input" value={selectedLot} onChange={e => setSelectedLot(e.target.value)}>
              {availableLots.map(lot => (
                <option key={lot.lotNo} value={lot.lotNo}>{lot.lotNo}</option>
              ))}
            </select>
          </div>
          <div className="ht-field">
            <label className="ht-label">Heat No.</label>
            <input type="text" className="ht-input" value={currentLot.heatNo} disabled />
          </div>
          <div className="ht-field">
            <label className="ht-label">Quantity of Lot</label>
            <input type="number" className="ht-input" value={currentLot.quantity} disabled />
          </div>
          <div className="ht-field">
            <label className="ht-label">Sample Size (IS 2500)</label>
            <input type="number" className="ht-input" value={currentLot.sampleSize} disabled />
          </div>
          <div className="ht-field">
            <label className="ht-label required">Color Code</label>
            <input type="text" className="ht-input" value={colorCode} onChange={e => setColorCode(e.target.value)} placeholder="Enter color code" />
          </div>
          <div className="ht-field">
            <label className="ht-label">AQL Limits</label>
            <input type="text" className="ht-input" value={`Accp: ${currentLot.accpNo} | Rej: ${currentLot.rejNo} | Cumm: ${currentLot.cummRejNo}`} disabled />
          </div>
        </div>
      </div>

      {/* Hardness Specification */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">💎 Hardness Test - 1st Sampling</h3>
          <p className="card-subtitle">Acceptable Range: 40-44 HRC</p>
        </div>

        <div className="ht-section">
          <h4 className="ht-section-title">Enter Hardness Values (HRC)</h4>
          <div className="ht-values-grid">
            {hardnessValues1st.map((val, idx) => (
              <div key={idx} className="ht-value-item">
                <label className="ht-value-label">Sample {idx + 1}</label>
                <input
                  type="number"
                  step="0.1"
                  className={`ht-value-input ${getValueStatus(val)}`}
                  value={val}
                  onChange={e => handleHardnessChange(idx, e.target.value)}
                  placeholder="40-44"
                />
              </div>
            ))}
          </div>
          <div className="ht-upload-section">
            <button className="ht-upload-btn">📤 Upload Excel/CSV</button>
            <span className="ht-upload-text">Option to upload all values through pre-defined template</span>
          </div>
        </div>

        <div className="ht-stats-grid">
          <div className="ht-stat-card">
            <div className="ht-stat-value">{hardnessValues1st.filter(v => v !== '').length}</div>
            <div className="ht-stat-label">Samples Tested</div>
          </div>
          <div className="ht-stat-card">
            <div className="ht-stat-value" style={{ color: '#22c55e' }}>{hardnessValues1st.filter(v => getValueStatus(v) === 'pass').length}</div>
            <div className="ht-stat-label">Passed</div>
          </div>
          <div className="ht-stat-card">
            <div className="ht-stat-value" style={{ color: '#ef4444' }}>{rejected1st}</div>
            <div className="ht-stat-label">Rejected (R1)</div>
          </div>
        </div>
      </div>

      {/* 2nd Sampling - Conditional */}
      {show2ndSampling && (
        <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
          <div className="card-header" style={{ background: '#fef3c7' }}>
            <h3 className="card-title">⚠️ 2nd Sampling Required</h3>
            <p className="card-subtitle">R1 ({rejected1st}) is greater than Acceptance No. ({currentLot.accpNo}) but less than Rejection No. ({currentLot.rejNo})</p>
          </div>

          <div className="ht-2nd-sampling">
            <p className="ht-2nd-note">Enter hardness values for 2nd sampling batch</p>
            <div className="ht-values-grid">
              {hardnessValues2nd.map((val, idx) => (
                <div key={idx} className="ht-value-item">
                  <label className="ht-value-label">Sample {idx + 1}</label>
                  <input
                    type="number"
                    step="0.1"
                    className={`ht-value-input ${getValueStatus(val)}`}
                    value={val}
                    onChange={e => handleHardnessChange(idx, e.target.value, true)}
                    placeholder="40-44"
                  />
                </div>
              ))}
            </div>
            <div className="ht-upload-section" style={{ background: '#fef9c3' }}>
              <button className="ht-upload-btn">📤 Upload Excel/CSV</button>
              <span className="ht-upload-text">Option to upload 2nd sampling values</span>
            </div>
          </div>

          <div className="ht-stats-grid" style={{ marginTop: '16px' }}>
            <div className="ht-stat-card">
              <div className="ht-stat-value" style={{ color: '#ef4444' }}>{rejected2nd}</div>
              <div className="ht-stat-label">Rejected in 2nd (R2)</div>
            </div>
            <div className="ht-stat-card">
              <div className="ht-stat-value" style={{ color: '#ef4444' }}>{totalRejected}</div>
              <div className="ht-stat-label">Total Rejected (R1+R2)</div>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">📊 Result of Hardness Test</h3>
          <p className="card-subtitle">Auto-calculated based on rejection criteria</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div className="ht-result-box" style={{
            background: result.color + '20',
            color: result.color,
            border: `2px solid ${result.color}`
          }}>
            {result.icon} {result.status}
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Result Logic:</strong><br/>
          • <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>OK</code> if R1 ≤ Accp No.<br/>
          • <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>OK</code> if R1 &gt; Accp & R1 &lt; Rej & R1+R2 &lt; Cumm Rej<br/>
          • <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>NOT OK</code> if R1 ≥ Rej or R1+R2 ≥ Cumm Rej
        </div>
        <div className="ht-field">
          <label className="ht-label required">Remarks</label>
          <textarea
            className="ht-input"
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
        <button className="btn btn-primary" onClick={() => { alert('Hardness Test data saved!'); onBack(); }}>Save & Continue</button>
      </div>
    </div>
  );
};

export default FinalHardnessTestPage;

