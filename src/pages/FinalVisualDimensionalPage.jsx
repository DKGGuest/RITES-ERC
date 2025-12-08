import { useState } from "react";
import FinalSubmoduleNav from "../components/FinalSubmoduleNav";

const availableLots = [
  { lotNo: "LOT-001", heatNo: "HT-2025-A1", quantity: 500, sampleSize: 50, accpNo: 2, rejNo: 3, cummRejNo: 4 },
  { lotNo: "LOT-002", heatNo: "HT-2025-A2", quantity: 800, sampleSize: 80, accpNo: 3, rejNo: 4, cummRejNo: 6 },
  { lotNo: "LOT-003", heatNo: "HT-2025-B1", quantity: 1200, sampleSize: 125, accpNo: 5, rejNo: 6, cummRejNo: 8 }
];

const FinalVisualDimensionalPage = ({ onBack, onNavigateSubmodule }) => {
  /* Section collapse states */
  const [visualExpanded, setVisualExpanded] = useState(true);
  const [dimensionalExpanded, setDimensionalExpanded] = useState(true);

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
      margin-bottom: 24px;
      overflow: hidden;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      cursor: pointer;
    }
    .section-header:hover { background: #f1f5f9; }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .collapse-btn {
      background: #e2e8f0;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
    }
    .collapse-btn:hover { background: #cbd5e1; }
    .section-content { padding: 16px; }
    .lot-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .lot-card:last-child { margin-bottom: 0; }
    .lot-header {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .lot-header-item { display: flex; gap: 4px; }
    .lot-header-label { color: #64748b; font-weight: 500; }
    .sampling-label {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 8px;
    }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .label { font-size: 12px; font-weight: 600; color: #475569; }
    .input {
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid #d1d9e6;
      height: 38px;
      font-size: 14px;
    }
    .input:disabled { background: #f1f5f9; }
    /* Visual Lot Row - Desktop: All fields in one row */
    .visual-lot-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      align-items: end;
    }
    @media (min-width: 1024px) {
      .visual-lot-row { grid-template-columns: 1fr 1fr 120px 140px 1fr; gap: 16px; }
      .visual-lot-row.no-r2 { grid-template-columns: 1fr 120px 140px 1fr; }
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .visual-lot-row { grid-template-columns: repeat(2, 1fr); }
    }
    /* Dimensional Grid */
    .dimensional-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
    @media (min-width: 768px) {
      .dimensional-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
    }
    /* Summary Grid */
    .summary-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 12px; }
    @media (min-width: 768px) {
      .summary-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
    }
    .result-box {
      padding: 8px;
      border-radius: 6px;
      text-align: center;
      font-weight: 700;
      border: 1px solid transparent;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sampling-divider {
      font-size: 13px;
      font-weight: 600;
      color: #0ea5e9;
      margin: 16px 0 8px;
      padding-top: 12px;
      border-top: 1px dashed #cbd5e1;
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
        <div className="section-header" onClick={() => setVisualExpanded(!visualExpanded)}>
          <h2 className="section-title">👁️ Visual Inspection</h2>
          <button className="collapse-btn">
            {visualExpanded ? '▲ Collapse' : '▼ Expand'}
          </button>
        </div>

        {visualExpanded && (
          <div className="section-content">
            {availableLots.map(lot => {
              const d = lotData[lot.lotNo];
              const r1 = safe(d.visualR1);
              const r2 = safe(d.visualR2);
              const show2nd = r1 > lot.accpNo;
              const totalRejected = r1 + (show2nd ? r2 : 0);

              /* 2nd sampling logic: If R1 > Acceptance No., show 2nd sampling */
              /* Final status: OK if R1 <= AccpNo, NOT OK if total >= CummRejNo */
              const status =
                r1 <= lot.accpNo
                  ? { text: "OK", color: "#22c55e" }
                  : totalRejected >= lot.cummRejNo
                  ? { text: "NOT OK", color: "#ef4444" }
                  : { text: "Pending", color: "#f59e0b" };

              return (
                <div key={lot.lotNo} className="lot-card">
                  <div className="lot-header">
                    <span className="lot-header-item">
                      <span className="lot-header-label">Lot:</span> {lot.lotNo}
                    </span>
                    <span className="lot-header-item">
                      <span className="lot-header-label">Heat:</span> {lot.heatNo}
                    </span>
                    <span className="lot-header-item">
                      <span className="lot-header-label">Qty:</span> {lot.quantity}
                    </span>
                    <span className="lot-header-item">
                      <span className="lot-header-label">Sample:</span> {lot.sampleSize}
                    </span>
                    <span className="lot-header-item">
                      <span className="lot-header-label">Ac:</span> {lot.accpNo}
                    </span>
                    <span className="lot-header-item">
                      <span className="lot-header-label">Re:</span> {lot.rejNo}
                    </span>
                  </div>

                  {/* 1st Sampling Row - All fields in one row on desktop */}
                  <div className="sampling-label">1st Sampling</div>
                  <div className={`visual-lot-row ${!show2nd ? 'no-r2' : ''}`}>
                    <div className="field">
                      <label className="label">Rejected Pieces (R1)</label>
                      <input
                        type="number"
                        min="0"
                        className="input"
                        value={d.visualR1}
                        onChange={e => handleChange(lot.lotNo, "visualR1", e.target.value)}
                        placeholder="Enter count"
                      />
                    </div>

                    {show2nd && (
                      <div className="field">
                        <label className="label">2nd Sampling - Rejected (R2)</label>
                        <input
                          type="number"
                          min="0"
                          className="input"
                          value={d.visualR2}
                          onChange={e => handleChange(lot.lotNo, "visualR2", e.target.value)}
                          placeholder="Enter count"
                        />
                      </div>
                    )}

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
                        placeholder="Enter remarks"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------------- DIMENSIONAL INSPECTION ---------------- */}
      <div className="section-wrapper">
        <div className="section-header" onClick={() => setDimensionalExpanded(!dimensionalExpanded)}>
          <h2 className="section-title">📏 Dimensional Inspection</h2>
          <button className="collapse-btn">
            {dimensionalExpanded ? '▲ Collapse' : '▼ Expand'}
          </button>
        </div>

        {dimensionalExpanded && (
          <div className="section-content">
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
                    <span className="lot-header-item">
                      <span className="lot-header-label">Lot:</span> {lot.lotNo}
                    </span>
                    <span className="lot-header-item">
                      <span className="lot-header-label">Heat:</span> {lot.heatNo}
                    </span>
                    <span className="lot-header-item">
                      <span className="lot-header-label">Qty:</span> {lot.quantity}
                    </span>
                    <span className="lot-header-item">
                      <span className="lot-header-label">Sample:</span> {lot.sampleSize}
                    </span>
                    <span className="lot-header-item">
                      <span className="lot-header-label">Ac:</span> {lot.accpNo}
                    </span>
                    <span className="lot-header-item">
                      <span className="lot-header-label">Re:</span> {lot.rejNo}
                    </span>
                  </div>

                  {/* 1st Sampling */}
                  <div className="sampling-label">1st Sampling</div>
                  <div className="dimensional-grid">
                    <div className="field">
                      <label className="label">Go Gauge Fail</label>
                      <input className="input" type="number" min="0" value={d.dimGo1}
                        onChange={e => handleChange(lot.lotNo, "dimGo1", e.target.value)}
                        placeholder="0" />
                    </div>
                    <div className="field">
                      <label className="label">No-Go Fail</label>
                      <input className="input" type="number" min="0" value={d.dimNoGo1}
                        onChange={e => handleChange(lot.lotNo, "dimNoGo1", e.target.value)}
                        placeholder="0" />
                    </div>
                    <div className="field">
                      <label className="label">Flat Bearing Fail</label>
                      <input className="input" type="number" min="0" value={d.dimFlat1}
                        onChange={e => handleChange(lot.lotNo, "dimFlat1", e.target.value)}
                        placeholder="0" />
                    </div>
                  </div>

                  {/* 2nd Sampling - Shows when R1 > Acceptance No. */}
                  {show2nd && (
                    <>
                      <div className="sampling-divider">2nd Sampling (R1 &gt; Acceptance No.)</div>
                      <div className="dimensional-grid">
                        <div className="field">
                          <label className="label">Go Gauge Fail (2nd)</label>
                          <input className="input" type="number" min="0" value={d.dimGo2}
                            onChange={e => handleChange(lot.lotNo, "dimGo2", e.target.value)}
                            placeholder="0" />
                        </div>
                        <div className="field">
                          <label className="label">No-Go Fail (2nd)</label>
                          <input className="input" type="number" min="0" value={d.dimNoGo2}
                            onChange={e => handleChange(lot.lotNo, "dimNoGo2", e.target.value)}
                            placeholder="0" />
                        </div>
                        <div className="field">
                          <label className="label">Flat Bearing Fail (2nd)</label>
                          <input className="input" type="number" min="0" value={d.dimFlat2}
                            onChange={e => handleChange(lot.lotNo, "dimFlat2", e.target.value)}
                            placeholder="0" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Summary Row */}
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
                        placeholder="Enter remarks"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
