import { useState, useMemo } from 'react';
import FinalSubmoduleNav from '../components/FinalSubmoduleNav';

/*
  Lots Data - Auto-fetched from Pre-Inspection
  barDia (d) comes from Pre-Inspection Data Entry where user enters Bar Diameter for each lot
  hardnessSampleSize comes from Hardness Test sample size (calculated via IS 2500)
*/
const lotsFromPreInspection = [
  { lotNo: 'LOT-001', heatNo: 'HT-2025-A1', lotSize: 500, hardnessSampleSize: 32, barDia: 14 },
  { lotNo: 'LOT-002', heatNo: 'HT-2025-A2', lotSize: 800, hardnessSampleSize: 50, barDia: 16 },
  { lotNo: 'LOT-003', heatNo: 'HT-2025-B1', lotSize: 1200, hardnessSampleSize: 50, barDia: 18 }
];

const FinalInclusionRatingPage = ({ onBack, onNavigateSubmodule }) => {
  /*
    Calculate sample size for each lot: 6 or 0.5% of hardness test sample size (whichever is higher)
    Formula: max(6, ceil(hardnessSampleSize * 0.5 / 100)) = max(6, ceil(hardnessSampleSize * 0.005))
  */
  const lotsWithSampleSize = useMemo(() => {
    return lotsFromPreInspection.map((lot) => {
      const halfPercent = Math.ceil(lot.hardnessSampleSize * 0.005);
      const sampleSize = Math.max(6, halfPercent);
      /* Max decarb limit: ≤ 0.25mm or (d/100)mm whichever is less. d = Bar Diameter from Pre-Inspection */
      const maxDecarb = Math.min(0.25, lot.barDia / 100);
      return { ...lot, sampleSize, maxDecarb };
    });
  }, []);

  /* Initialize state for each lot */
  const [lotData, setLotData] = useState(() => {
    const initial = {};
    lotsWithSampleSize.forEach((lot) => {
      initial[lot.lotNo] = {
        /* Decarb - array of values equal to sample size */
        decarb1st: Array(lot.sampleSize).fill(''),
        decarb2nd: Array(lot.sampleSize).fill(''),
        /* Inclusion - array of samples, each sample has A, B, C, D ratings */
        inclusion1st: Array(lot.sampleSize).fill(null).map(() => ({ A: '', B: '', C: '', D: '' })),
        inclusion2nd: Array(lot.sampleSize).fill(null).map(() => ({ A: '', B: '', C: '', D: '' })),
        /* Freedom from Defects - array equal to sample size */
        defects1st: Array(lot.sampleSize).fill('OK'),
        defects2nd: Array(lot.sampleSize).fill('OK'),
        remarks: ''
      };
    });
    return initial;
  });

  /* Handler for Decarb change */
  const handleDecarbChange = (lotNo, idx, value, is2nd = false) => {
    setLotData((prev) => {
      const key = is2nd ? 'decarb2nd' : 'decarb1st';
      const arr = [...prev[lotNo][key]];
      arr[idx] = value;
      return { ...prev, [lotNo]: { ...prev[lotNo], [key]: arr } };
    });
  };

  /* Handler for Inclusion change */
  const handleInclusionChange = (lotNo, sampleIdx, type, value, is2nd = false) => {
    setLotData((prev) => {
      const key = is2nd ? 'inclusion2nd' : 'inclusion1st';
      const arr = [...prev[lotNo][key]];
      arr[sampleIdx] = { ...arr[sampleIdx], [type]: value };
      return { ...prev, [lotNo]: { ...prev[lotNo], [key]: arr } };
    });
  };

  /* Handler for Defects change */
  const handleDefectsChange = (lotNo, idx, value, is2nd = false) => {
    setLotData((prev) => {
      const key = is2nd ? 'defects2nd' : 'defects1st';
      const arr = [...prev[lotNo][key]];
      arr[idx] = value;
      return { ...prev, [lotNo]: { ...prev[lotNo], [key]: arr } };
    });
  };

  /* Handler for Remarks */
  const handleRemarksChange = (lotNo, value) => {
    setLotData((prev) => ({
      ...prev,
      [lotNo]: { ...prev[lotNo], remarks: value }
    }));
  };

  /* Calculate rejections per lot - per test basis */
  const getLotRejections = (lot) => {
    const data = lotData[lot.lotNo];

    /* Decarb rejection: count values exceeding max limit */
    const decarbRej1st = data.decarb1st.filter((v) => v !== '' && parseFloat(v) > lot.maxDecarb).length;
    const decarbRej2nd = data.decarb2nd.filter((v) => v !== '' && parseFloat(v) > lot.maxDecarb).length;

    /* Inclusion rejection: ONE rejection per sample if ANY of A/B/C/D > 2.0 */
    const inclusionRej1st = data.inclusion1st.filter((sample) => {
      return Object.values(sample).some((v) => v !== '' && parseFloat(v) > 2.0);
    }).length;
    const inclusionRej2nd = data.inclusion2nd.filter((sample) => {
      return Object.values(sample).some((v) => v !== '' && parseFloat(v) > 2.0);
    }).length;

    /* Defects rejection */
    const defectsRej1st = data.defects1st.filter((v) => v === 'NOT OK').length;
    const defectsRej2nd = data.defects2nd.filter((v) => v === 'NOT OK').length;

    /* 2nd Sampling opens if rejected pieces in ANY test > 1 */
    const showDecarb2nd = decarbRej1st > 1;
    const showInclusion2nd = inclusionRej1st > 1;
    const showDefects2nd = defectsRej1st > 1;
    const show2nd = showDecarb2nd || showInclusion2nd || showDefects2nd;

    const total1st = decarbRej1st + inclusionRej1st + defectsRej1st;
    const total2nd = decarbRej2nd + inclusionRej2nd + defectsRej2nd;

    return {
      decarbRej1st, inclusionRej1st, defectsRej1st, total1st,
      decarbRej2nd, inclusionRej2nd, defectsRej2nd, total2nd,
      showDecarb2nd, showInclusion2nd, showDefects2nd, show2nd,
      totalCombined: show2nd ? total1st + total2nd : total1st
    };
  };

  const pageStyles = `
    .ir-test-section {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
    }
    .ir-test-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #0ea5e9;
    }
    .ir-note {
      font-size: 11px;
      color: #64748b;
      margin: 0 0 10px 0;
    }
    .ir-lot-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 10px;
    }
    .ir-lot-header {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px dashed #cbd5e1;
    }
    .ir-sampling-label {
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 6px;
    }
    .ir-values-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .ir-value-input {
      width: 55px;
      padding: 5px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 12px;
      text-align: center;
    }
    .ir-value-input:focus {
      outline: none;
      border-color: #0ea5e9;
    }
    .ir-table-wrap {
      overflow-x: auto;
      margin-bottom: 6px;
    }
    .ir-inclusion-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .ir-inclusion-table th,
    .ir-inclusion-table td {
      border: 1px solid #e2e8f0;
      padding: 4px 6px;
      text-align: center;
    }
    .ir-inclusion-table th {
      background: #f1f5f9;
      font-weight: 600;
    }
    .ir-inclusion-table input {
      width: 40px;
      padding: 3px;
      border: 1px solid #e2e8f0;
      border-radius: 3px;
      text-align: center;
      font-size: 11px;
    }
    .ir-inclusion-table input:focus {
      outline: none;
      border-color: #0ea5e9;
    }
    .ir-defect-select {
      padding: 4px 6px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 11px;
      min-width: 60px;
    }
    .ir-rej-info {
      font-size: 11px;
      color: #64748b;
      margin-top: 8px;
      padding: 4px 8px;
      background: #f1f5f9;
      border-radius: 4px;
      display: inline-block;
    }
    .ir-summary-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
    }
    .ir-summary-item {
      padding: 6px 10px;
      background: #f1f5f9;
      border-radius: 4px;
      font-size: 12px;
    }
    .ir-2nd-sampling {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 6px;
      padding: 10px;
      margin-top: 10px;
    }
    .ir-2nd-title {
      font-size: 12px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 8px;
    }
    @media (max-width: 768px) {
      .ir-value-input { width: 50px; font-size: 11px; }
      .ir-inclusion-table input { width: 35px; }
      .ir-defect-select { min-width: 55px; font-size: 10px; }
    }
  `;

  return (
    <div>
      <style>{pageStyles}</style>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Inclusion Rating, Decarb & Defects</h1>
          <p className="page-subtitle">No. of Readings: 6 or 0.5% of hardness sample size (whichever is higher)</p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>← Back</button>
      </div>

      <FinalSubmoduleNav currentSubmodule="final-inclusion-rating" onNavigate={onNavigateSubmodule} />

      {/* Info Note */}
      {/* <div style={{ background: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px' }}>
        <strong>Note:</strong> d = Bar Diameter (mm). Max Decarb = ≤0.25mm or (d/100)mm whichever is less.
        One or multiple rejections in Inclusion (A/B/C/D) per sample = 1 rejection only.
      </div> */}

      {/* ==================== SECTION 1: DEPTH OF DECARB ==================== */}
      <div className="ir-test-section">
        <h3 className="ir-test-title">📏 Depth of Decarburization (All Lots)</h3>

        {lotsWithSampleSize.map((lot) => {
          const data = lotData[lot.lotNo];
          const rej = getLotRejections(lot);

          return (
            <div key={lot.lotNo} className="ir-lot-block">
              <div className="ir-lot-header">
                📦 {lot.lotNo} | Heat: {lot.heatNo} | Qty: {lot.lotSize} | Sample: {lot.sampleSize} 
              </div>

              {/* 1st Sampling */}
              <div className="ir-sampling-label">1st Sampling (n1: {lot.sampleSize})</div>
              <div className="ir-values-grid">
                {data.decarb1st.map((val, idx) => (
                  <input
                    key={idx}
                    type="number"
                    step="0.01"
                    className="ir-value-input"
                    value={val}
                    onChange={(e) => handleDecarbChange(lot.lotNo, idx, e.target.value)}
                    placeholder=""
                  />
                ))}
              </div>

              {/* 2nd Sampling - show only if decarb rejected > 1 */}
              {rej.showDecarb2nd && (
                <div className="ir-2nd-sampling">
                  <div className="ir-2nd-title">⚠️ 2nd Sampling (R1: {rej.decarbRej1st} &gt; 1)</div>
                  <div className="ir-values-grid">
                    {data.decarb2nd.map((val, idx) => (
                      <input
                        key={idx}
                        type="number"
                        step="0.01"
                        className="ir-value-input"
                        value={val}
                        onChange={(e) => handleDecarbChange(lot.lotNo, idx, e.target.value, true)}
                        placeholder=""
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="ir-rej-info">
                R1: {rej.decarbRej1st} {rej.showDecarb2nd && `| R2: ${rej.decarbRej2nd}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== SECTION 2: INCLUSION RATING ==================== */}
      <div className="ir-test-section">
        <h3 className="ir-test-title">🔬 Inclusion Rating (All Lots)</h3>
        {/* <p className="ir-note">A (Sulphide) | B (Alumina) | C (Silicate) | D (Globular Oxide) — Max: 2.0 | Note: 1+ rejection in A/B/C/D = 1 sample rejection</p> */}

        {lotsWithSampleSize.map((lot) => {
          const data = lotData[lot.lotNo];
          const rej = getLotRejections(lot);

          return (
            <div key={lot.lotNo} className="ir-lot-block">
              <div className="ir-lot-header">📦 {lot.lotNo} | Heat: {lot.heatNo} | Sample: {lot.sampleSize}</div>

              {/* 1st Sampling Table */}
              <div className="ir-sampling-label">1st Sampling (n1: {lot.sampleSize})</div>
              <div className="ir-table-wrap">
                <table className="ir-inclusion-table">
                  <thead>
                    <tr>
                      <th>S#</th>
                      <th>A</th>
                      <th>B</th>
                      <th>C</th>
                      <th>D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.inclusion1st.map((sample, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        {['A', 'B', 'C', 'D'].map((type) => (
                          <td key={type}>
                            <input
                              type="number"
                              step="0.1"
                              value={sample[type]}
                              onChange={(e) => handleInclusionChange(lot.lotNo, idx, type, e.target.value)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 2nd Sampling - show only if inclusion rejected > 1 */}
              {rej.showInclusion2nd && (
                <div className="ir-2nd-sampling">
                  <div className="ir-2nd-title">⚠️ 2nd Sampling (R1: {rej.inclusionRej1st} &gt; 1)</div>
                  <div className="ir-table-wrap">
                    <table className="ir-inclusion-table">
                      <thead>
                        <tr>
                          <th>S#</th>
                          <th>A</th>
                          <th>B</th>
                          <th>C</th>
                          <th>D</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.inclusion2nd.map((sample, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            {['A', 'B', 'C', 'D'].map((type) => (
                              <td key={type}>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={sample[type]}
                                  onChange={(e) => handleInclusionChange(lot.lotNo, idx, type, e.target.value, true)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="ir-rej-info">
                R1: {rej.inclusionRej1st} {rej.showInclusion2nd && `| R2: ${rej.inclusionRej2nd}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== SECTION 3: FREEDOM FROM DEFECTS ==================== */}
      <div className="ir-test-section">
        <h3 className="ir-test-title">🛡️ Freedom from Defects (All Lots)</h3>

        {lotsWithSampleSize.map((lot) => {
          const data = lotData[lot.lotNo];
          const rej = getLotRejections(lot);

          return (
            <div key={lot.lotNo} className="ir-lot-block">
              <div className="ir-lot-header">📦 {lot.lotNo} | Heat: {lot.heatNo} | Sample: {lot.sampleSize}</div>

              {/* 1st Sampling */}
              <div className="ir-sampling-label">1st Sampling (n1: {lot.sampleSize})</div>
              <div className="ir-values-grid">
                {data.defects1st.map((val, idx) => (
                  <select
                    key={idx}
                    className="ir-defect-select"
                    value={val}
                    onChange={(e) => handleDefectsChange(lot.lotNo, idx, e.target.value)}
                  >
                    <option value="OK">OK</option>
                    <option value="NOT OK">NOT OK</option>
                  </select>
                ))}
              </div>

              {/* 2nd Sampling - show only if defects rejected > 1 */}
              {rej.showDefects2nd && (
                <div className="ir-2nd-sampling">
                  <div className="ir-2nd-title">⚠️ 2nd Sampling (R1: {rej.defectsRej1st} &gt; 1)</div>
                  <div className="ir-values-grid">
                    {data.defects2nd.map((val, idx) => (
                      <select
                        key={idx}
                        className="ir-defect-select"
                        value={val}
                        onChange={(e) => handleDefectsChange(lot.lotNo, idx, e.target.value, true)}
                      >
                        <option value="OK">OK</option>
                        <option value="NOT OK">NOT OK</option>
                      </select>
                    ))}
                  </div>
                </div>
              )}

              <div className="ir-rej-info">
                R1: {rej.defectsRej1st} {rej.showDefects2nd && `| R2: ${rej.defectsRej2nd}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== OVERALL SUMMARY ==================== */}
      <div className="ir-test-section" style={{ background: '#f0f9ff' }}>
        <h3 className="ir-test-title">📊 Summary</h3>

        {lotsWithSampleSize.map((lot) => {
          const rej = getLotRejections(lot);
          /* Accept if no 2nd sampling needed (all tests R1 ≤ 1) OR if 2nd sampling and total ≤ 2 */
          const isAccepted = !rej.show2nd || rej.totalCombined <= 2;

          return (
            <div key={lot.lotNo} className="ir-lot-block">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>📦 {lot.lotNo}</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '3px 8px', background: '#e2e8f0', borderRadius: '4px' }}>
                    Decarb: {rej.decarbRej1st}{rej.showDecarb2nd && `+${rej.decarbRej2nd}`}
                  </span>
                  <span style={{ fontSize: '11px', padding: '3px 8px', background: '#e2e8f0', borderRadius: '4px' }}>
                    Inclusion: {rej.inclusionRej1st}{rej.showInclusion2nd && `+${rej.inclusionRej2nd}`}
                  </span>
                  <span style={{ fontSize: '11px', padding: '3px 8px', background: '#e2e8f0', borderRadius: '4px' }}>
                    Defects: {rej.defectsRej1st}{rej.showDefects2nd && `+${rej.defectsRej2nd}`}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '11px',
                    background: isAccepted ? '#dcfce7' : '#fee2e2',
                    color: isAccepted ? '#166534' : '#991b1b'
                  }}>
                    {isAccepted ? '✓ OK' : '✗ NOT OK'}
                  </span>
                </div>
              </div>
              <textarea
                rows="1"
                style={{ width: '100%', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px', marginTop: '8px' }}
                value={lotData[lot.lotNo].remarks}
                onChange={(e) => handleRemarksChange(lot.lotNo, e.target.value)}
                placeholder="Remarks..."
              />
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button className="btn btn-primary" onClick={() => alert('Inclusion Rating data saved!')}>Save & Continue</button>
      </div>
    </div>
  );
};

export default FinalInclusionRatingPage;