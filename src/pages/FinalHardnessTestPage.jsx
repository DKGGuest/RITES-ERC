import { useState, useMemo } from 'react';
import FinalSubmoduleNav from '../components/FinalSubmoduleNav';
import ExcelImport from '../components/ExcelImport';
import { getHardnessToeLoadAQL, calculateBagsForSampling } from '../utils/is2500Calculations';

/* Lots Data - Auto-fetched from Pre-Inspection (Vendor Call) */
const lotsFromPreInspection = [
  { lotNo: 'LOT-001', heatNo: 'HT-2025-A1', lotSize: 500 },
  { lotNo: 'LOT-002', heatNo: 'HT-2025-A2', lotSize: 800 },
  { lotNo: 'LOT-003', heatNo: 'HT-2025-B1', lotSize: 1200 }
];

const FinalHardnessTestPage = ({ onBack, onNavigateSubmodule }) => {
  /* Calculate AQL values for each lot based on Table 2 - Hardness & Toe Load */
  const availableLots = useMemo(() => {
    return lotsFromPreInspection.map((lot) => {
      const aql = getHardnessToeLoadAQL(lot.lotSize);
      return {
        lotNo: lot.lotNo,
        heatNo: lot.heatNo,
        quantity: lot.lotSize,
        sampleSize: aql.n1,
        accpNo: aql.ac1,
        rejNo: aql.re1,
        sample2Size: aql.n2,
        cummRejNo: aql.cummRej,
        singleSampling: aql.useSingleSampling || false
      };
    });
  }, []);

  /* Calculate Total Sample Size and Bags for Sampling */
  const totalSampleSize = availableLots.reduce((sum, l) => sum + l.sampleSize, 0);
  const bagsForSampling = calculateBagsForSampling(totalSampleSize);
  const [lotData, setLotData] = useState(
    availableLots.reduce((acc, lot) => ({
      ...acc,
      [lot.lotNo]: {
        hardness1st: Array(lot.sampleSize).fill(''),
        hardness2nd: Array(lot.sampleSize).fill(''),
        remarks: ''
      }
    }), {})
  );

  const getValueStatus = v => {
    if (!v) return '';
    const val = parseFloat(v);
    return val >= 40 && val <= 44 ? 'pass' : 'fail';
  };

  const handleHardnessChange = (lotNo, idx, value, is2nd = false) => {
    setLotData(prev => {
      const updated = { ...prev[lotNo] };
      const arr = is2nd ? [...updated.hardness2nd] : [...updated.hardness1st];
      arr[idx] = value;
      if (is2nd) updated.hardness2nd = arr;
      else updated.hardness1st = arr;
      return { ...prev, [lotNo]: updated };
    });
  };

  const handleRemarkChange = (lotNo, val) => {
    setLotData(prev => ({
      ...prev,
      [lotNo]: { ...prev[lotNo], remarks: val }
    }));
  };

  /* Handle Excel import for hardness values */
  const handleExcelImport = (lotNo, values, isSecond) => {
    setLotData(prev => ({
      ...prev,
      [lotNo]: {
        ...prev[lotNo],
        [isSecond ? 'hardness2nd' : 'hardness1st']: values
      }
    }));
  };

  const styles = `
    .lot-section {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .lot-header {
      background: #f1f5f9;
      border-radius: 6px;
      padding: 8px 12px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 12px;
    }
    .limit-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 13px;
      color: #475569;
      margin-bottom: 12px;
    }
    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 8px;
    }
    .value-input {
      text-align: center;
      width: 100%;
      padding: 6px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 13px;
      transition: 0.2s ease;
    }
    .value-input.pass {
      border-color: #22c55e;
      background: #f0fdf4;
    }
    .value-input.fail {
      border-color: #ef4444;
      background: #fef2f2;
    }
    .yellow-box {
      background: #fef9c3;
      border: 1px solid #fde047;
      border-radius: 8px;
      padding: 12px;
      margin-top: 14px;
    }
    .stats {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 16px;
    }
    .stat {
      flex: 1;
      min-width: 120px;
      text-align: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      transition: 0.2s ease;
    }
    .stat:hover {
      transform: scale(1.02);
    }
    .stat-value {
      font-size: 18px;
      font-weight: 700;
    }
    .stat-label {
      font-size: 11px;
      color: #64748b;
    }
  `;

  return (
    <div>
      <style>{styles}</style>

      {/* Header */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}
      >
        <div>
          <h1>Hardness Test</h1>
          <p>Final Product Inspection - IS 2500 Table 2 (Double Sampling for Hardness & Toe Load)</p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Sampling Summary */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        fontSize: '14px'
      }}>
        <span><strong>Total Sample Size:</strong> {totalSampleSize}</span>
        <span><strong>Bags for Sampling:</strong> {bagsForSampling}</span>
      </div>

      <FinalSubmoduleNav
        currentSubmodule="final-hardness-test"
        onNavigate={onNavigateSubmodule}
      />

      {availableLots.map(lot => {
        const data = lotData[lot.lotNo];
        const rejected1st = data.hardness1st.filter(v => v && (v < 40 || v > 44)).length;
        /* Show 2nd sampling when rejected >= Re1 (not >) */
        const show2ndSampling = !lot.singleSampling && rejected1st >= lot.rejNo;
        const rejected2nd = data.hardness2nd.filter(v => v && (v < 40 || v > 44)).length;
        const totalRejected = rejected1st + rejected2nd;

        /* Result logic based on IS 2500 Double Sampling */
        let result;
        if (rejected1st <= lot.accpNo) {
          result = { status: 'OK', color: '#22c55e' };
        } else if (rejected1st > lot.accpNo && rejected1st < lot.rejNo) {
          /* Need 2nd sampling - check cumulative */
          if (totalRejected <= lot.cummRejNo) {
            result = { status: 'OK', color: '#22c55e' };
          } else {
            result = { status: 'NOT OK', color: '#ef4444' };
          }
        } else if (rejected1st >= lot.rejNo) {
          /* After 2nd sampling, check cumulative */
          if (show2ndSampling && totalRejected <= lot.cummRejNo) {
            result = { status: 'OK', color: '#22c55e' };
          } else if (show2ndSampling && totalRejected > lot.cummRejNo) {
            result = { status: 'NOT OK', color: '#ef4444' };
          } else {
            result = { status: 'Pending', color: '#f59e0b' };
          }
        } else {
          result = { status: 'Pending', color: '#f59e0b' };
        }

        return (
          <div key={lot.lotNo} className="lot-section">
            <div className="lot-header">
              📦 Lot: {lot.lotNo} | Heat: {lot.heatNo} | Qty: {lot.quantity} | Sample Size: {lot.sampleSize}
            </div>

            <div className="limit-box">
              Ac1: <strong>{lot.accpNo}</strong> | Re1:{' '}
              <strong>{lot.rejNo}</strong> | Cumm. Rej No:{' '}
              <strong>{lot.cummRejNo}</strong>
              {lot.singleSampling && <span style={{ marginLeft: '12px', color: '#f59e0b' }}>(Single Sampling)</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <div>
                <h4 style={{ marginBottom: '4px' }}>💎 Hardness Test (1st Sampling - n1: {lot.sampleSize})</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Acceptable Range: 40 - 44 HRC
                </p>
              </div>
              <ExcelImport
                templateName={`${lot.lotNo}_Hardness_1st`}
                sampleSize={lot.sampleSize}
                valueLabel="Hardness (HRC)"
                onImport={(values) => handleExcelImport(lot.lotNo, values, false)}
              />
            </div>

            <div className="values-grid">
              {data.hardness1st.map((val, i) => (
                <input
                  key={i}
                  type="number"
                  step="0.1"
                  className={`value-input ${getValueStatus(val)}`}
                  value={val}
                  onChange={e => handleHardnessChange(lot.lotNo, i, e.target.value)}
                  placeholder=""
                />
              ))}
            </div>

            {show2ndSampling && (
              <div className="yellow-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '13px', margin: 0 }}>
                    ⚠️ 2nd Sampling Required (R1 = {rejected1st} ≥ Re1 {lot.rejNo}) - n2: {lot.sample2Size}
                  </h4>
                  <ExcelImport
                    templateName={`${lot.lotNo}_Hardness_2nd`}
                    sampleSize={lot.sample2Size}
                    valueLabel="Hardness (HRC)"
                    onImport={(values) => handleExcelImport(lot.lotNo, values, true)}
                  />
                </div>
                <div className="values-grid">
                  {data.hardness2nd.map((val, i) => (
                    <input
                      key={i}
                      type="number"
                      step="0.1"
                      className={`value-input ${getValueStatus(val)}`}
                      value={val}
                      onChange={e =>
                        handleHardnessChange(lot.lotNo, i, e.target.value, true)
                      }
                      placeholder=""
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stats Section */}
            <div className="stats">
              <div className="stat">
                <div className="stat-value">{rejected1st}</div>
                <div className="stat-label">Rejected (R1)</div>
              </div>

              {show2ndSampling && (
                <div className="stat">
                  <div className="stat-value">{rejected2nd}</div>
                  <div className="stat-label">Rejected (R2)</div>
                </div>
              )}

              <div className="stat">
                <div className="stat-value">{totalRejected}</div>
                <div className="stat-label">Total Rejected (R1+R2)</div>
              </div>

              <div
                className="stat"
                style={{
                  borderColor: result.color,
                  color: result.color,
                  background: result.color + '10'
                }}
              >
                <div
                  className="stat-value"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {result.status === 'OK' && <span>✅</span>}
                  {result.status === 'NOT OK' && <span>❌</span>}
                  {result.status === 'Pending' && <span>⏳</span>}
                  {result.status}
                </div>
                <div className="stat-label">Result</div>
              </div>
            </div>

            {/* Remarks */}
            <div style={{ marginTop: '12px' }}>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569'
                }}
              >
                Remarks
              </label>
              <textarea
                rows="2"
                style={{
                  width: '100%',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '13px',
                  marginTop: '4px'
                }}
                value={data.remarks}
                onChange={e => handleRemarkChange(lot.lotNo, e.target.value)}
                placeholder="Enter remarks..."
              />
            </div>
          </div>
        );
      })}

      {/* Bottom Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '20px',
          gap: '10px'
        }}
      >
        <button className="btn btn-outline" onClick={onBack}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => alert('Hardness Test data saved!')}
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default FinalHardnessTestPage;
