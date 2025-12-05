import { useState } from "react";
import FinalSubmoduleNav from "../components/FinalSubmoduleNav";

const availableLots = [
  { lotNo: "LOT-001", heatNo: "HT-2025-A1", quantity: 500, sampleSize: 50, accpNo: 2, rejNo: 3, cummRejNo: 4 },
  { lotNo: "LOT-002", heatNo: "HT-2025-A2", quantity: 800, sampleSize: 80, accpNo: 3, rejNo: 4, cummRejNo: 6 },
  { lotNo: "LOT-003", heatNo: "HT-2025-B1", quantity: 1200, sampleSize: 125, accpNo: 5, rejNo: 6, cummRejNo: 8 }
];

const FinalVisualDimensionalPage = ({ onBack, onNavigateSubmodule }) => {
  const [lotData, setLotData] = useState(
    availableLots.reduce(
      (acc, lot) => ({
        ...acc,
        [lot.lotNo]: {
          visualR1: "",
          visualR2: "",
          visualRemark: "",
          dimGo1: "",
          dimNoGo1: "",
          dimFlat1: "",
          dimGo2: "",
          dimNoGo2: "",
          dimFlat2: "",
          dimRemark: ""
        }
      }),
      {}
    )
  );

  const handleChange = (lotNo, field, value) => {
    setLotData(prev => ({
      ...prev,
      [lotNo]: {
        ...prev[lotNo],
        [field]: value === "" ? "" : Number(value)
      }
    }));
  };

  const safe = val => (val === "" || isNaN(val) ? 0 : Number(val));

  const styles = `
    .section-wrapper {
      background: #ffffff;
      border: 1px solid #dce1e7;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .lot-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .lot-header {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
    }

    .sampling-title {
      font-size: 14px;
      font-weight: 600;
      margin: 10px 0 8px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }

    .input {
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid #d1d9e6;
      height: 38px;
      font-size: 14px;
    }

    /* Mobile - one column layout */
    .sampling-grid, .summary-grid, .dimensional-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    /* Desktop - 2 columns for sampling */
    @media (min-width: 900px) {
      .sampling-grid {
        grid-template-columns: repeat(2, minmax(260px, 1fr));
      }
    }

    /* Desktop - 3 columns in summary */
    @media (min-width: 900px) {
      .summary-grid {
        grid-template-columns: repeat(3, minmax(200px, 1fr));
        align-items: center;
        gap: 18px;
      }
    }

    /* Desktop - 3 columns for Dimensional Inspection sampling */
    @media (min-width: 900px) {
      .dimensional-grid {
        grid-template-columns: repeat(3, minmax(200px, 1fr));
      }
    }

    .result-box {
      padding: 8px;
      border-radius: 6px;
      text-align: center;
      font-weight: 700;
      border: 1px solid transparent;
    }
  `;

  return (
    <div>
      <style>{styles}</style>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1>Visual & Dimensional Check</h1>
          <p style={{ fontSize: 12, color: "#64748b" }}>
            Final Product Inspection – each lot displayed separately
          </p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>← Back</button>
      </div>

      <FinalSubmoduleNav currentSubmodule="final-visual-dimensional" onNavigate={onNavigateSubmodule} />

      {/* ---------------- VISUAL INSPECTION ---------------- */}
      <div className="section-wrapper">
        <h2 className="section-title">👁️ Visual Inspection</h2>

        {availableLots.map(lot => {
          const d = lotData[lot.lotNo];

          const r1 = safe(d.visualR1);
          const r2 = safe(d.visualR2);
          const show2nd = r1 > lot.accpNo;
          const totalRejected = r1 + (show2nd ? r2 : 0);

          const status =
            r1 <= lot.accpNo
              ? { text: "OK", color: "#22c55e" }
              : totalRejected >= lot.cummRejNo
              ? { text: "NOT OK", color: "#ef4444" }
              : { text: "Pending", color: "#f59e0b" };

          return (
            <div key={lot.lotNo} className="lot-card">

              <div className="lot-header">
                📦 Lot {lot.lotNo} | Heat {lot.heatNo} | Qty {lot.quantity}
              </div>

              {/* SAMPLING ROW (1st + 2nd in one line on desktop) */}
              <div className="sampling-grid">
                {/* 1st */}
                <div className="field">
                  <label className="label">1st Sampling - Rejected Pieces</label>
                  <input
                    type="number"
                    className="input"
                    value={d.visualR1}
                    onChange={e => handleChange(lot.lotNo, "visualR1", e.target.value)}
                  />
                </div>

                {/* 2nd */}
                {show2nd && (
                  <div className="field">
                    <label className="label">2nd Sampling - Rejected Pieces</label>
                    <input
                      type="number"
                      className="input"
                      value={d.visualR2}
                      onChange={e => handleChange(lot.lotNo, "visualR2", e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* SUMMARY (One row on desktop) */}
              <div className="sampling-title">Summary</div>
              <div className="summary-grid">

                <div className="field">
                  <label className="label">Total Rejected</label>
                  <input className="input" value={totalRejected} disabled />
                </div>

                <div className="field">
                  <label className="label">Result</label>
                  <div
                    className="result-box"
                    style={{ color: status.color, borderColor: status.color, background: status.color + "22" }}
                  >
                    {status.text}
                  </div>
                </div>

                <div className="field">
                  <label className="label">Remarks</label>
                  <input
                    type="text"
                    className="input"
                    value={d.visualRemark}
                    onChange={e => handleChange(lot.lotNo, "visualRemark", e.target.value)}
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- DIMENSIONAL INSPECTION ---------------- */}
      <div className="section-wrapper">
        <h2 className="section-title">📏 Dimensional Inspection</h2>

        {availableLots.map(lot => {
          const d = lotData[lot.lotNo];

          const r1 = safe(d.dimGo1) + safe(d.dimNoGo1) + safe(d.dimFlat1);
          const r2 = safe(d.dimGo2) + safe(d.dimNoGo2) + safe(d.dimFlat2);

          const show2nd = r1 > lot.accpNo;
          const totalRejected = r1 + (show2nd ? r2 : 0);

          const status =
            r1 <= lot.accpNo
              ? { text: "OK", color: "#22c55e" }
              : totalRejected >= lot.cummRejNo
              ? { text: "NOT OK", color: "#ef4444" }
              : { text: "Pending", color: "#f59e0b" };

          return (
            <div key={lot.lotNo} className="lot-card">

              <div className="lot-header">
                📦 Lot {lot.lotNo} | Heat {lot.heatNo} | Qty {lot.quantity}
              </div>

              {/* 1st sampling in row */}
              <div className="dimensional-grid">
                <div className="field">
                  <label className="label">Go Gauge Fail</label>
                  <input className="input" value={d.dimGo1}
                    onChange={e => handleChange(lot.lotNo, "dimGo1", e.target.value)}
                    type="number" />
                </div>

                <div className="field">
                  <label className="label">No-Go Fail</label>
                  <input className="input" value={d.dimNoGo1}
                    onChange={e => handleChange(lot.lotNo, "dimNoGo1", e.target.value)}
                    type="number" />
                </div>

                <div className="field">
                  <label className="label">Flat Bearing Fail</label>
                  <input className="input" value={d.dimFlat1}
                    onChange={e => handleChange(lot.lotNo, "dimFlat1", e.target.value)}
                    type="number" />
                </div>
              </div>

              {/* 2nd sampling */}
              {show2nd && (
                <div className="dimensional-grid" style={{ marginTop: 14 }}>
                  <div className="field">
                    <label className="label">Go Gauge Fail (2nd)</label>
                    <input className="input" value={d.dimGo2}
                      onChange={e => handleChange(lot.lotNo, "dimGo2", e.target.value)}
                      type="number" />
                  </div>

                  <div className="field">
                    <label className="label">No-Go Fail (2nd)</label>
                    <input className="input" value={d.dimNoGo2}
                      onChange={e => handleChange(lot.lotNo, "dimNoGo2", e.target.value)}
                      type="number" />
                  </div>

                  <div className="field">
                    <label className="label">Flat Bearing Fail (2nd)</label>
                    <input className="input" value={d.dimFlat2}
                      onChange={e => handleChange(lot.lotNo, "dimFlat2", e.target.value)}
                      type="number" />
                  </div>
                </div>
              )}

              {/* Summary Row */}
              <div className="sampling-title">Summary</div>
              <div className="summary-grid">

                <div className="field">
                  <label className="label">Total Rejected</label>
                  <input className="input" value={totalRejected} disabled />
                </div>

                <div className="field">
                  <label className="label">Result</label>
                  <div
                    className="result-box"
                    style={{ color: status.color, borderColor: status.color, background: status.color + "22" }}
                  >
                    {status.text}
                  </div>
                </div>

                <div className="field">
                  <label className="label">Remarks</label>
                  <input
                    className="input"
                    value={d.dimRemark}
                    onChange={e => handleChange(lot.lotNo, "dimRemark", e.target.value)}
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* BUTTONS */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button className="btn btn-primary">Save & Continue</button>
      </div>
    </div>
  );
};

export default FinalVisualDimensionalPage;
