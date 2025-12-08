import { useMemo, useState } from "react";
import FinalSubmoduleNav from '../components/FinalSubmoduleNav';
import { getDimensionWeightAQL } from '../utils/is2500Calculations';
import "./FinalApplicationDeflectionPage.css";

/* Mock lots - replace with API */
const LOTS = [
  { lotNo: "LOT-001", heatNo: "HT-2025-A1", quantity: 500 },
  { lotNo: "LOT-002", heatNo: "HT-2025-A2", quantity: 800 },
  { lotNo: "LOT-003", heatNo: "HT-2025-B1", quantity: 1200 }
];

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

  /* State for all lots - simplified: only failed count (R1, R2) and remarks */
  const [lotStates, setLotStates] = useState(() => {
    const initial = {};
    lotsData.forEach(lot => {
      initial[lot.lotNo] = {
        r1: '',
        r2: '',
        remarks: ''
      };
    });
    return initial;
  });

  /* Handle R1 change */
  const handleR1Change = (lotNo, value) => {
    const numVal = value === '' ? '' : Math.max(0, parseInt(value) || 0);
    setLotStates(prev => ({
      ...prev,
      [lotNo]: { ...prev[lotNo], r1: numVal }
    }));
  };

  /* Handle R2 change */
  const handleR2Change = (lotNo, value) => {
    const numVal = value === '' ? '' : Math.max(0, parseInt(value) || 0);
    setLotStates(prev => ({
      ...prev,
      [lotNo]: { ...prev[lotNo], r2: numVal }
    }));
  };

  /* Handle remarks change */
  const handleRemarksChange = (lotNo, value) => {
    setLotStates(prev => ({
      ...prev,
      [lotNo]: { ...prev[lotNo], remarks: value }
    }));
  };

  /* Calculate summary for a lot */
  const getSummary = (lot) => {
    const state = lotStates[lot.lotNo];
    const r1 = state.r1 === '' ? 0 : parseInt(state.r1);
    const r2 = state.r2 === '' ? 0 : parseInt(state.r2);
    const total = r1 + r2;
    const hasR1Input = state.r1 !== '';

    /* Show 2nd sampling if R1 > Acceptance No. AND R1 < Rejection No. */
    const showSecond = hasR1Input && r1 > lot.accpNo && r1 < lot.rejNo;

    let result = 'PENDING';
    let color = '#f59e0b';

    if (hasR1Input) {
      if (r1 <= lot.accpNo) {
        result = 'OK'; color = '#16a34a';
      } else if (r1 >= lot.rejNo) {
        result = 'NOT OK'; color = '#dc2626';
      } else if (showSecond && state.r2 !== '') {
        if (total < lot.cummRejNo) {
          result = 'OK'; color = '#16a34a';
        } else {
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

        return (
          <div key={lot.lotNo} className="ad-card">
            {/* Lot Header */}
            <div className="ad-lot-header">
              <div className="ad-lot-info">
                <span className="ad-lot-badge">📦 Lot: <strong>{lot.lotNo}</strong></span>
                <span className="ad-lot-meta">Heat: {lot.heatNo}</span>
                <span className="ad-lot-meta">Qty: {lot.quantity}</span>
                <span className="ad-lot-meta">Sample Size: <strong>{lot.sampleSize}</strong></span>
              </div>
            </div>

            {/* Test Info Row */}
            <div className="ad-test-info">
              <div className="ad-info-item">
                <span className="ad-info-label">Sample Size (1st)</span>
                <span className="ad-info-value">{lot.sampleSize}</span>
              </div>
              <div className="ad-info-item">
                <span className="ad-info-label">Sample Size (2nd)</span>
                <span className="ad-info-value">{lot.sampleSize2nd}</span>
              </div>
              <div className="ad-info-item">
                <span className="ad-info-label">Accp No.</span>
                <span className="ad-info-value">{lot.accpNo}</span>
              </div>
              <div className="ad-info-item">
                <span className="ad-info-label">Rej No.</span>
                <span className="ad-info-value">{lot.rejNo}</span>
              </div>
              <div className="ad-info-item">
                <span className="ad-info-label">Cumm. Rej No.</span>
                <span className="ad-info-value">{lot.cummRejNo}</span>
              </div>
            </div>

            {/* 1st Sampling - Simplified */}
            <div className="ad-sampling-block">
              <div className="ad-sampling-header">
                <div className="ad-sampling-title">1st Sampling</div>
              </div>
              <div className="ad-simple-input-row">
                <div className="ad-simple-input-group">
                  <label className="ad-label">No. of Samples Failed (R1)</label>
                  <input
                    type="number"
                    min="0"
                    max={lot.sampleSize}
                    className="ad-input ad-input-r1"
                    value={state.r1}
                    onChange={(e) => handleR1Change(lot.lotNo, e.target.value)}
                    placeholder="Enter failed count"
                  />
                </div>
                <div className="ad-simple-input-info">
                  <span>Accp No.: <strong>{lot.accpNo}</strong></span>
                  <span>Rej No.: <strong>{lot.rejNo}</strong></span>
                </div>
              </div>
            </div>

            {/* 2nd Sampling - Opens only when R1 > Accp No. AND R1 < Rej No. */}
            {summary.showSecond && (
              <div className="ad-sampling-block ad-sampling-second">
                <div className="ad-sampling-header">
                  <div className="ad-sampling-title">2nd Sampling (Sample Size: {lot.sampleSize2nd})</div>
                </div>
                <div className="ad-simple-input-row">
                  <div className="ad-simple-input-group">
                    <label className="ad-label">No. of Samples Failed (R2)</label>
                    <input
                      type="number"
                      min="0"
                      max={lot.sampleSize2nd}
                      className="ad-input ad-input-r2"
                      value={state.r2}
                      onChange={(e) => handleR2Change(lot.lotNo, e.target.value)}
                      placeholder="Enter failed count"
                    />
                  </div>
                  <div className="ad-simple-input-info">
                    <span>R1: <strong className="ad-r1">{summary.r1}</strong></span>
                    <span>R2: <strong className="ad-r2">{summary.r2}</strong></span>
                    <span>Total (R1+R2): <strong className={summary.total >= lot.cummRejNo ? 'ad-fail' : 'ad-ok'}>{summary.total}</strong></span>
                    <span>Cumm. Rej No.: <strong>{lot.cummRejNo}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* Result & Remarks */}
            <div className="ad-final-row">
              <div className="ad-final-result">
                <label className="ad-label">Result of Application & Deflection Test</label>
                <div className="ad-result-box" style={{ borderColor: summary.color, color: summary.color }}>{summary.result}</div>
              </div>
              <div className="ad-remarks">
                <label className="ad-label">Remarks</label>
                <textarea className="ad-input ad-textarea" rows="2" value={state.remarks} onChange={(e) => handleRemarksChange(lot.lotNo, e.target.value)} placeholder="Enter remarks..." />
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
