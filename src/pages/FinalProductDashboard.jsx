import { useState, useMemo } from "react";
import FormField from "../components/FormField";
import { MOCK_PO_DATA } from "../data/mockData";
import { formatDate } from "../utils/helpers";
import "./FinalProductDashboard.css";

export default function FinalProductDashboard({ onBack, onNavigateToSubModule }) {
  /* -------------------- STATE -------------------- */
  const [lotSize, setLotSize] = useState(1000);
  const [selectedLot, setSelectedLot] = useState("LOT-001");

  const [hdpeBags, setHdpeBags] = useState(false);
  const [cleanedCoating, setCleanedCoating] = useState(false);
  const [bagsNonStdPacking, setBagsNonStdPacking] = useState("");
  const [ercNonStdBag, setErcNonStdBag] = useState("");
  const [noteErcTesting, setNoteErcTesting] = useState("");
  const [finalRemarks, setFinalRemarks] = useState("");

  const [hologramType, setHologramType] = useState("range");
  const [hologramRanges, setHologramRanges] = useState([{ from: "", to: "" }]);
  const [singleHolograms, setSingleHolograms] = useState([""]);

  const poData = MOCK_PO_DATA["PO-2025-1001"];

  /* -------------------- AQL LOGIC -------------------- */
  const calculateAQL = (lot) => {
    if (lot <= 500) return { sampleSize: 50, bags: 5, acc: 2, rej: 3 };
    if (lot <= 1200) return { sampleSize: 80, bags: 8, acc: 3, rej: 4 };
    if (lot <= 3200) return { sampleSize: 125, bags: 13, acc: 5, rej: 6 };
    return { sampleSize: 200, bags: 20, acc: 7, rej: 8 };
  };
  const aql = calculateAQL(lotSize);

  /* -------------------- MOCK LOT DATA -------------------- */
  const lotsData = {
    "LOT-001": { qtyOffered: 500, qtyAccepted: 495, qtyRejected: 5, stdPackingNo: 50 },
    "LOT-002": { qtyOffered: 800, qtyAccepted: 790, qtyRejected: 10, stdPackingNo: 50 }
  };
  const lot = lotsData[selectedLot];
  const bagsWithStd = Math.ceil(lot.qtyAccepted / lot.stdPackingNo);

  /* -------------------- SUBMODULE LIST -------------------- */
  const SUBMODULES = [
    { key: "final-calibration-documents", icon: "📄", title: "Calibration & Documents", desc: "Verify calibration" },
    { key: "final-visual-dimensional", icon: "📏", title: "Visual & Dimensional", desc: "Surface & dimensions" },
    { key: "final-chemical-analysis", icon: "🧪", title: "Chemical Analysis", desc: "Composition check" },
    { key: "final-hardness-test", icon: "💎", title: "Hardness Test", desc: "HRC measurement" },
    { key: "final-inclusion-rating", icon: "🔬", title: "Inclusion & Decarb", desc: "Metallurgical exam" },
    { key: "final-application-deflection", icon: "📐", title: "Deflection Test", desc: "Load-deflection" },
    { key: "final-toe-load-test", icon: "🎯", title: "Toe Load Test", desc: "Load verification" },
    { key: "final-weight-test", icon: "⚖️", title: "Weight Test", desc: "Weight check" },
    { key: "final-reports", icon: "📊", title: "Reports", desc: "Summary & reports" }
  ];

  /* -------------------- PRE-INSPECTION FORM FIELDS -------------------- */
  const preFields = [
    { key: "lot", label: "Lot No.", type: "select", value: selectedLot, options: ["LOT-001", "LOT-002"], onChange: setSelectedLot, required: true },
    { key: "heat", label: "Heat No.", value: "HT-2025-001", disabled: true, note: "Auto-filled" },
    { key: "lotSize", label: "Size of Each Lot", value: lotSize, type: "number", required: true, onChange: (v) => setLotSize(+v) },
    { key: "qtyOff", label: "Total Qty Offered", value: lotSize, disabled: true },
    { key: "vendorQty", label: "Total Qty (Vendor Call)", value: poData.total_qty || 1200, disabled: true },
    { key: "bagsOff", label: "No. of Bags Offered", type: "number", required: true },
    { key: "sample", label: "Sample Size", value: aql.sampleSize, disabled: true },
    { key: "bagsSample", label: "Bags for Sampling", value: aql.bags, disabled: true },
    { key: "acc", label: "Acceptance Number", value: aql.acc, disabled: true },
    { key: "rej", label: "Rejection Number", value: aql.rej, disabled: true },
    { key: "cumm", label: "Cumulative Rejection Number", value: 0, disabled: true }
  ];

  /* -------------------- HELPERS -------------------- */
  const renderField = (f) => (
    <FormField key={f.key} label={f.label} required={f.required}>
      {f.type === "select" ? (
        <select className="fp-input" value={f.value} onChange={(e) => f.onChange(e.target.value)}>
          {f.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={f.type || "text"}
          className="fp-input"
          value={f.value || ""}
          disabled={f.disabled}
          placeholder={f.placeholder}
          onChange={(e) => f.onChange && f.onChange(e.target.value)}
        />
      )}
      {f.note && <p className="fp-note">{f.note}</p>}
    </FormField>
  );

  const addRange = () => setHologramRanges([...hologramRanges, { from: "", to: "" }]);
  const removeRange = (i) => setHologramRanges(hologramRanges.filter((_, idx) => idx !== i));
  const updateRange = (i, field, val) => {
    const copy = [...hologramRanges];
    copy[i][field] = val;
    setHologramRanges(copy);
  };

  const addSingle = () => setSingleHolograms([...singleHolograms, ""]);
  const removeSingle = (i) => setSingleHolograms(singleHolograms.filter((_, idx) => idx !== i));
  const updateSingle = (i, val) => {
    const copy = [...singleHolograms];
    copy[i] = val;
    setSingleHolograms(copy);
  };

  /* -------------------- MAIN JSX -------------------- */
  return (
    <div className="fp-container">
      
      {/* BREADCRUMB */}
      <div className="fp-breadcrumb">
        <span className="fp-link" onClick={onBack}>Landing Page</span> / Inspection Initiation / <b>ERC Final Product</b>
      </div>

      <h1 className="fp-title">ERC Final Product Inspection</h1>

      {/* STATIC INSPECTION DATA */}
      <div className="fp-card">
        <h2 className="fp-card-title">Inspection Details</h2>
        <div className="fp-grid">
          <FormField label="PO / Sub PO Number">
            <input className="fp-input" value={poData.sub_po_no || poData.po_no} disabled />
          </FormField>
          <FormField label="PO Date">
            <input className="fp-input" value={formatDate(poData.sub_po_date || poData.po_date)} disabled />
          </FormField>
          <FormField label="Contractor">
            <input className="fp-input" value={poData.contractor} disabled />
          </FormField>
          <FormField label="Manufacturer">
            <input className="fp-input" value={poData.manufacturer} disabled />
          </FormField>
        </div>
      </div>

      {/* PRE-INSPECTION FIELDS */}
      <div className="fp-card">
        <h2 className="fp-card-title">Pre-Inspection Data Entry</h2>
        <div className="fp-grid">
          {preFields.map(renderField)}
        </div>
      </div>

      {/* SUBMODULE GRID */}
      <div className="fp-submodule-section">
        <h2 className="fp-section-title">Sub Modules</h2>
        <div className="fp-submodule-grid">
          {SUBMODULES.map((m) => (
            <button key={m.key} className="fp-submodule-btn" onClick={() => onNavigateToSubModule(m.key)}>
              <span className="fp-submodule-icon">{m.icon}</span>
              <span className="fp-submodule-title">{m.title}</span>
              <span className="fp-submodule-desc">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FINAL INSPECTION RESULTS */}
      <div className="fp-card">
        <h2 className="fp-card-title">Final Inspection Results</h2>

        <div className="fp-grid">
          <FormField label="Lot No.">
            <select className="fp-input" value={selectedLot} onChange={(e) => setSelectedLot(e.target.value)}>
              <option>LOT-001</option>
              <option>LOT-002</option>
            </select>
          </FormField>

          <FormField label="Qty Offered">
            <input className="fp-input" value={lot.qtyOffered} disabled />
          </FormField>

          <FormField label="Qty Accepted">
            <input className="fp-input fp-success" value={lot.qtyAccepted} disabled />
          </FormField>

          <FormField label="Qty Rejected">
            <input className="fp-input fp-danger" value={lot.qtyRejected} disabled />
          </FormField>
        </div>

        {/* Packing Verification */}
        <div className="fp-box">
          <h3>Packing Verification</h3>
          <label className="fp-checkbox">
            <input type="checkbox" checked={hdpeBags} onChange={(e) => setHdpeBags(e.target.checked)} />
            Packed in double HDPE bags *
          </label>
          <label className="fp-checkbox">
            <input type="checkbox" checked={cleanedCoating} onChange={(e) => setCleanedCoating(e.target.checked)} />
            Cleaned & protected with coating *
          </label>
        </div>

        {/* Packing Numbers */}
        <div className="fp-grid">
          <FormField label="Standard Packing No.">
            <input className="fp-input" value={lot.stdPackingNo} disabled />
          </FormField>
          <FormField label="Bags with Std. Packing">
            <input className="fp-input" value={bagsWithStd} disabled />
          </FormField>
          <FormField label="Bags (Non-Std)" required>
            <input className="fp-input" value={bagsNonStdPacking} onChange={(e) => setBagsNonStdPacking(e.target.value)} />
          </FormField>
          <FormField label="ERC in each Non-Std Bag" required>
            <input className="fp-input" value={ercNonStdBag} onChange={(e) => setErcNonStdBag(e.target.value)} />
          </FormField>
        </div>

        {/* NOTE ON ERC TESTING */}
        <FormField label="Note on ERC used for Testing" required>
          <input className="fp-input" value={noteErcTesting} onChange={(e) => setNoteErcTesting(e.target.value)} />
        </FormField>

        {/* HOLOGRAM SECTION */}
        <div className="fp-box holo">
          <h3>Hologram Details</h3>

          <div className="fp-row">
            <label className="fp-radio">
              <input type="radio" checked={hologramType === "range"} onChange={() => setHologramType("range")} />
              Range (From - To)
            </label>
            <label className="fp-radio">
              <input type="radio" checked={hologramType === "single"} onChange={() => setHologramType("single")} />
              Single Hologram No.
            </label>
          </div>

          {hologramType === "range" && (
            <>
              {hologramRanges.map((r, idx) => (
                <div key={idx} className="fp-holo-row">
                  <input className="fp-input small" placeholder="From" value={r.from} onChange={(e) => updateRange(idx, "from", e.target.value)} />
                  <span>to</span>
                  <input className="fp-input small" placeholder="To" value={r.to} onChange={(e) => updateRange(idx, "to", e.target.value)} />
                  {hologramRanges.length > 1 && (
                    <button className="fp-btn-danger" onClick={() => removeRange(idx)}>✕</button>
                  )}
                </div>
              ))}
              <button className="fp-btn-primary small" onClick={addRange}>+ Add Range</button>
            </>
          )}

          {hologramType === "single" && (
            <>
              {singleHolograms.map((s, idx) => (
                <div key={idx} className="fp-holo-row">
                  <input className="fp-input medium" placeholder="Hologram No." value={s} onChange={(e) => updateSingle(idx, e.target.value)} />
                  {singleHolograms.length > 1 && (
                    <button className="fp-btn-danger" onClick={() => removeSingle(idx)}>✕</button>
                  )}
                </div>
              ))}
              <button className="fp-btn-primary small" onClick={addSingle}>+ Add Hologram</button>
            </>
          )}
        </div>

        {/* REMARKS */}
        <FormField label="Remarks" required>
          <textarea className="fp-textarea" rows={3} value={finalRemarks} onChange={(e) => setFinalRemarks(e.target.value)} />
        </FormField>

        {/* ACTION BUTTONS */}
        <div className="fp-actions">
          <button className="btn btn-outline">Save Draft</button>
          <button className="btn btn-primary">Submit & Generate IC</button>
        </div>
      </div>

      {/* RETURN */}
      <button className="btn btn-secondary fp-return" onClick={onBack}>
        Return to Landing Page
      </button>
    </div>
  );
}
