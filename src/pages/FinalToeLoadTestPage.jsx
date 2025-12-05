import { useState, useMemo } from 'react';
import FinalSubmoduleNav from '../components/FinalSubmoduleNav';
import ExcelImport from '../components/ExcelImport';
import { getHardnessToeLoadAQL } from '../utils/is2500Calculations';
import './FinalToeLoadTestPage.css';

/**
 * Base lot data – typically comes from backend (Process IC / Pre-inspection)
 */
const BASE_LOTS = [
  { lotNo: 'LOT-001', heatNo: 'HT-2025-A1', quantity: 500, springType: 'MK-III' },
  { lotNo: 'LOT-002', heatNo: 'HT-2025-A2', quantity: 800, springType: 'MK-V' },
  { lotNo: 'LOT-003', heatNo: 'HT-2025-B1', quantity: 1200, springType: 'ERC-J' }
];

/**
 * Tolerance band by spring type (used internally for validation)
 * MK-III : 850–1100
 * MK-V   : 1200–1500
 * ERC-J  : > 650
 */
const TOLERANCES = {
  'MK-III': { min: 850, max: 1100 },
  'MK-V': { min: 1200, max: 1500 },
  'ERC-J': { min: 650, max: Infinity }
};

/* Number of input boxes per page for pagination */
const PAGE_SIZE = 10;

const FinalToeLoadTestPage = ({ onBack, onNavigateSubmodule }) => {
  /**
   * Compute sample size & AQL values for each lot using IS 2500 Table 2
   */
  const lotsWithSampleSize = useMemo(
    () =>
      BASE_LOTS.map(lot => {
        const aql = getHardnessToeLoadAQL(lot.quantity);
        return {
          ...lot,
          sampleSize: aql.n1,
          sampleSize2nd: aql.n2,
          accpNo: aql.ac1,
          rejNo: aql.re1,
          cummRejNo: aql.cummRej,
          singleSampling: aql.useSingleSampling || false
        };
      }),
    []
  );

  /**
   * Per-lot state:
   *  toe1st: array(sampleSize) – 1st sampling toe-load values
   *  toe2nd: array(sampleSize2nd) – 2nd sampling toe-load values
   *  show2ndTriggered: boolean – once 2nd sampling is triggered, it stays visible
   *  remarks: string
   */
  const [lotData, setLotData] = useState(() => {
    const initial = {};
    lotsWithSampleSize.forEach(lot => {
      initial[lot.lotNo] = {
        toe1st: Array(lot.sampleSize).fill(''),
        toe2nd: Array(lot.sampleSize2nd).fill(''),
        show2ndTriggered: false,
        remarks: ''
      };
    });
    return initial;
  });

  /* Pagination state for 1st and 2nd sampling per lot */
  const [page1st, setPage1st] = useState({});
  const [page2nd, setPage2nd] = useState({});

  /** Update toe-load value (1st or 2nd sampling) */
  const handleToeChange = (lotNo, index, value, isSecond = false) => {
    setLotData(prev => {
      const lotState = prev[lotNo];
      const key = isSecond ? 'toe2nd' : 'toe1st';
      const arr = [...lotState[key]];
      arr[index] = value;
      return {
        ...prev,
        [lotNo]: { ...lotState, [key]: arr }
      };
    });
  };

  /** Update remarks per lot */
  const handleRemarksChange = (lotNo, value) => {
    setLotData(prev => ({
      ...prev,
      [lotNo]: { ...prev[lotNo], remarks: value }
    }));
  };

  /** Handle Excel import for toe load values */
  const handleExcelImport = (lotNo, values, isSecond) => {
    setLotData(prev => ({
      ...prev,
      [lotNo]: {
        ...prev[lotNo],
        [isSecond ? 'toe2nd' : 'toe1st']: values
      }
    }));
  };

  /** Helper: is a single toe-load value rejected for given lot? */
  const isRejectedValue = (lot, raw) => {
    if (raw === '' || raw === null || raw === undefined) return false;
    const v = parseFloat(String(raw).replace(',', '.'));
    if (Number.isNaN(v)) return false;

    const tol = TOLERANCES[lot.springType] || { min: 0, max: Infinity };

    if (lot.springType === 'ERC-J') {
      /* ERC-J: value must be > 650, so ≤650 is rejected */
      return !(v > tol.min);
    }
    /* Other types: value must be within min-max band */
    return v < tol.min || v > tol.max;
  };

  /**
   * Compute R1, R2, total & final result for a lot
   * Also triggers 2nd sampling if condition met (and keeps it visible)
   */
  const computeLotSummary = (lot) => {
    const state = lotData[lot.lotNo];
    if (!state) {
      return { r1: 0, r2: 0, showSecond: false, total: 0, result: 'PENDING', color: '#fbbf24' };
    }

    const r1 = state.toe1st.filter(v => isRejectedValue(lot, v)).length;

    /* 2nd Sampling shows if: Acceptance No < R1 < Rejection No (and not single sampling) */
    const shouldShow2nd = !lot.singleSampling && r1 > lot.accpNo && r1 < lot.rejNo;

    /* Once triggered, keep 2nd sampling visible */
    const showSecond = state.show2ndTriggered || shouldShow2nd;

    /* If 2nd sampling should be triggered but not yet flagged, update state */
    if (shouldShow2nd && !state.show2ndTriggered) {
      setLotData(prev => ({
        ...prev,
        [lot.lotNo]: { ...prev[lot.lotNo], show2ndTriggered: true }
      }));
    }

    const r2 = showSecond ? state.toe2nd.filter(v => isRejectedValue(lot, v)).length : 0;
    const total = r1 + r2;

    /* Determine final result based on the spec:
     * OK - if R1 <= Accp No.
     * OK - if R1 > Accp No. & R1 < Rej. No. & (R1 + R2) < Cumm. Rej. No.
     * NOT OK - if R1 >= Rej. No. or (R1 + R2) >= Cumm. Rej. No.
     */
    let result = 'PENDING';
    let color = '#fbbf24';

    const anyEntered = state.toe1st.some(v => v !== '');

    if (!anyEntered) {
      result = 'PENDING';
      color = '#fbbf24';
    } else if (r1 <= lot.accpNo) {
      result = 'OK';
      color = '#16a34a';
    } else if (r1 > lot.accpNo && r1 < lot.rejNo) {
      /* 2nd sampling required - check combined */
      if (total < lot.cummRejNo) {
        result = 'OK';
        color = '#16a34a';
      } else {
        result = 'NOT OK';
        color = '#dc2626';
      }
    } else if (r1 >= lot.rejNo) {
      result = 'NOT OK';
      color = '#dc2626';
    }

    return { r1, r2, showSecond, total, result, color };
  };

  /** Validate & save whole page (you can later split per-lot if needed) */
  const handleSave = () => {
    const payload = lotsWithSampleSize.map(lot => {
      const summary = computeLotSummary(lot);
      const state = lotData[lot.lotNo];
      return {
        lotNo: lot.lotNo,
        heatNo: lot.heatNo,
        quantity: lot.quantity,
        springType: lot.springType,
        sampleSize: lot.sampleSize,
        toe1st: state.toe1st,
        toe2nd: summary.showSecond ? state.toe2nd : [],
        r1: summary.r1,
        r2: summary.r2,
        totalRejected: summary.total,
        result: summary.result,
        remarks: state.remarks
      };
    });

    // TODO: replace with API call
    alert('Toe Load Test saved\n\n' + JSON.stringify(payload, null, 2));
    if (typeof onBack === 'function') onBack();
  };

  return (
    <div className="tlp-page">
      {/* Header */}
      <div className="tlp-header">
        <div>
          <h1 className="tlp-title">Toe Load Test</h1>
          <p className="tlp-sub">
            Final Product Inspection – Toe load test for each lot (sample size as per IS 2500)
          </p>
        </div>
        <button className="tlp-btn tlp-btn-outline" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Submodule Navigation */}
      <FinalSubmoduleNav
        currentSubmodule="final-toe-load-test"
        onNavigate={onNavigateSubmodule}
      />

      {/* One section per lot */}
      {lotsWithSampleSize.map(lot => {
        const summary = computeLotSummary(lot);
        const state = lotData[lot.lotNo];

        return (
          <div key={lot.lotNo} className="tlp-card">
            {/* Lot header */}
            <div className="tlp-lot-header">
              <div>
                <strong>📦 Lot: {lot.lotNo}</strong> &nbsp; | &nbsp; Heat: {lot.heatNo} &nbsp; | &nbsp;
                Qty: {lot.quantity}
              </div>
              <div className="tlp-lot-meta">
                Sample Size (IS 2500): <strong>{lot.sampleSize}</strong>
              </div>
            </div>

            {/* 1st Sampling */}
            <div className="tlp-sampling-block">
              <div className="tlp-sampling-header">
                <div className="tlp-sampling-title">1st Sampling – Toe Load Value (Kgf)</div>
                <ExcelImport
                  templateName={`${lot.lotNo}_ToeLoad_1st`}
                  sampleSize={lot.sampleSize}
                  valueLabel="Toe Load (Kgf)"
                  onImport={(values) => handleExcelImport(lot.lotNo, values, false)}
                />
              </div>

              <div className="tlp-input-grid">
                {state.toe1st
                  .slice((page1st[lot.lotNo] || 0) * PAGE_SIZE, ((page1st[lot.lotNo] || 0) + 1) * PAGE_SIZE)
                  .map((val, idx) => {
                    const actualIndex = (page1st[lot.lotNo] || 0) * PAGE_SIZE + idx;
                    return (
                      <div key={actualIndex} className="tlp-input-wrapper">
                        <span className="tlp-input-label">{actualIndex + 1}</span>
                        <input
                          type="number"
                          step="0.1"
                          className="tlp-input"
                          value={val}
                          onChange={(e) => handleToeChange(lot.lotNo, actualIndex, e.target.value, false)}
                        />
                      </div>
                    );
                  })}
              </div>

              <div className="tlp-summary-row">
                <div className="tlp-summary-left">
                  <div className="tlp-summary-item">
                    Rejected (R1): <strong className="tlp-r1">{summary.r1}</strong>
                  </div>
                  <div className="tlp-summary-item">
                    Accp No.: <strong>{lot.accpNo}</strong> | Rej No.: <strong>{lot.rejNo}</strong> | Cumm. Rej: <strong>{lot.cummRejNo}</strong>
                  </div>
                </div>
                {lot.sampleSize > PAGE_SIZE && (
                  <div className="tlp-pagination">
                    <button
                      className="tlp-page-btn"
                      disabled={(page1st[lot.lotNo] || 0) === 0}
                      onClick={() => setPage1st(prev => ({ ...prev, [lot.lotNo]: (prev[lot.lotNo] || 0) - 1 }))}
                    >
                      ‹ Prev
                    </button>
                    <span className="tlp-page-info">
                      {((page1st[lot.lotNo] || 0) * PAGE_SIZE) + 1}–{Math.min(((page1st[lot.lotNo] || 0) + 1) * PAGE_SIZE, lot.sampleSize)} of {lot.sampleSize}
                    </span>
                    <button
                      className="tlp-page-btn"
                      disabled={((page1st[lot.lotNo] || 0) + 1) * PAGE_SIZE >= lot.sampleSize}
                      onClick={() => setPage1st(prev => ({ ...prev, [lot.lotNo]: (prev[lot.lotNo] || 0) + 1 }))}
                    >
                      Next ›
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2nd Sampling - only if triggered */}
            {summary.showSecond && (
              <div className="tlp-sampling-block tlp-sampling-second">
                <div className="tlp-sampling-header">
                  <div className="tlp-sampling-title">2nd Sampling – Toe Load Value (Kgf)</div>
                  <ExcelImport
                    templateName={`${lot.lotNo}_ToeLoad_2nd`}
                    sampleSize={lot.sampleSize2nd}
                    valueLabel="Toe Load (Kgf)"
                    onImport={(values) => handleExcelImport(lot.lotNo, values, true)}
                  />
                </div>

                <div className="tlp-input-grid">
                  {state.toe2nd
                    .slice((page2nd[lot.lotNo] || 0) * PAGE_SIZE, ((page2nd[lot.lotNo] || 0) + 1) * PAGE_SIZE)
                    .map((val, idx) => {
                      const actualIndex = (page2nd[lot.lotNo] || 0) * PAGE_SIZE + idx;
                      return (
                        <div key={actualIndex} className="tlp-input-wrapper">
                          <span className="tlp-input-label">{actualIndex + 1}</span>
                          <input
                            type="number"
                            step="0.1"
                            className="tlp-input"
                            value={val}
                            onChange={(e) => handleToeChange(lot.lotNo, actualIndex, e.target.value, true)}
                          />
                        </div>
                      );
                    })}
                </div>

                <div className="tlp-summary-row">
                  <div className="tlp-summary-left">
                    <div className="tlp-summary-item">
                      Rejected (R2): <strong className="tlp-r2">{summary.r2}</strong>
                    </div>
                    <div className="tlp-summary-item">
                      Total (R1 + R2): <strong className={summary.total >= lot.cummRejNo ? 'tlp-fail' : 'tlp-ok'}>{summary.total}</strong>
                    </div>
                  </div>
                  {lot.sampleSize2nd > PAGE_SIZE && (
                    <div className="tlp-pagination">
                      <button
                        className="tlp-page-btn"
                        disabled={(page2nd[lot.lotNo] || 0) === 0}
                        onClick={() => setPage2nd(prev => ({ ...prev, [lot.lotNo]: (prev[lot.lotNo] || 0) - 1 }))}
                      >
                        ‹ Prev
                      </button>
                      <span className="tlp-page-info">
                        {((page2nd[lot.lotNo] || 0) * PAGE_SIZE) + 1}–{Math.min(((page2nd[lot.lotNo] || 0) + 1) * PAGE_SIZE, lot.sampleSize2nd)} of {lot.sampleSize2nd}
                      </span>
                      <button
                        className="tlp-page-btn"
                        disabled={((page2nd[lot.lotNo] || 0) + 1) * PAGE_SIZE >= lot.sampleSize2nd}
                        onClick={() => setPage2nd(prev => ({ ...prev, [lot.lotNo]: (prev[lot.lotNo] || 0) + 1 }))}
                      >
                        Next ›
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Final Result + Remarks for this lot */}
            <div className="tlp-final-row">
              <div className="tlp-final-result">
                <label className="tlp-label">Result of Toe Load Test</label>
                <div
                  className="tlp-result-box"
                  style={{ borderColor: summary.color, color: summary.color }}
                >
                  {summary.result}
                </div>
                {/* <div className="tlp-result-note">
                  <span className="tlp-note-ok">✓ OK</span> if R1 ≤ Accp No.<br />
                  <span className="tlp-note-ok">✓ OK</span> if Accp No. &lt; R1 &lt; Rej No. &amp; (R1 + R2) &lt; Cumm. Rej. No.<br />
                  <span className="tlp-note-fail">✗ NOT OK</span> if R1 ≥ Rej No. or (R1 + R2) ≥ Cumm. Rej. No.
                </div> */}
              </div>

              <div className="tlp-remarks">
                <label className="tlp-label">Remarks</label>
                <textarea
                  rows={3}
                  className="tlp-input tlp-textarea"
                  value={state.remarks}
                  onChange={e => handleRemarksChange(lot.lotNo, e.target.value)}
                  placeholder="Enter remarks..."
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Global buttons */}
      <div className="tlp-actions-page">
        <button className="tlp-btn tlp-btn-outline" onClick={onBack}>
          Cancel
        </button>
        <button className="tlp-btn tlp-btn-primary" onClick={handleSave}>
          Save &amp; Continue
        </button>
      </div>
    </div>
  );
};

export default FinalToeLoadTestPage;
