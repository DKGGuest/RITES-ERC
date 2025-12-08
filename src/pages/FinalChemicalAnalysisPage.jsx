import { useState } from "react";
import FinalSubmoduleNav from "../components/FinalSubmoduleNav";
import "./FinalChemicalAnalysisPage.css";

const availableLots = [
  { lotNo: "LOT-001", heatNo: "HT-2025-A1", ladleAnalysis: { c: 0.55, si: 1.75, mn: 0.9, s: 0.02, p: 0.025 } },
  { lotNo: "LOT-002", heatNo: "HT-2025-A2", ladleAnalysis: { c: 0.54, si: 1.8, mn: 0.88, s: 0.018, p: 0.022 } },
];

const FinalChemicalAnalysisPage = ({ onBack, onNavigateSubmodule }) => {
  const [chemValues, setChemValues] = useState({});
  const [remarks, setRemarks] = useState({});

  const chemicalFields = [
    { id: "c", label: "% C (Carbon)" },
    { id: "si", label: "% Si (Silicon)" },
    { id: "mn", label: "% Mn (Manganese)" },
    { id: "s", label: "% S (Sulphur)" },
    { id: "p", label: "% P (Phosphorus)" },
  ];

  const handleChemChange = (lotNo, element, value) => {
    setChemValues((prev) => ({
      ...prev,
      [lotNo]: { ...(prev[lotNo] || {}), [element]: value }
    }));
  };

  return (
    <div className="chem-page">
      <div className="chem-header">
        <div>
          <h1>Chemical Analysis</h1>
          <p>Final Product Inspection - One section per Lot</p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>← Back</button>
      </div>

      <FinalSubmoduleNav
        currentSubmodule="final-chemical-analysis"
        onNavigate={onNavigateSubmodule}
      />

      {availableLots.map((lot) => (
        <div key={lot.lotNo} className="chem-section">
          <div className="chem-title">📦 Lot: {lot.lotNo} | Heat No: {lot.heatNo}</div>

          {/* ---- FIELD LABELS ---- */}
          <div className="chem-label-grid">
            {chemicalFields.map((field) => (
              <span key={field.id}>{field.label}</span>
            ))}
          </div>

          {/* LADLE VALUES */}
          <div className="chem-row">
            <div className="chem-row-label">Ladle Values</div>

            <div className="chem-input-grid ladle-grid-mobile">

              {chemicalFields.map((field) => (
                <div key={field.id} className="ladle-value">
                  {lot.ladleAnalysis[field.id]?.toFixed(field.id === "s" || field.id === "p" ? 3 : 2)}
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT VALUES */}
          <div className="chem-row">
            <div className="chem-row-label">Product Values</div>

            <div className="chem-input-grid">
              {chemicalFields.map((field) => (
                <input
                  key={field.id}
                  type="number"
                  step="0.001"
                  className="product-input"
                  placeholder="Enter value"
                  value={chemValues[lot.lotNo]?.[field.id] || ""}
                  onChange={(e) => handleChemChange(lot.lotNo, field.id, e.target.value)}
                />
              ))}
            </div>
          </div>

          {/* REMARKS */}
          <div className="chem-row">
            <div className="chem-row-label">Remarks</div>
            <textarea
              className="remarks-input"
              placeholder="Enter remarks..."
              value={remarks[lot.lotNo] || ""}
              onChange={(e) =>
                setRemarks((prev) => ({ ...prev, [lot.lotNo]: e.target.value }))
              }
            />
          </div>
        </div>
      ))}

      <div className="chem-footer">
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button className="btn btn-primary" onClick={() => alert("Chemical Data Saved!")}>
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default FinalChemicalAnalysisPage;
