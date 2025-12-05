import { useMemo, useState } from "react";
import FinalSubmoduleNav from '../components/FinalSubmoduleNav';
import ExcelImport from '../components/ExcelImport';
import { getDimensionWeightAQL } from '../utils/is2500Calculations';
import "./FinalApplicationDeflectionPage.css";

/* Mock lots - replace with API */
const LOTS = [
  { lotNo: "LOT-001", heatNo: "HT-2025-A1", quantity: 500 },
  { lotNo: "LOT-002", heatNo: "HT-2025-A2", quantity: 800 },
  { lotNo: "LOT-003", heatNo: "HT-2025-B1", quantity: 1200 }
];

const PAGE_SIZE = 10;

const FinalApplicationDeflectionPage = ({ onBack, onNavigateSubmodule }) => {
  /* Build lot data with IS 2500 Table 2 - Dimension & Weight (AQL 2.5) */
  const lotsData = useMemo(() => LOTS.map(lot => {
    const aql = getDimensionWeightAQL(lot.quantity);
    return {
      ...lot,
      sampleSize: aql.n1,
      sampleSize2nd: aql.n2,
      accpNo: aql.ac1,
      rejNo: aql.re1,
      cummRejNo: aql.cummRej,
      useSingleSampling: aql.useSingleSampling
    };
  }), []);

  /* State for all lots */
  const [lotStates, setLotStates] = useState(() => {
    const initial = {};
    lotsData.forEach(lot => {
      initial[lot.lotNo] = {
        deflection1st: Array(lot.sampleSize).fill(''),
        deflection2nd: Array(lot.sampleSize2nd).fill(''),
        remarks: '',
        show2ndTriggered: false
      };
    });
    return initial;
  });

  /* Pagination states */
  const [page1st, setPage1st] = useState({});
  const [page2nd, setPage2nd] = useState({});

  /* Handle deflection input change */
  const handleDeflectionChange = (lotNo, index, value, isSecond) => {
    setLotStates(prev => {
      const lotState = { ...prev[lotNo] };
      if (isSecond) {
        const arr = [...lotState.deflection2nd];
        arr[index] = value;
        lotState.deflection2nd = arr;
      } else {
        const arr = [...lotState.deflection1st];
        arr[index] = value;
        lotState.deflection1st = arr;
      }
      return { ...prev, [lotNo]: lotState };
    });
  };

  /* Handle remarks change */
  const handleRemarksChange = (lotNo, value) => {
    setLotStates(prev => ({
      ...prev,
      [lotNo]: { ...prev[lotNo], remarks: value }
    }));
  };

  /* Handle Excel import for deflection values */
  const handleExcelImport = (lotNo, values, isSecond) => {
    setLotStates(prev => {
      const lotState = { ...prev[lotNo] };
      if (isSecond) {
        lotState.deflection2nd = values;
      } else {
        lotState.deflection1st = values;
      }
      return { ...prev, [lotNo]: lotState };
    });
  };

  /* Calculate summary for a lot - PASS if deflection is within acceptable range (example: > 0) */
  const getSummary = (lot) => {
    const state = lotStates[lot.lotNo];
    const r1 = state.deflection1st.filter(v => {
      const num = parseFloat(v);
      return v !== '' && !isNaN(num) && num <= 0;
    }).length;

    const r2 = state.deflection2nd.filter(v => {
      const num = parseFloat(v);
      return v !== '' && !isNaN(num) && num <= 0;
    }).length;

    const total = r1 + r2;
    const needSecond = r1 > lot.accpNo && r1 < lot.rejNo;

    if (needSecond && !state.show2ndTriggered) {
      setLotStates(prev => ({
        ...prev,
        [lot.lotNo]: { ...prev[lot.lotNo], show2ndTriggered: true }
      }));
    }

    const showSecond = state.show2ndTriggered || needSecond;

    let result = 'PENDING';
    let color = '#f59e0b';
    const hasInput = state.deflection1st.some(v => v !== '');

    if (hasInput) {
      if (r1 <= lot.accpNo) {
        result = 'OK'; color = '#16a34a';
      } else if (r1 >= lot.rejNo) {
        result = 'NOT OK'; color = '#dc2626';
      } else if (showSecond) {
        if (total < lot.cummRejNo) {
          result = 'OK'; color = '#16a34a';
        } else if (total >= lot.cummRejNo) {
          result = 'NOT OK'; color = '#dc2626';
        }
      }
    }

    return { r1, r2, total, showSecond, result, color };
  };

  return (
    <div className="ad-container">
      {/* HEADER */}
      <div className="ad-header">
        <div>
          <h1 className="ad-title">Application & Deflection Test</h1>
          <p className="ad-subtitle">Final Product Inspection — Load Deflection (IS 2500 Table 2 - AQL 2.5)</p>
        </div>
        <button className="ad-btn ad-btn-outline" onClick={onBack}>← Back</button>
      </div>

      {/* Submodule Navigation */}
      <FinalSubmoduleNav currentSubmodule="final-application-deflection" onNavigate={onNavigateSubmodule} />

      {/* ALL LOTS */}
      {lotsData.map(lot => {
        const state = lotStates[lot.lotNo];
        const summary = getSummary(lot);
        const currentPage1 = page1st[lot.lotNo] || 0;
        const currentPage2 = page2nd[lot.lotNo] || 0;

        return (
          <div key={lot.lotNo} className="ad-card">
            {/* Lot Header */}
            <div className="ad-lot-header">
              <div className="ad-lot-info">
                <span className="ad-lot-badge">📦 Lot: <strong>{lot.lotNo}</strong></span>
                <span className="ad-lot-meta">Heat: {lot.heatNo}</span>
                <span className="ad-lot-meta">Qty: {lot.quantity}</span>
              </div>
              <div className="ad-lot-sample">
                Sample Size (IS 2500): <strong>{lot.sampleSize}</strong>
              </div>
            </div>

            {/* 1st Sampling */}
            <div className="ad-sampling-block">
              <div className="ad-sampling-header">
                <div className="ad-sampling-title">1st Sampling – Deflection (mm)</div>
                <ExcelImport
                  templateName={`${lot.lotNo}_Deflection_1st`}
                  sampleSize={lot.sampleSize}
                  valueLabel="Deflection (mm)"
                  onImport={(values) => handleExcelImport(lot.lotNo, values, false)}
                />
              </div>
              <div className="ad-input-grid">
                {state.deflection1st.slice(currentPage1 * PAGE_SIZE, (currentPage1 + 1) * PAGE_SIZE).map((val, idx) => {
                  const actualIdx = currentPage1 * PAGE_SIZE + idx;
                  const num = parseFloat(val);
                  const status = val === '' ? '' : (isNaN(num) ? '' : (num > 0 ? 'pass' : 'fail'));
                  return (
                    <div key={actualIdx} className="ad-input-wrapper">
                      <span className="ad-input-label">{actualIdx + 1}</span>
                      <input type="number" step="0.1" className={`ad-input ad-input-sm ${status}`} value={val} onChange={(e) => handleDeflectionChange(lot.lotNo, actualIdx, e.target.value, false)} />
                    </div>
                  );
                })}
              </div>
              <div className="ad-summary-row">
                <div className="ad-summary-left">
                  <div className="ad-summary-item">Rejected (R1): <strong className="ad-r1">{summary.r1}</strong></div>
                  <div className="ad-summary-item">Accp No.: <strong>{lot.accpNo}</strong> | Rej No.: <strong>{lot.rejNo}</strong> | Cumm. Rej: <strong>{lot.cummRejNo}</strong></div>
                </div>
                {lot.sampleSize > PAGE_SIZE && (
                  <div className="ad-pagination">
                    <button className="ad-page-btn" disabled={currentPage1 === 0} onClick={() => setPage1st(p => ({ ...p, [lot.lotNo]: currentPage1 - 1 }))}>‹ Prev</button>
                    <span className="ad-page-info">{currentPage1 * PAGE_SIZE + 1}–{Math.min((currentPage1 + 1) * PAGE_SIZE, lot.sampleSize)} of {lot.sampleSize}</span>
                    <button className="ad-page-btn" disabled={(currentPage1 + 1) * PAGE_SIZE >= lot.sampleSize} onClick={() => setPage1st(p => ({ ...p, [lot.lotNo]: currentPage1 + 1 }))}>Next ›</button>
                  </div>
                )}
              </div>
            </div>

            {/* 2nd Sampling */}
            {summary.showSecond && (
              <div className="ad-sampling-block ad-sampling-second">
                <div className="ad-sampling-header">
                  <div className="ad-sampling-title">2nd Sampling – Deflection (mm)</div>
                  <ExcelImport
                    templateName={`${lot.lotNo}_Deflection_2nd`}
                    sampleSize={lot.sampleSize2nd}
                    valueLabel="Deflection (mm)"
                    onImport={(values) => handleExcelImport(lot.lotNo, values, true)}
                  />
                </div>
                <div className="ad-input-grid">
                  {state.deflection2nd.slice(currentPage2 * PAGE_SIZE, (currentPage2 + 1) * PAGE_SIZE).map((val, idx) => {
                    const actualIdx = currentPage2 * PAGE_SIZE + idx;
                    const num = parseFloat(val);
                    const status = val === '' ? '' : (isNaN(num) ? '' : (num > 0 ? 'pass' : 'fail'));
                    return (
                      <div key={actualIdx} className="ad-input-wrapper">
                        <span className="ad-input-label">{actualIdx + 1}</span>
                        <input type="number" step="0.1" className={`ad-input ad-input-sm ${status}`} value={val} onChange={(e) => handleDeflectionChange(lot.lotNo, actualIdx, e.target.value, true)} />
                      </div>
                    );
                  })}
                </div>
                <div className="ad-summary-row">
                  <div className="ad-summary-left">
                    <div className="ad-summary-item">Rejected (R2): <strong className="ad-r2">{summary.r2}</strong></div>
                    <div className="ad-summary-item">Total (R1 + R2): <strong className={summary.total >= lot.cummRejNo ? 'ad-fail' : 'ad-ok'}>{summary.total}</strong></div>
                  </div>
                  {lot.sampleSize2nd > PAGE_SIZE && (
                    <div className="ad-pagination">
                      <button className="ad-page-btn" disabled={currentPage2 === 0} onClick={() => setPage2nd(p => ({ ...p, [lot.lotNo]: currentPage2 - 1 }))}>‹ Prev</button>
                      <span className="ad-page-info">{currentPage2 * PAGE_SIZE + 1}–{Math.min((currentPage2 + 1) * PAGE_SIZE, lot.sampleSize2nd)} of {lot.sampleSize2nd}</span>
                      <button className="ad-page-btn" disabled={(currentPage2 + 1) * PAGE_SIZE >= lot.sampleSize2nd} onClick={() => setPage2nd(p => ({ ...p, [lot.lotNo]: currentPage2 + 1 }))}>Next ›</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Result & Remarks */}
            <div className="ad-final-row">
              <div className="ad-final-result">
                <label className="ad-label">Result of Application & Deflection Test</label>
                <div className="ad-result-box" style={{ borderColor: summary.color, color: summary.color }}>{summary.result}</div>
                {/* <div className="ad-result-note">
                  <span className="ad-note-ok">✓ OK if R1 ≤ Accp No.</span><br />
                  <span className="ad-note-ok">✓ OK if Accp No. &lt; R1 &lt; Rej No. AND (R1 + R2) &lt; Cumm. Rej. No.</span><br />
                  <span className="ad-note-fail">✗ NOT OK if R1 ≥ Rej No. OR (R1 + R2) ≥ Cumm. Rej. No.</span>
                </div> */}
              </div>
              <div className="ad-remarks">
                <label className="ad-label">Remarks</label>
                <textarea className="ad-input ad-textarea" rows="3" value={state.remarks} onChange={(e) => handleRemarksChange(lot.lotNo, e.target.value)} placeholder="Enter remarks..." />
              </div>
            </div>
          </div>
        );
      })}

      {/* Page Actions */}
      <div className="ad-actions">
        <button className="ad-btn ad-btn-outline" onClick={onBack}>Cancel</button>
        <button className="ad-btn ad-btn-primary" onClick={() => alert('Saved!')}>Save & Continue</button>
      </div>
    </div>
  );
};

export default FinalApplicationDeflectionPage;
