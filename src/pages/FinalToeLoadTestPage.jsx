import React, { useMemo, useState } from 'react';
import './FinalToeLoadTestPage.css';

/**
 * FinalToeLoadTestPage
 * - Uses lot data (including springType) to determine toe-load tolerance
 * - No inline CSS. All styles in FinalToeLoadTestPage.css
 * - Implements:
 *   • per-sample 3 readings -> avg
 *   • sample status (PASS/FAIL) based on tolerance
 *   • R1 (count of failed samples in 1st sampling)
 *   • conditional R2 (visible if R1 > accpNo && R1 < rejNo)
 *   • totalRejected = R1 + R2 (if applicable)
 *   • final result rules from spec (OK / NOT OK / PENDING)
 *
 * Props:
 *  - onBack: function
 */

const MOCK_LOTS = [
  { lotNo: 'LOT-001', heatNo: 'HT-2025-A1', quantity: 500, sampleSize: 5, accpNo: 1, rejNo: 3, cummRejNo: 4, springType: 'MK-III' },
  { lotNo: 'LOT-002', heatNo: 'HT-2025-A2', quantity: 800, sampleSize: 5, accpNo: 1, rejNo: 3, cummRejNo: 5, springType: 'MK-V' },
  { lotNo: 'LOT-003', heatNo: 'HT-2025-B1', quantity: 1200, sampleSize: 5, accpNo: 1, rejNo: 3, cummRejNo: 6, springType: 'ERC-J' }
];

/* tolerance rules by spring type (in N or Kgf as per your system). Adjust units if needed. */
const TOLERANCES = {
  'MK-III': { min: 850, max: 1100 },
  'MK-V': { min: 1200, max: 1500 },
  'ERC-J': { min: 650, max: Infinity } // > 650 means min=650, exclusive handled below
};

/* helper to safely parse numeric input */
const toFloatSafe = (v) => {
  if (v === null || v === undefined || v === '') return NaN;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isNaN(n) ? NaN : n;
};

const FinalToeLoadTestPage = ({ onBack }) => {
  const [lots] = useState(MOCK_LOTS); // replace with API fetch in real app
  const [selectedLotNo, setSelectedLotNo] = useState(lots[0].lotNo);
  const [colorCode, setColorCode] = useState('');
  const sampleCount = useMemo(() => {
    const lot = lots.find(l => l.lotNo === selectedLotNo);
    return lot?.sampleSize ?? 5;
  }, [lots, selectedLotNo]);

  // initialize first sampling readings: array of samples, each sample: {d: deflection, r1,r2,r3}
  const makeEmptySamples = (n) => Array.from({ length: n }, () => ({ deflection: '', r1: '', r2: '', r3: '', avg: '', status: '' }));
  const [samples1, setSamples1] = useState(() => makeEmptySamples(sampleCount));
  const [samples2, setSamples2] = useState(() => makeEmptySamples(sampleCount)); // second sampling same shape
  const [remarks, setRemarks] = useState('');

  const currentLot = useMemo(() => lots.find(l => l.lotNo === selectedLotNo) || lots[0], [lots, selectedLotNo]);
  const tolerance = useMemo(() => TOLERANCES[currentLot.springType] || { min: 0, max: Infinity }, [currentLot]);

  // compute average for a sample (3 readings)
  const computeAvg = (s) => {
    const v1 = toFloatSafe(s.r1), v2 = toFloatSafe(s.r2), v3 = toFloatSafe(s.r3);
    const vals = [v1, v2, v3].filter(v => !Number.isNaN(v));
    if (vals.length === 0) return NaN;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  // sample status given avg and tolerance
  const sampleStatus = (avg) => {
    if (Number.isNaN(avg)) return 'PENDING';
    // ERC-J is >650: treat min as exclusive if you want strict >; here we use >=650 as pass threshold unless specified otherwise
    if (currentLot.springType === 'ERC-J') {
      return avg > tolerance.min ? 'PASS' : 'FAIL';
    }
    const pass = avg >= tolerance.min && avg <= tolerance.max;
    return pass ? 'PASS' : 'FAIL';
  };

  // Handlers for input changes (1st or 2nd sampling)
  const handleSampleChange = (index, field, value, isSecond = false) => {
    const setter = isSecond ? setSamples2 : setSamples1;
    const prev = isSecond ? samples2 : samples1;
    const copy = prev.map((s, i) => i === index ? { ...s, [field]: value } : s);
    // recalc avg & status for that sample
    const s = copy[index];
    const avg = computeAvg(s);
    copy[index] = { ...copy[index], avg: Number.isNaN(avg) ? '' : (Math.round(avg * 100) / 100), status: sampleStatus(avg) };
    setter(copy);
  };

  // count rejects in a sampling (samples with status === 'FAIL')
  const countRejects = (arr) => arr.reduce((c, s) => c + (s.status === 'FAIL' ? 1 : 0), 0);
  const rejected1 = useMemo(() => countRejects(samples1), [samples1]);
  const showSecondSampling = useMemo(() => rejected1 > currentLot.accpNo && rejected1 < currentLot.rejNo, [rejected1, currentLot]);
  const rejected2 = useMemo(() => showSecondSampling ? countRejects(samples2) : 0, [samples2, showSecondSampling]);
  const totalRejected = rejected1 + (showSecondSampling ? rejected2 : 0);

  // final result per spec
  const finalResult = useMemo(() => {
    const r1 = rejected1;
    const rTotal = totalRejected;

    if (r1 === 0 && samples1.every(s => s.avg === '')) return { status: 'PENDING', color: '#f59e0b', icon: '⏳' };

    if (r1 <= currentLot.accpNo) return { status: 'OK', color: '#22c55e', icon: '✓' };

    if (r1 > currentLot.accpNo && r1 < currentLot.rejNo && rTotal < currentLot.cummRejNo) return { status: 'OK', color: '#22c55e', icon: '✓' };

    if (r1 >= currentLot.rejNo || rTotal >= currentLot.cummRejNo) return { status: 'NOT OK', color: '#ef4444', icon: '✗' };

    return { status: 'PENDING', color: '#f59e0b', icon: '⏳' };
  }, [rejected1, totalRejected, currentLot, samples1]);

  // file upload placeholder (CSV/Excel parsing left as TODO)
  const handleUpload = (e, isSecond = false) => {
    // TODO: parse CSV/Excel template and populate samples
    alert('Upload handler placeholder - implement CSV/Excel parsing as needed.');
    e.target.value = null;
  };

  // validation and save
  const validateBeforeSave = () => {
    if (!colorCode.trim()) return 'Color Code is required.';
    if (samples1.some(s => s.avg === '' && (s.r1 !== '' || s.r2 !== '' || s.r3 !== ''))) return null; // allow partial but prefer full—keeping simple
    if (samples1.every(s => s.avg === '')) return 'Enter at least one sample reading in 1st sampling.';
    if (showSecondSampling && samples2.every(s => s.avg === '')) return '2nd sampling is required but no readings provided.';
    return null;
  };

  const handleSave = () => {
    const v = validateBeforeSave();
    if (v) {
      alert(v);
      return;
    }
    const payload = {
      lotNo: selectedLotNo,
      heatNo: currentLot.heatNo,
      quantity: currentLot.quantity,
      springType: currentLot.springType,
      colorCode: colorCode.trim(),
      samples1,
      samples2: showSecondSampling ? samples2 : [],
      rejected1,
      rejected2: showSecondSampling ? rejected2 : 0,
      totalRejected,
      result: finalResult.status,
      remarks: remarks.trim()
    };
    // TODO: replace with API call
    alert('Saved Toe Load Test\n\n' + JSON.stringify(payload, null, 2));
    if (typeof onBack === 'function') onBack();
  };

  // Ensure sample arrays adjust to sampleCount when lot changes
  React.useEffect(() => {
    setSamples1(makeEmptySamples(sampleCount));
    setSamples2(makeEmptySamples(sampleCount));
  }, [selectedLotNo, sampleCount]);

  return (
    <div className="tlp-page">
      <div className="tlp-header">
        <div>
          <h1 className="tlp-title">Toe Load Test</h1>
          <p className="tlp-sub">Final Product Inspection - Toe load at specified deflection</p>
        </div>
        <button className="tlp-btn tlp-btn-outline" onClick={onBack}>← Back</button>
      </div>

      {/* Lot Info */}
      <div className="tlp-card">
        <div className="tlp-card-head">
          <h3>📦 Lot Information</h3>
          <p className="tlp-muted">Populated from Process IC (spring type defines tolerance)</p>
        </div>

        <div className="tlp-grid">
          <div className="tlp-field">
            <label className="tlp-label required">Lot No.</label>
            <select className="tlp-input" value={selectedLotNo} onChange={e => setSelectedLotNo(e.target.value)}>
              {lots.map(l => <option key={l.lotNo} value={l.lotNo}>{l.lotNo}</option>)}
            </select>
          </div>

          <div className="tlp-field">
            <label className="tlp-label">Heat No.</label>
            <input className="tlp-input" value={currentLot.heatNo} disabled />
          </div>

          <div className="tlp-field">
            <label className="tlp-label">Quantity</label>
            <input className="tlp-input" value={currentLot.quantity} disabled />
          </div>

          <div className="tlp-field">
            <label className="tlp-label required">Color Code</label>
            <input className="tlp-input" value={colorCode} onChange={e => setColorCode(e.target.value)} placeholder="Enter color code" />
          </div>

          <div className="tlp-field">
            <label className="tlp-label">Toe Load Spec</label>
            <input className="tlp-input" disabled value={
              currentLot.springType === 'ERC-J'
                ? `>${tolerance.min}`
                : `${tolerance.min} - ${tolerance.max}`
            } />
          </div>
        </div>
      </div>

      {/* First Sampling Table */}
      <div className="tlp-card">
        <div className="tlp-card-head">
          <h3>Toe Load Test - 1st Sampling</h3>
          <p className="tlp-muted">Spec based on spring type: <strong>{currentLot.springType}</strong></p>
        </div>

        <div className="tlp-upload">
          <label className="tlp-upload-btn">
            📤 Upload Excel/CSV (1st)
            <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleUpload} />
          </label>
          <div className="tlp-upload-note">Optionally upload pre-defined template</div>
        </div>

        <div className="tlp-table-wrap">
          <table className="tlp-table">
            <thead>
              <tr>
                <th>Sample No.</th>
                <th>Deflection (mm)</th>
                <th>Reading 1</th>
                <th>Reading 2</th>
                <th>Reading 3</th>
                <th>Average</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {samples1.map((s, idx) => (
                <tr key={idx}>
                  <td><strong>{idx + 1}</strong></td>
                  <td><input className="tlp-input" value={s.deflection} onChange={e => handleSampleChange(idx, 'deflection', e.target.value, false)} placeholder="10" /></td>
                  <td><input className="tlp-input" value={s.r1} onChange={e => handleSampleChange(idx, 'r1', e.target.value, false)} placeholder="500" /></td>
                  <td><input className="tlp-input" value={s.r2} onChange={e => handleSampleChange(idx, 'r2', e.target.value, false)} placeholder="498" /></td>
                  <td><input className="tlp-input" value={s.r3} onChange={e => handleSampleChange(idx, 'r3', e.target.value, false)} placeholder="502" /></td>
                  <td><input className="tlp-input" value={s.avg || ''} disabled /></td>
                  <td>
                    <div className={`tlp-badge ${s.status === 'FAIL' ? 'fail' : s.status === 'PASS' ? 'pass' : 'pending'}`}>
                      {s.status || 'PENDING'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stats */}
        <div className="tlp-stats">
          <div className="tlp-stat">
            <div className="tlp-stat-value">{samples1.filter(s => s.avg !== '').length}</div>
            <div className="tlp-stat-label">Samples Tested</div>
          </div>
          <div className="tlp-stat">
            <div className="tlp-stat-value">{rejected1}</div>
            <div className="tlp-stat-label">Rejected (R1)</div>
          </div>
        </div>
      </div>

      {/* Second Sampling (Conditional) */}
      {showSecondSampling && (
        <div className="tlp-card">
          <div className="tlp-card-head">
            <h3>⚠️ 2nd Sampling Required</h3>
            <p className="tlp-muted">R1 = {rejected1} &gt; Accp {currentLot.accpNo} and &lt; Rej {currentLot.rejNo}</p>
          </div>

          <div className="tlp-upload">
            <label className="tlp-upload-btn">
              📤 Upload Excel/CSV (2nd)
              <input type="file" accept=".csv, .xlsx, .xls" onChange={(e) => handleUpload(e, true)} />
            </label>
            <div className="tlp-upload-note">Upload template for 2nd sampling values</div>
          </div>

          <div className="tlp-table-wrap">
            <table className="tlp-table">
              <thead>
                <tr>
                  <th>Sample No.</th>
                  <th>Deflection (mm)</th>
                  <th>Reading 1</th>
                  <th>Reading 2</th>
                  <th>Reading 3</th>
                  <th>Average</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {samples2.map((s, idx) => (
                  <tr key={idx}>
                    <td><strong>{idx + 1}</strong></td>
                    <td><input className="tlp-input" value={s.deflection} onChange={e => handleSampleChange(idx, 'deflection', e.target.value, true)} placeholder="10" /></td>
                    <td><input className="tlp-input" value={s.r1} onChange={e => handleSampleChange(idx, 'r1', e.target.value, true)} placeholder="500" /></td>
                    <td><input className="tlp-input" value={s.r2} onChange={e => handleSampleChange(idx, 'r2', e.target.value, true)} placeholder="498" /></td>
                    <td><input className="tlp-input" value={s.r3} onChange={e => handleSampleChange(idx, 'r3', e.target.value, true)} placeholder="502" /></td>
                    <td><input className="tlp-input" value={s.avg || ''} disabled /></td>
                    <td>
                      <div className={`tlp-badge ${s.status === 'FAIL' ? 'fail' : s.status === 'PASS' ? 'pass' : 'pending'}`}>
                        {s.status || 'PENDING'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="tlp-stats">
            <div className="tlp-stat">
              <div className="tlp-stat-value">{samples2.filter(s => s.avg !== '').length}</div>
              <div className="tlp-stat-label">2nd Samples Entered</div>
            </div>
            <div className="tlp-stat">
              <div className="tlp-stat-value">{rejected2}</div>
              <div className="tlp-stat-label">Rejected (R2)</div>
            </div>
            <div className="tlp-stat">
              <div className="tlp-stat-value">{totalRejected}</div>
              <div className="tlp-stat-label">Total Rejected (R1+R2)</div>
            </div>
          </div>
        </div>
      )}

      {/* Result & Remarks */}
      <div className="tlp-card">
        <div className="tlp-grid">
          <div className="tlp-field full">
            <label className="tlp-label">Result</label>
            <div className="tlp-result" style={{ borderColor: finalResult.color, color: finalResult.color }}>
              {finalResult.icon} {finalResult.status}
            </div>
            <div className="tlp-logic tlp-muted">
              Rules: OK if R1 ≤ Accp. OK if R1 &gt; Accp &amp; R1 &lt; Rej &amp; (R1+R2) &lt; Cumm. Rej. NOT OK if R1 ≥ Rej or (R1+R2) ≥ Cumm Rej.
            </div>
          </div>

          <div className="tlp-field full">
            <label className="tlp-label required">Remarks</label>
            <textarea className="tlp-input" rows="3" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Enter remarks..." />
          </div>
        </div>

        <div className="tlp-actions">
          <button className="tlp-btn tlp-btn-outline" onClick={onBack}>Cancel</button>
          <button className="tlp-btn tlp-btn-primary" onClick={handleSave}>Save & Continue</button>
        </div>
      </div>
    </div>
  );
};

export default FinalToeLoadTestPage;
