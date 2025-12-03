import React, { useMemo, useState } from "react";
import "./FinalApplicationDeflectionPage.css";

/**
 * Application & Deflection Test - Refactored Version
 *
 * Clean structure:
 * 1. Lot Details
 * 2. R1, Conditional R2
 * 3. Auto Result + Total Rejection
 * 4. Remarks + Actions
 *
 * Fully responsive (desktop → mobile)
 * No inline CSS, follows Augment coding rules.
 */

const FinalApplicationDeflectionPage = ({ onBack }) => {
  // Mock data (replace with API)
  const LOTS = [
    { lotNo: "LOT-001", heatNo: "HT-A1", quantity: 500, accpNo: 2, rejNo: 3, cummRejNo: 4 },
    { lotNo: "LOT-002", heatNo: "HT-A2", quantity: 800, accpNo: 3, rejNo: 4, cummRejNo: 6 },
    { lotNo: "LOT-003", heatNo: "HT-B1", quantity: 1200, accpNo: 5, rejNo: 6, cummRejNo: 8 }
  ];

  const [selectedLot, setSelectedLot] = useState(LOTS[0].lotNo);
  const [colorCode, setColorCode] = useState("");
  const [r1, setR1] = useState("");
  const [r2, setR2] = useState("");
  const [remarks, setRemarks] = useState("");

  const currentLot = useMemo(
    () => LOTS.find((l) => l.lotNo === selectedLot) || LOTS[0],
    [selectedLot]
  );

  const toInt = (v) => (!v || isNaN(v) ? 0 : parseInt(v));

  // Conditions for R2 to appear
  const showR2 = useMemo(() => {
    const r1n = toInt(r1);
    return r1 !== "" && r1n > currentLot.accpNo && r1n < currentLot.rejNo;
  }, [r1, currentLot]);

  const totalRejected = useMemo(
    () => toInt(r1) + (showR2 ? toInt(r2) : 0),
    [r1, r2, showR2]
  );

  // Final Result Logic
  const result = useMemo(() => {
    const r1n = toInt(r1);
    const tr = totalRejected;

    if (r1 === "") return { status: "PENDING", color: "#f59e0b", icon: "⏳" };
    if (r1n <= currentLot.accpNo) return { status: "OK", color: "#22c55e", icon: "✓" };
    if (r1n > currentLot.accpNo && r1n < currentLot.rejNo && tr < currentLot.cummRejNo)
      return { status: "OK", color: "#22c55e", icon: "✓" };
    return { status: "NOT OK", color: "#ef4444", icon: "✗" };
  }, [r1, totalRejected, currentLot]);

  // Basic validation before save
  const validate = () => {
    if (!colorCode.trim()) return "Color Code is required.";
    if (r1 === "") return "R1 is required.";
    if (showR2 && r2 === "") return "R2 is required.";
    return null;
  };

  const handleSave = () => {
    const err = validate();
    if (err) return alert(err);

    const payload = {
      lotNo: selectedLot,
      heatNo: currentLot.heatNo,
      quantity: currentLot.quantity,
      colorCode,
      r1: toInt(r1),
      r2: showR2 ? toInt(r2) : 0,
      totalRejected,
      result: result.status,
      remarks
    };

    alert("Saved!\n\n" + JSON.stringify(payload, null, 2));
    onBack();
  };

  return (
    <div className="ad-container">

      {/* HEADER */}
      <div className="ad-header">
        <div>
          <h1 className="ad-title">Application & Deflection Test</h1>
          <p className="ad-subtitle">Final Product Inspection - Load Deflection</p>
        </div>
        <button className="ad-btn ad-btn-outline" onClick={onBack}>← Back</button>
      </div>

      {/* LOT DETAILS */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">📦 Lot Information</h3>
          <p className="ad-card-subtitle">Auto-populated from Process IC</p>
        </div>

        <div className="ad-grid">
          <div className="ad-field">
            <label className="ad-label required">Lot No.</label>
            <select
              className="ad-input"
              value={selectedLot}
              onChange={(e) => setSelectedLot(e.target.value)}
            >
              {LOTS.map((l) => (
                <option key={l.lotNo}>{l.lotNo}</option>
              ))}
            </select>
          </div>

          <div className="ad-field">
            <label className="ad-label">Heat No.</label>
            <input className="ad-input" disabled value={currentLot.heatNo} />
          </div>

          <div className="ad-field">
            <label className="ad-label">Quantity</label>
            <input className="ad-input" disabled value={currentLot.quantity} />
          </div>

          <div className="ad-field">
            <label className="ad-label required">Color Code</label>
            <input
              className="ad-input"
              value={colorCode}
              onChange={(e) => setColorCode(e.target.value)}
              placeholder="Enter color code"
            />
          </div>

          <div className="ad-field">
            <label className="ad-label">AQL Limits</label>
            <input
              className="ad-input"
              disabled
              value={`Accp: ${currentLot.accpNo} | Rej: ${currentLot.rejNo} | Cumm: ${currentLot.cummRejNo}`}
            />
          </div>
        </div>
      </div>

      {/* SAMPLING SECTION */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Sampling Result</h3>
          <p className="ad-card-subtitle">Enter rejection counts</p>
        </div>

        <div className="ad-grid">
          <div className="ad-field">
            <label className="ad-label required">Pieces Failed in 1st Sampling (R1)</label>
            <input
              type="number"
              className="ad-input"
              value={r1}
              onChange={(e) => setR1(e.target.value)}
            />
          </div>

          <div className="ad-field">
            <label className="ad-label">Pieces Failed in 2nd Sampling (R2)</label>
            <input
              type="number"
              className="ad-input"
              value={r2}
              disabled={!showR2}
              onChange={(e) => setR2(e.target.value)}
              placeholder={!showR2 ? "Shown only if R1 triggers" : ""}
            />
          </div>
        </div>

        {/* STATS */}
        <div className="ad-stats">
          <div className="ad-stat">
            <div className="ad-stat-value">{toInt(r1)}</div>
            <span className="ad-stat-label">R1</span>
          </div>

          <div className="ad-stat">
            <div className="ad-stat-value">{showR2 ? toInt(r2) : "-"}</div>
            <span className="ad-stat-label">R2</span>
          </div>

          <div className="ad-stat">
            <div className="ad-stat-value">{totalRejected}</div>
            <span className="ad-stat-label">Total Rejected</span>
          </div>

          <div className="ad-stat">
            <div
              className="ad-result-box"
              style={{ borderColor: result.color, color: result.color }}
            >
              {result.icon} {result.status}
            </div>
            <span className="ad-stat-label">Result</span>
          </div>
        </div>
      </div>

      {/* REMARKS */}
      <div className="ad-card">
        <div className="ad-field full">
          <label className="ad-label required">Remarks</label>
          <textarea
            className="ad-input ad-textarea"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks..."
          />
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="ad-actions">
        <button className="ad-btn ad-btn-outline" onClick={onBack}>Cancel</button>
        <button className="ad-btn ad-btn-primary" onClick={handleSave}>Save & Continue</button>
      </div>
    </div>
  );
};

export default FinalApplicationDeflectionPage;
