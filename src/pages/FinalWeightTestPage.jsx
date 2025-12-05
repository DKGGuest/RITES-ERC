// src/pages/FinalWeightTestPage.jsx
import { useMemo, useState } from "react";
import FinalSubmoduleNav from '../components/FinalSubmoduleNav';
import ExcelImport from '../components/ExcelImport';
import { getDimensionWeightAQL } from '../utils/is2500Calculations';
import "./FinalWeightTestPage.css";

/* Mock lots - replace with API */
const LOTS = [
  { lotNo: "LOT-001", heatNo: "HT-2025-A1", quantity: 500, springType: "MK-III" },
  { lotNo: "LOT-002", heatNo: "HT-2025-A2", quantity: 800, springType: "MK-V" },
  { lotNo: "LOT-003", heatNo: "HT-2025-B1", quantity: 1200, springType: "ERC-J" }
];

/* Weight Tolerance Table from Excel */
const TOLERANCE = { "MK-III": 904, "MK-V": 1068, "ERC-J": 904 };

const PAGE_SIZE = 10;

export default function FinalWeightTestPage({ onBack, onNavigateSubmodule }) {
  /* Build lot data with IS 2500 Table 2 calculations */
  const lotsData = useMemo(() => LOTS.map(lot => {
    const aql = getDimensionWeightAQL(lot.quantity);
    return {
      ...lot,
      sampleSize: aql.n1,
      sampleSize2nd: aql.n2,
      accpNo: aql.ac1,
      rejNo: aql.re1,
      cummRejNo: aql.cummRej,
      useSingleSampling: aql.useSingleSampling,
      minWeight: TOLERANCE[lot.springType] || 904
    };
  }), []);

  /* State for all lots */
  const [lotStates, setLotStates] = useState(() => {
    const initial = {};
    lotsData.forEach(lot => {
      initial[lot.lotNo] = {
        weight1st: Array(lot.sampleSize).fill(''),
        weight2nd: Array(lot.sampleSize2nd).fill(''),
        remarks: '',
        show2ndTriggered: false
      };
    });
    return initial;
  });

  /* Pagination states */
  const [page1st, setPage1st] = useState({});
  const [page2nd, setPage2nd] = useState({});

  /* Handle weight input change */
  const handleWeightChange = (lotNo, index, value, isSecond) => {
    setLotStates(prev => {
      const lotState = { ...prev[lotNo] };
      if (isSecond) {
        const arr = [...lotState.weight2nd];
        arr[index] = value;
        lotState.weight2nd = arr;
      } else {
        const arr = [...lotState.weight1st];
        arr[index] = value;
        lotState.weight1st = arr;
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

  /* Handle Excel import for weight values */
  const handleExcelImport = (lotNo, values, isSecond) => {
    setLotStates(prev => ({
      ...prev,
      [lotNo]: {
        ...prev[lotNo],
        [isSecond ? 'weight2nd' : 'weight1st']: values
      }
    }));
  };

  /* Calculate summary for a lot */
  const getSummary = (lot) => {
    const state = lotStates[lot.lotNo];
    const r1 = state.weight1st.filter(v => {
      const num = parseFloat(v);
      return !isNaN(num) && num < lot.minWeight;
    }).length;

    const r2 = state.weight2nd.filter(v => {
      const num = parseFloat(v);
      return !isNaN(num) && num < lot.minWeight;
    }).length;

    const total = r1 + r2;
    const needSecond = r1 > lot.accpNo && r1 < lot.rejNo;

    // Once 2nd sampling is triggered, keep it visible
    if (needSecond && !state.show2ndTriggered) {
      setLotStates(prev => ({
        ...prev,
        [lot.lotNo]: { ...prev[lot.lotNo], show2ndTriggered: true }
      }));
    }

    const showSecond = state.show2ndTriggered || needSecond;

    // Determine result
    let result = 'PENDING';
    let color = '#f59e0b';
    const hasInput = state.weight1st.some(v => v !== '');

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
    <div className="wt-container">
      {/* HEADER */}
      <div className="wt-header">
        <div>
          <h1 className="wt-title">Weight Test</h1>
          <p className="wt-subtitle">Final Product Inspection — Weight Measurement (IS 2500 Table 2 - AQL 2.5)</p>
        </div>
        <button className="wt-btn-outline" onClick={onBack}>← Back</button>
      </div>

      {/* Submodule Navigation */}
      <FinalSubmoduleNav currentSubmodule="final-weight-test" onNavigate={onNavigateSubmodule} />

      {/* ALL LOTS */}
      {lotsData.map(lot => {
        const state = lotStates[lot.lotNo];
        const summary = getSummary(lot);
        const currentPage1 = page1st[lot.lotNo] || 0;
        const currentPage2 = page2nd[lot.lotNo] || 0;

        return (
          <div key={lot.lotNo} className="wt-card">
            {/* Lot Header */}
            <div className="wt-lot-header">
              <div className="wt-lot-info">
                <span className="wt-lot-badge">📦 Lot: <strong>{lot.lotNo}</strong></span>
                <span className="wt-lot-meta">Heat: {lot.heatNo}</span>
                <span className="wt-lot-meta">Qty: {lot.quantity}</span>
                <span className="wt-lot-meta">Type: {lot.springType}</span>
              </div>
              <div className="wt-lot-sample">
                Sample Size (IS 2500): <strong>{lot.sampleSize}</strong> | Min Weight: <strong>{lot.minWeight}g</strong>
              </div>
            </div>

            {/* 1st Sampling */}
            <div className="wt-sampling-block">
              <div className="wt-sampling-header">
                <div className="wt-sampling-title">1st Sampling – Weight (g)</div>
                <ExcelImport
                  templateName={`${lot.lotNo}_Weight_1st`}
                  sampleSize={lot.sampleSize}
                  valueLabel="Weight (g)"
                  onImport={(values) => handleExcelImport(lot.lotNo, values, false)}
                />
              </div>
              <div className="wt-input-grid">
                {state.weight1st.slice(currentPage1 * PAGE_SIZE, (currentPage1 + 1) * PAGE_SIZE).map((val, idx) => {
                  const actualIdx = currentPage1 * PAGE_SIZE + idx;
                  const num = parseFloat(val);
                  const status = val === '' ? '' : (isNaN(num) ? '' : (num >= lot.minWeight ? 'pass' : 'fail'));
                  return (
                    <div key={actualIdx} className="wt-input-wrapper">
                      <span className="wt-input-label">{actualIdx + 1}</span>
                      <input type="number" step="0.1" className={`wt-input wt-input-sm ${status}`} value={val} onChange={(e) => handleWeightChange(lot.lotNo, actualIdx, e.target.value, false)} />
                    </div>
                  );
                })}
              </div>
              <div className="wt-summary-row">
                <div className="wt-summary-left">
                  <div className="wt-summary-item">Rejected (R1): <strong className="wt-r1">{summary.r1}</strong></div>
                  <div className="wt-summary-item">Accp No.: <strong>{lot.accpNo}</strong> | Rej No.: <strong>{lot.rejNo}</strong> | Cumm. Rej: <strong>{lot.cummRejNo}</strong></div>
                </div>
                {lot.sampleSize > PAGE_SIZE && (
                  <div className="wt-pagination">
                    <button className="wt-page-btn" disabled={currentPage1 === 0} onClick={() => setPage1st(p => ({ ...p, [lot.lotNo]: currentPage1 - 1 }))}>‹ Prev</button>
                    <span className="wt-page-info">{currentPage1 * PAGE_SIZE + 1}–{Math.min((currentPage1 + 1) * PAGE_SIZE, lot.sampleSize)} of {lot.sampleSize}</span>
                    <button className="wt-page-btn" disabled={(currentPage1 + 1) * PAGE_SIZE >= lot.sampleSize} onClick={() => setPage1st(p => ({ ...p, [lot.lotNo]: currentPage1 + 1 }))}>Next ›</button>
                  </div>
                )}
              </div>
            </div>

            {/* 2nd Sampling */}
            {summary.showSecond && (
              <div className="wt-sampling-block wt-sampling-second">
                <div className="wt-sampling-header">
                  <div className="wt-sampling-title">2nd Sampling – Weight (g)</div>
                  <ExcelImport
                    templateName={`${lot.lotNo}_Weight_2nd`}
                    sampleSize={lot.sampleSize2nd}
                    valueLabel="Weight (g)"
                    onImport={(values) => handleExcelImport(lot.lotNo, values, true)}
                  />
                </div>
                <div className="wt-input-grid">
                  {state.weight2nd.slice(currentPage2 * PAGE_SIZE, (currentPage2 + 1) * PAGE_SIZE).map((val, idx) => {
                    const actualIdx = currentPage2 * PAGE_SIZE + idx;
                    const num = parseFloat(val);
                    const status = val === '' ? '' : (isNaN(num) ? '' : (num >= lot.minWeight ? 'pass' : 'fail'));
                    return (
                      <div key={actualIdx} className="wt-input-wrapper">
                        <span className="wt-input-label">{actualIdx + 1}</span>
                        <input type="number" step="0.1" className={`wt-input wt-input-sm ${status}`} value={val} onChange={(e) => handleWeightChange(lot.lotNo, actualIdx, e.target.value, true)} />
                      </div>
                    );
                  })}
                </div>
                <div className="wt-summary-row">
                  <div className="wt-summary-left">
                    <div className="wt-summary-item">Rejected (R2): <strong className="wt-r2">{summary.r2}</strong></div>
                    <div className="wt-summary-item">Total (R1 + R2): <strong className={summary.total >= lot.cummRejNo ? 'wt-fail' : 'wt-ok'}>{summary.total}</strong></div>
                  </div>
                  {lot.sampleSize2nd > PAGE_SIZE && (
                    <div className="wt-pagination">
                      <button className="wt-page-btn" disabled={currentPage2 === 0} onClick={() => setPage2nd(p => ({ ...p, [lot.lotNo]: currentPage2 - 1 }))}>‹ Prev</button>
                      <span className="wt-page-info">{currentPage2 * PAGE_SIZE + 1}–{Math.min((currentPage2 + 1) * PAGE_SIZE, lot.sampleSize2nd)} of {lot.sampleSize2nd}</span>
                      <button className="wt-page-btn" disabled={(currentPage2 + 1) * PAGE_SIZE >= lot.sampleSize2nd} onClick={() => setPage2nd(p => ({ ...p, [lot.lotNo]: currentPage2 + 1 }))}>Next ›</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Result & Remarks */}
            <div className="wt-final-row">
              <div className="wt-final-result">
                <label className="wt-label">Result of Weight Test</label>
                <div className="wt-result-box" style={{ borderColor: summary.color, color: summary.color }}>{summary.result}</div>
                {/* <div className="wt-result-note">
                  <span className="wt-note-ok">✓ OK if R1 ≤ Accp No.</span><br />
                  <span className="wt-note-ok">✓ OK if Accp No. &lt; R1 &lt; Rej No. AND (R1 + R2) &lt; Cumm. Rej. No.</span><br />
                  <span className="wt-note-fail">✗ NOT OK if R1 ≥ Rej No. OR (R1 + R2) ≥ Cumm. Rej. No.</span>
                </div> */}
              </div>
              <div className="wt-remarks">
                <label className="wt-label">Remarks</label>
                <textarea className="wt-input wt-textarea" rows="3" value={state.remarks} onChange={(e) => handleRemarksChange(lot.lotNo, e.target.value)} placeholder="Enter remarks..." />
              </div>
            </div>
          </div>
        );
      })}

      {/* Page Actions */}
      <div className="wt-action">
        <button className="wt-btn-outline" onClick={onBack}>Cancel</button>
        <button className="wt-btn-primary" onClick={() => alert('Saved!')}>Save & Continue</button>
      </div>
    </div>
  );
}
