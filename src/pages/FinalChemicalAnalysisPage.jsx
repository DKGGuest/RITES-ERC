import { useState } from "react";
import FinalSubmoduleNav from "../components/FinalSubmoduleNav";
import "./FinalChemicalAnalysisPage.css";

const availableLots = [
  {
    lotNo: "LOT-001",
    heatNo: "HT-2025-A1",
    ladleAnalysis: { c: 0.55, si: 1.75, mn: 0.9, s: 0.02, p: 0.025 },
  },
  {
    lotNo: "LOT-002",
    heatNo: "HT-2025-A2",
    ladleAnalysis: { c: 0.54, si: 1.8, mn: 0.88, s: 0.018, p: 0.022 },
  },
];

const FinalChemicalAnalysisPage = ({ onBack, onNavigateSubmodule }) => {
  const [chemValues, setChemValues] = useState({});
  const [remarks, setRemarks] = useState({});
  const [expandedLot, setExpandedLot] = useState("LOT-001"); // ✅ Default expanded lot

  const chemicalFields = [
    { id: "c", label: "% C (Carbon)" },
    { id: "si", label: "% Si (Silicon)" },
    { id: "mn", label: "% Mn (Manganese)" },
    { id: "s", label: "% S (Sulphur)" },
    { id: "p", label: "% P (Phosphorus)" },
  ];

  /* Element specification ranges */
  const elementRanges = {
    c: { min: 0.5, max: 0.6 },
    mn: { min: 0.8, max: 1.0 },
    si: { min: 1.5, max: 2.0 },
    s: { min: 0, max: 0.03 },
    p: { min: 0, max: 0.03 },
  };

  /* Tolerance from ladle value */
  const tolerances = {
    c: 0.03,
    mn: 0.04,
    si: 0.05,
    s: 0.005,
    p: 0.005,
  };

  const handleChemChange = (lotNo, element, value) => {
    setChemValues((prev) => ({
      ...prev,
      [lotNo]: { ...(prev[lotNo] || {}), [element]: value },
    }));
  };

  const toggleLot = (lotNo) => {
    setExpandedLot((prev) => (prev === lotNo ? null : lotNo));
  };

  /* Validation function for product value */
  const getValueStatus = (element, productValue, ladleValue) => {
    if (!productValue || productValue === "") return "";

    const pVal = parseFloat(productValue);
    const lVal = parseFloat(ladleValue);

    if (isNaN(pVal) || isNaN(lVal)) return "";

    const range = elementRanges[element];
    const tolerance = tolerances[element];

    // Rule 1: Check if value is within specification range
    const withinRange = pVal >= range.min && pVal <= range.max;
    if (!withinRange) return "fail";

    // Rule 2: Check tolerance from ladle value
    // For S and P: only positive tolerance (product can be higher than ladle)
    // For C, Mn, Si: ± tolerance (product can be higher or lower)
    let withinTolerance = false;

    if (element === 's' || element === 'p') {
      // S and P: product value should be within ladle to (ladle + tolerance)
      withinTolerance = pVal >= lVal && pVal <= (lVal + tolerance);
    } else {
      // C, Mn, Si: product value should be within (ladle - tolerance) to (ladle + tolerance)
      const diff = Math.abs(pVal - lVal);
      withinTolerance = diff <= tolerance;
    }

    return withinTolerance ? "pass" : "fail";
  };

  return (
    <div className="chem-page">
      {/* HEADER */}
      <div className="chem-header">
        <div className="chem-header-text">
          <h1>Chemical Analysis</h1>
          <p>Final Product Inspection - One section per Lot</p>
        </div>
        <button className="btn btn-outline back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>

      <FinalSubmoduleNav
        currentSubmodule="final-chemical-analysis"
        onNavigate={onNavigateSubmodule}
      />

      {/* DESKTOP/TABLET VIEW */}
      <div className="desktop-fields">
        {availableLots.map((lot) => (
          <div key={lot.lotNo} className="chem-section">
            <div className="chem-title">
              📦 Lot: {lot.lotNo} | Heat No: {lot.heatNo}
            </div>

           <div className="chem-label-grid">
  <span></span> {/* empty space for label column */}
  {chemicalFields.map((field) => (
    <span key={field.id}>{field.label}</span>
  ))}
</div>


            <div className="chem-row">
              <div className="chem-row-label">Ladle Values</div>
              <div className="chem-input-grid">
                {chemicalFields.map((field) => (
                  <div key={field.id} className="ladle-value">
                    {lot.ladleAnalysis[field.id]?.toFixed(
                      field.id === "s" || field.id === "p" ? 3 : 2
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="chem-row">
              <div className="chem-row-label">Product Values</div>
              <div className="chem-input-grid">
                {chemicalFields.map((field) => {
                  const productValue = chemValues[lot.lotNo]?.[field.id] || "";
                  const ladleValue = lot.ladleAnalysis[field.id];
                  const status = getValueStatus(field.id, productValue, ladleValue);

                  return (
                    <input
                      key={field.id}
                      type="number"
                      step="0.001"
                      className={`product-input ${status}`}
                      placeholder="Enter value"
                      value={productValue}
                      onChange={(e) =>
                        handleChemChange(lot.lotNo, field.id, e.target.value)
                      }
                    />
                  );
                })}
              </div>
            </div>

            <div className="chem-row">
              <div className="chem-row-label">Remarks</div>
              <textarea
                className="remarks-input"
                placeholder="Enter remarks..."
                value={remarks[lot.lotNo] || ""}
                onChange={(e) =>
                  setRemarks((prev) => ({
                    ...prev,
                    [lot.lotNo]: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* MOBILE VIEW (COLLAPSIBLE) */}
      <div className="mobile-fields">
        {availableLots.map((lot) => (
          <div
            key={lot.lotNo}
            className={`mobile-lot ${
              expandedLot === lot.lotNo ? "open" : ""
            }`}
          >
            <div
              className="mobile-lot-header"
              onClick={() => toggleLot(lot.lotNo)}
            >
              <span>
                📦 {lot.lotNo} | {lot.heatNo}
              </span>
              <span className="arrow">{expandedLot === lot.lotNo ? "▲" : "▼"}</span>
            </div>

            <div className="mobile-lot-body">
              <div className="mobile-lot-body-content">
                {chemicalFields.map((field) => {
                  const productValue = chemValues[lot.lotNo]?.[field.id] || "";
                  const ladleValue = lot.ladleAnalysis[field.id];
                  const status = getValueStatus(field.id, productValue, ladleValue);

                  return (
                    <div key={field.id} className="mobile-field-block">
                      <div className="mobile-field-label">{field.label}</div>
                      <div className="mobile-ladle">
                        <strong>Ladle:</strong>{" "}
                        {lot.ladleAnalysis[field.id]?.toFixed(
                          field.id === "s" || field.id === "p" ? 3 : 2
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.001"
                        className={`mobile-product ${status}`}
                        placeholder="Enter product value"
                        value={productValue}
                        onChange={(e) =>
                          handleChemChange(lot.lotNo, field.id, e.target.value)
                        }
                      />
                    </div>
                  );
                })}

                <div className="mobile-field-block remarks-block">
                  <div className="mobile-field-label">Remarks</div>
                  <textarea
                    className="remarks-input"
                    placeholder="Enter remarks..."
                    value={remarks[lot.lotNo] || ""}
                    onChange={(e) =>
                      setRemarks((prev) => ({
                        ...prev,
                        [lot.lotNo]: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="chem-footer">
        <button className="btn btn-outline" onClick={onBack}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => alert("Chemical Data Saved!")}
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default FinalChemicalAnalysisPage;
