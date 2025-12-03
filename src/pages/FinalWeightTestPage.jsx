// src/pages/FinalWeightTestPage.jsx
import { useMemo, useState, useEffect } from "react";
import "./FinalWeightTestPage.css";

/* Mock lots - replace with API */
const LOTS = [
  { lotNo: "LOT-001", heatNo: "HT-2025-A1", quantity: 500, sampleSize: 5, accpNo: 2, rejNo: 3, cummRejNo: 4, springType: "MK-III" },
  { lotNo: "LOT-002", heatNo: "HT-2025-A2", quantity: 800, sampleSize: 5, accpNo: 3, rejNo: 4, cummRejNo: 6, springType: "MK-V" },
  { lotNo: "LOT-003", heatNo: "HT-2025-B1", quantity: 1200, sampleSize: 5, accpNo: 5, rejNo: 6, cummRejNo: 8, springType: "ERC-J" }
];

/* Weight Tolerance Table from Excel */
const TOLERANCE = {
  "MK-III": 904,
  "MK-V": 1068,
  "ERC-J": 904
};

export default function FinalWeightTestPage({ onBack }) {
  const [selectedLotNo, setSelectedLotNo] = useState(LOTS[0].lotNo);
  const [colorCode, setColorCode] = useState("");
  const [remarks, setRemarks] = useState("");

  const currentLot = useMemo(
    () => LOTS.find((l) => l.lotNo === selectedLotNo) ?? LOTS[0],
    [selectedLotNo]
  );

  const [samples1, setSamples1] = useState([]);
  const [samples2, setSamples2] = useState([]);

  /* Reset samples when lot changes */
  useEffect(() => {
    setSamples1(Array.from({ length: currentLot.sampleSize }, () => ({ value: "", status: "PENDING" })));
    setSamples2(Array.from({ length: currentLot.sampleSize }, () => ({ value: "", status: "PENDING" })));
  }, [currentLot]);

  const minWeight = TOLERANCE[currentLot.springType];

  const updateSample = (setSamplesFn, samples, idx, newValue) => {
    const arr = [...samples];
    arr[idx].value = newValue;

    const num = parseFloat(newValue);
    if (isNaN(num)) {
      arr[idx].status = "PENDING";
    } else {
      arr[idx].status = num >= minWeight ? "PASS" : "FAIL";
    }

    setSamplesFn(arr);
  };

  const rejected1 = useMemo(
    () => samples1.filter((s) => s.status === "FAIL").length,
    [samples1]
  );

  const showSecondSampling = rejected1 > currentLot.accpNo && rejected1 < currentLot.rejNo;

  const rejected2 = useMemo(
    () => samples2.filter((s) => s.status === "FAIL").length,
    [samples2]
  );

  const totalRejected = showSecondSampling ? rejected1 + rejected2 : rejected1;

  const finalResult = useMemo(() => {
    if (samples1.every((s) => s.value === "")) {
      return { status: "PENDING", color: "#f59e0b", icon: "⏳" };
    }

    if (rejected1 <= currentLot.accpNo) {
      return { status: "OK", color: "#22c55e", icon: "✓" };
    }

    if (
      rejected1 > currentLot.accpNo &&
      rejected1 < currentLot.rejNo &&
      totalRejected < currentLot.cummRejNo
    ) {
      return { status: "OK", color: "#22c55e", icon: "✓" };
    }

    if (rejected1 >= currentLot.rejNo || totalRejected >= currentLot.cummRejNo) {
      return { status: "NOT OK", color: "#ef4444", icon: "✗" };
    }

    return { status: "PENDING", color: "#f59e0b", icon: "⏳" };
  }, [rejected1, rejected2, totalRejected, samples1, currentLot.accpNo, currentLot.rejNo, currentLot.cummRejNo]);

  const handleSave = () => {
    if (!colorCode.trim()) return alert("Color Code is required.");
    if (!remarks.trim()) return alert("Remarks required.");

    const payload = {
      lotNo: currentLot.lotNo,
      heatNo: currentLot.heatNo,
      springType: currentLot.springType,
      samples1,
      samples2: showSecondSampling ? samples2 : [],
      rejected1,
      rejected2,
      totalRejected,
      result: finalResult.status,
      remarks
    };

    alert("Saved:\n\n" + JSON.stringify(payload, null, 2));
    onBack();
  };

  return (
    <div className="wt-container">

      {/* HEADER */}
      <div className="wt-header">
        <div>
          <h1 className="wt-title">Weight Test</h1>
          <p className="wt-subtitle">Final Product Inspection — Weight Measurement</p>
        </div>
        <button className="wt-btn-outline" onClick={onBack}>← Back</button>
      </div>

      {/* LOT INFORMATION */}
      <div className="wt-card">
        <div className="wt-card-header">
          <h3>📦 Lot Information</h3>
          <p className="wt-card-sub">Auto-Fetched from Process IC</p>
        </div>

        <div className="wt-grid">
          <div className="wt-field">
            <label className="wt-label required">Lot No</label>
            <select className="wt-input" value={selectedLotNo} onChange={(e) => setSelectedLotNo(e.target.value)}>
              {LOTS.map((lot) => (
                <option key={lot.lotNo} value={lot.lotNo}>{lot.lotNo}</option>
              ))}
            </select>
          </div>

          <div className="wt-field">
            <label className="wt-label">Heat No</label>
            <input className="wt-input" disabled value={currentLot.heatNo} />
          </div>

          <div className="wt-field">
            <label className="wt-label">Sample Size</label>
            <input className="wt-input" disabled value={currentLot.sampleSize} />
          </div>

          <div className="wt-field">
            <label className="wt-label required">Color Code</label>
            <input className="wt-input" value={colorCode} onChange={(e) => setColorCode(e.target.value)} />
          </div>

          <div className="wt-field">
            <label className="wt-label">Spring Type</label>
            <input className="wt-input" disabled value={currentLot.springType} />
          </div>

          <div className="wt-field">
            <label className="wt-label">Min Weight (g)</label>
            <input className="wt-input" disabled value={minWeight + " g"} />
          </div>
        </div>
      </div>

      {/* 1st SAMPLING */}
      <div className="wt-card">
        <div className="wt-card-header">
          <h3>1st Sampling</h3>
          <p className="wt-card-sub">Enter weight measurement (g)</p>
        </div>

        <table className="wt-table">
          <thead>
            <tr>
              <th>Sample</th>
              <th>Weight (g)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {samples1.map((s, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  <input
                    className="wt-input"
                    value={s.value}
                    onChange={(e) => updateSample(setSamples1, samples1, idx, e.target.value)}
                    placeholder="Enter weight"
                  />
                </td>
                <td>
                  <span className={`wt-badge ${s.status.toLowerCase()}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="wt-stats">
          <div className="wt-stat-box">
            <h3>{rejected1}</h3>
            <p>Rejected (R1)</p>
          </div>
        </div>
      </div>

      {/* 2nd SAMPLING */}
      {showSecondSampling && (
        <div className="wt-card warn">
          <div className="wt-card-header">
            <h3>⚠️ 2nd Sampling Required</h3>
            <p className="wt-card-sub">R1 = {rejected1}, allowed range ({currentLot.accpNo} - {currentLot.rejNo})</p>
          </div>

          <table className="wt-table">
            <thead>
              <tr>
                <th>Sample</th>
                <th>Weight (g)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {samples2.map((s, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <input
                      className="wt-input"
                      value={s.value}
                      onChange={(e) => updateSample(setSamples2, samples2, idx, e.target.value)}
                      placeholder="Enter weight"
                    />
                  </td>
                  <td>
                    <span className={`wt-badge ${s.status.toLowerCase()}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="wt-stats">
            <div className="wt-stat-box">
              <h3>{rejected2}</h3>
              <p>Rejected (R2)</p>
            </div>
            <div className="wt-stat-box">
              <h3>{totalRejected}</h3>
              <p>Total Rejected</p>
            </div>
          </div>
        </div>
      )}

      {/* RESULT */}
      <div className="wt-card">
        <div className="wt-result" style={{ borderColor: finalResult.color, color: finalResult.color }}>
          {finalResult.icon} {finalResult.status}
        </div>

        <div className="wt-field">
          <label className="wt-label">Remarks</label>
          <textarea
            rows="3"
            className="wt-input"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks..."
          />
        </div>

        <div className="wt-action">
          <button className="wt-btn-outline" onClick={onBack}>Cancel</button>
          <button className="wt-btn-primary" onClick={handleSave}>Save & Continue</button>
        </div>
      </div>
    </div>
  );
}
