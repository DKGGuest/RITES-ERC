import { useState, useMemo } from "react";
import FormField from "../components/FormField";
import { MOCK_PO_DATA } from "../data/mockData";
import { formatDate } from "../utils/helpers";
import "./FinalProductDashboard.css";

export default function FinalProductDashboard({ onBack, onNavigateToSubModule }) {
  const poData = MOCK_PO_DATA["PO-2025-1001"];

  /* -------------------- IS 2500 AQL LOGIC -------------------- */

  /* Table 2 - Double Sampling for Dimension & Weight AQL 2.5
   * Returns 1st SAMPLE (n1) based on Lot Size Range
   * For lots 2-150: Double sampling not provided → use single sampling
   */
  const calculateSampleSize = (lotSz) => {
    if (lotSz <= 0) return 0;
    /* 2-150: Double sampling not provided, use single sampling (Table 1) */
    if (lotSz <= 8) return 2;
    if (lotSz <= 15) return 3;
    if (lotSz <= 25) return 5;
    if (lotSz <= 50) return 8;
    if (lotSz <= 90) return 13;
    if (lotSz <= 150) return 20;
    /* 151+ : Use Table 2 - 1st SAMPLE (n1) */
    if (lotSz <= 280) return 20;    /* 151-280 → n1=20 */
    if (lotSz <= 500) return 32;    /* 281-500 → n1=32 */
    if (lotSz <= 1200) return 50;   /* 501-1200 → n1=50 */
    if (lotSz <= 3200) return 80;   /* 1201-3200 → n1=80 */
    if (lotSz <= 10000) return 125; /* 3201-10000 → n1=125 */
    if (lotSz <= 35000) return 200; /* 10001-35000 → n1=200 */
    if (lotSz <= 150000) return 315;/* 35001-150000 → n1=315 */
    if (lotSz <= 500000) return 500;/* 150001-500000 → n1=500 */
    return 500;
  };

  /* Table 1 - Sample Size for Bags for Sampling calculation */
  const calculateBagsForSampling = (totalSampleSize) => {
    if (totalSampleSize <= 0) return 0;
    if (totalSampleSize <= 8) return 2;
    if (totalSampleSize <= 15) return 3;
    if (totalSampleSize <= 25) return 5;
    if (totalSampleSize <= 50) return 8;
    if (totalSampleSize <= 90) return 13;
    if (totalSampleSize <= 150) return 20;
    if (totalSampleSize <= 280) return 32;
    if (totalSampleSize <= 500) return 50;
    if (totalSampleSize <= 1200) return 80;
    if (totalSampleSize <= 3200) return 125;
    if (totalSampleSize <= 10000) return 200;
    if (totalSampleSize <= 35000) return 315;
    if (totalSampleSize <= 150000) return 500;
    if (totalSampleSize <= 500000) return 800;
    return 1250;
  };

  /* -------------------- LOTS DATA (Auto-fetched from Vendor Call) -------------------- */
  const lotsFromVendorCall = [
    { lotNo: "LOT-001", heatNo: "HT-2025-001", lotSize: 500 },
    { lotNo: "LOT-002", heatNo: "HT-2025-002", lotSize: 800 },
    { lotNo: "LOT-003", heatNo: "HT-2025-003", lotSize: 1200 }
  ];

  /* Calculate Sample Size for each lot based on Lot Size (IS 2500 Table 2) */
  const lotsWithSampling = lotsFromVendorCall.map((lot) => {
    const sampleSize = calculateSampleSize(lot.lotSize);
    return { ...lot, sampleSize };
  });

  /* Calculate totals */
  const totalQtyOffered = lotsWithSampling.reduce((sum, l) => sum + (l.lotSize || 0), 0);
  const totalSampleSize = lotsWithSampling.reduce((sum, l) => sum + (l.sampleSize || 0), 0);
  const bagsForSampling = calculateBagsForSampling(totalSampleSize);

  /* No. of Bags Offered - Auto-fetched from Vendor Call */
  const bagsOffered = lotsFromVendorCall.length > 0 ? lotsFromVendorCall.reduce((sum, lot) => sum + Math.ceil(lot.lotSize / 50), 0) : 0;

  /* -------------------- FINAL INSPECTION RESULTS DATA -------------------- */
  /*
    Mock test results per lot - In real app, this will be fetched from all test modules
    If any test is rejected, the whole lot is rejected
  */
  const testResultsPerLot = useMemo(() => ({
    "LOT-001": {
      visualDim: "OK", hardness: "OK", inclusion: "OK", deflection: "OK",
      toeLoad: "OK", weight: "OK", chemical: "OK"
    },
    "LOT-002": {
      visualDim: "OK", hardness: "OK", inclusion: "NOT OK", deflection: "OK",
      toeLoad: "OK", weight: "OK", chemical: "OK"
    },
    "LOT-003": {
      visualDim: "OK", hardness: "OK", inclusion: "OK", deflection: "OK",
      toeLoad: "OK", weight: "OK", chemical: "OK"
    }
  }), []);

  /* State for each lot's final inspection data */
  const [lotInspectionData, setLotInspectionData] = useState(() => {
    const initial = {};
    lotsFromVendorCall.forEach(lot => {
      initial[lot.lotNo] = {
        stdPackingNo: 50,
        bagsStdPacking: '',
        nonStdBagsCount: 0,
        nonStdBagsQty: [],
        holograms: [{ type: 'range', from: '', to: '' }],
        remarks: '',
        ercUsedForTesting: ''
      };
    });
    return initial;
  });

  /* Check if lot is rejected (any test NOT OK) */
  const isLotRejected = (lotNo) => {
    const tests = testResultsPerLot[lotNo];
    if (!tests) return false;
    return Object.values(tests).some(v => v === 'NOT OK');
  };

  /* Packing verification checkboxes */
  const [packedInHDPE, setPackedInHDPE] = useState(false);
  const [cleanedWithCoating, setCleanedWithCoating] = useState(false);

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

  /* -------------------- LOT DATA UPDATE HANDLERS -------------------- */
  const updateLotData = (lotNo, field, value) => {
    setLotInspectionData(prev => ({
      ...prev,
      [lotNo]: { ...prev[lotNo], [field]: value }
    }));
  };

  const updateNonStdBagsCount = (lotNo, count) => {
    const num = parseInt(count) || 0;
    setLotInspectionData(prev => ({
      ...prev,
      [lotNo]: {
        ...prev[lotNo],
        nonStdBagsCount: num,
        nonStdBagsQty: Array(num).fill('').slice(0, num)
      }
    }));
  };

  const updateNonStdBagQty = (lotNo, idx, value) => {
    setLotInspectionData(prev => {
      const arr = [...prev[lotNo].nonStdBagsQty];
      arr[idx] = value;
      return { ...prev, [lotNo]: { ...prev[lotNo], nonStdBagsQty: arr } };
    });
  };

  /* -------------------- HOLOGRAM HANDLERS -------------------- */
  const addHologram = (lotNo, type) => {
    setLotInspectionData(prev => ({
      ...prev,
      [lotNo]: {
        ...prev[lotNo],
        holograms: [...prev[lotNo].holograms, type === 'range' ? { type: 'range', from: '', to: '' } : { type: 'single', value: '' }]
      }
    }));
  };

  const removeHologram = (lotNo, idx) => {
    setLotInspectionData(prev => ({
      ...prev,
      [lotNo]: {
        ...prev[lotNo],
        holograms: prev[lotNo].holograms.filter((_, i) => i !== idx)
      }
    }));
  };

  const updateHologram = (lotNo, idx, field, value) => {
    setLotInspectionData(prev => {
      const arr = [...prev[lotNo].holograms];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [lotNo]: { ...prev[lotNo], holograms: arr } };
    });
  };

  /* -------------------- MAIN JSX -------------------- */
  return (
    <div className="fp-container">
      {/* BREADCRUMB */}
      <div className="fp-breadcrumb">
        <span className="fp-link" onClick={onBack}>
          Landing Page
        </span>{" "}
        / Inspection Initiation / <b>ERC Final Product</b>
      </div>

      <h1 className="fp-title">ERC Final Product Inspection</h1>

      {/* STATIC INSPECTION DATA */}
      <div className="fp-card">
        <h2 className="fp-card-title">Inspection Details</h2>
        <div className="fp-grid">
          <FormField label="PO Number">
            <input
              className="fp-input"
              value={poData.sub_po_no || poData.po_no}
              disabled
            />
          </FormField>
          <FormField label="PO Date">
            <input
              className="fp-input"
              value={formatDate(poData.sub_po_date || poData.po_date)}
              disabled
            />
          </FormField>
          <FormField label="Contractor">
            <input className="fp-input" value={poData.contractor} disabled />
          </FormField>
          <FormField label="Manufacturer">
            <input className="fp-input" value={poData.manufacturer} disabled />
          </FormField>
        </div>
      </div>

      {/* PRE-INSPECTION DATA ENTRY */}
      <div className="fp-card">
        <h2 className="fp-card-title">Pre-Inspection Data Entry</h2>
        {/* <p className="fp-card-subtitle">
          Lots auto-fetched from Vendor Call (Lot No., Heat No. &amp; Lot Size
          from Process IC). Sample size and AQL limits are auto calculated as
          per IS 2500.
        </p> */}

        {/* Lot-wise info table - Acc/Rej/Cumm will be in respective submodules */}
        <div className="fp-lots-table-wrapper">
          <table className="fp-lots-table">
            <thead>
              <tr>
                <th>Lot No.</th>
                <th>Heat No.</th>
                <th>Lot Size</th>
                <th>Sample Size</th>
              </tr>
            </thead>
            <tbody>
              {lotsWithSampling.map((lotRow) => (
                <tr key={lotRow.lotNo}>
                  <td className="fp-lot-cell">{lotRow.lotNo}</td>
                  <td className="fp-lot-cell">{lotRow.heatNo}</td>
                  <td className="fp-lot-cell">{lotRow.lotSize}</td>
                  <td className="fp-lot-cell">{lotRow.sampleSize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Row */}
        <div className="fp-summary-row fp-summary-4col">
          <FormField label="Total Qty Offered">
            <input className="fp-input" value={totalQtyOffered || "-"} disabled />
          </FormField>

          <FormField label="Total Sample Size">
            <input className="fp-input" value={totalSampleSize || "-"} disabled />
          </FormField>

          <FormField label="No. of Bags Offered">
            <input
              type="number"
              className="fp-input"
              value={bagsOffered || "-"}
              disabled
            />
          </FormField>

          <FormField label="Bags for Sampling">
            <input className="fp-input" value={bagsForSampling || "-"} disabled />
          </FormField>
        </div>
      </div>

      {/* SUBMODULE GRID */}
      <div className="fp-submodule-section">
        <h2 className="fp-section-title">Sub Modules</h2>
        <div className="fp-submodule-grid">
          {SUBMODULES.map((m) => (
            <button
              key={m.key}
              className="fp-submodule-btn"
              onClick={() => onNavigateToSubModule(m.key)}
            >
              <span className="fp-submodule-icon">{m.icon}</span>
              <span className="fp-submodule-title">{m.title}</span>
              <span className="fp-submodule-desc">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PACKING VERIFICATION CHECKBOXES */}
      <div className="fp-card">
        <h2 className="fp-card-title">Packing Verification</h2>
        <div className="fp-checkbox-group">
          <label className="fp-checkbox-item">
            <input
              type="checkbox"
              checked={packedInHDPE}
              onChange={(e) => setPackedInHDPE(e.target.checked)}
            />
            <span>Packed in double HDPE Bags</span>
          </label>
          <label className="fp-checkbox-item">
            <input
              type="checkbox"
              checked={cleanedWithCoating}
              onChange={(e) => setCleanedWithCoating(e.target.checked)}
            />
            <span>Cleaned & protected with coating</span>
          </label>
        </div>
      </div>

      {/* FINAL INSPECTION RESULTS - Each Lot Displayed Separately */}
      <div className="fp-card">
        <h2 className="fp-card-title">Final Inspection Results</h2>

        {lotsWithSampling.map(lot => {
          const data = lotInspectionData[lot.lotNo];
          const rejected = isLotRejected(lot.lotNo);
          const tests = testResultsPerLot[lot.lotNo];
          const bagsStdCount = Math.ceil(lot.lotSize / data.stdPackingNo);

          return (
            <div
              key={lot.lotNo}
              className="fp-lot-result-block"
              style={{
                background: rejected ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${rejected ? '#fecaca' : '#bbf7d0'}`,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}
            >
              {/* Lot Header with Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>
                  📦 {lot.lotNo} | Heat: {lot.heatNo} | Qty: {lot.lotSize}
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '12px',
                  background: rejected ? '#fee2e2' : '#dcfce7',
                  color: rejected ? '#991b1b' : '#166534'
                }}>
                  {rejected ? '✗ LOT REJECTED' : '✓ LOT ACCEPTED'}
                </span>
              </div>

              {/* Test Results Summary */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {Object.entries(tests).map(([test, status]) => (
                  <span key={test} style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    background: status === 'OK' ? '#dcfce7' : '#fee2e2',
                    color: status === 'OK' ? '#166534' : '#991b1b'
                  }}>
                    {test}: {status}
                  </span>
                ))}
              </div>

              {/* Packing Info Grid */}
              <div className="fp-grid" style={{ marginBottom: '12px' }}>
                <FormField label="No. of ERC used for Testing">
                  <input
                    className="fp-input"
                    type="number"
                    min="0"
                    value={data.ercUsedForTesting}
                    onChange={(e) => updateLotData(lot.lotNo, 'ercUsedForTesting', e.target.value)}
                    placeholder="Enter count"
                    style={{ fontSize: '12px', padding: '6px' }}
                  />
                </FormField>
                <FormField label="Std. Packing No.">
                  <input className="fp-input" value={data.stdPackingNo} disabled style={{ fontSize: '12px', padding: '6px' }} />
                </FormField>
                <FormField label="Bags with Std. Packing">
                  <input
                    className="fp-input"
                    type="number"
                    value={data.bagsStdPacking || bagsStdCount}
                    onChange={(e) => updateLotData(lot.lotNo, 'bagsStdPacking', e.target.value)}
                    style={{ fontSize: '12px', padding: '6px' }}
                  />
                </FormField>
                <FormField label="Non-Std Bags Count">
                  <input
                    className="fp-input"
                    type="number"
                    min="0"
                    value={data.nonStdBagsCount}
                    onChange={(e) => updateNonStdBagsCount(lot.lotNo, e.target.value)}
                    style={{ fontSize: '12px', padding: '6px' }}
                  />
                </FormField>
              </div>

              {/* Non-Std Bags Qty Inputs */}
              {data.nonStdBagsCount > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Qty in Each Non-Std Bag ({data.nonStdBagsCount} bags)
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {Array.from({ length: data.nonStdBagsCount }).map((_, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '9px', color: '#64748b' }}>Bag {idx + 1}</span>
                        <input
                          type="number"
                          className="fp-input"
                          value={data.nonStdBagsQty[idx] || ''}
                          onChange={(e) => updateNonStdBagQty(lot.lotNo, idx, e.target.value)}
                          style={{ width: '60px', fontSize: '11px', padding: '4px', textAlign: 'center' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hologram Section */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                    Hologram Details
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="fp-btn-sm"
                      onClick={() => addHologram(lot.lotNo, 'range')}
                    >
                      + Range
                    </button>
                    <button
                      type="button"
                      className="fp-btn-sm"
                      onClick={() => addHologram(lot.lotNo, 'single')}
                    >
                      + Single
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {data.holograms.map((holo, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', width: '50px' }}>
                        {holo.type === 'range' ? 'Range:' : 'Single:'}
                      </span>
                      {holo.type === 'range' ? (
                        <>
                          <input
                            className="fp-input"
                            placeholder="From"
                            value={holo.from || ''}
                            onChange={(e) => updateHologram(lot.lotNo, idx, 'from', e.target.value)}
                            style={{ width: '80px', fontSize: '11px', padding: '4px' }}
                          />
                          <span style={{ fontSize: '10px' }}>to</span>
                          <input
                            className="fp-input"
                            placeholder="To"
                            value={holo.to || ''}
                            onChange={(e) => updateHologram(lot.lotNo, idx, 'to', e.target.value)}
                            style={{ width: '80px', fontSize: '11px', padding: '4px' }}
                          />
                        </>
                      ) : (
                        <input
                          className="fp-input"
                          placeholder="Hologram No."
                          value={holo.value || ''}
                          onChange={(e) => updateHologram(lot.lotNo, idx, 'value', e.target.value)}
                          style={{ width: '120px', fontSize: '11px', padding: '4px' }}
                        />
                      )}
                      {data.holograms.length > 1 && (
                        <button
                          type="button"
                          className="fp-btn-danger-sm"
                          onClick={() => removeHologram(lot.lotNo, idx)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Remarks
                </label>
                <textarea
                  rows="1"
                  className="fp-textarea"
                  value={data.remarks}
                  onChange={(e) => updateLotData(lot.lotNo, 'remarks', e.target.value)}
                  placeholder="Enter remarks..."
                  style={{ fontSize: '11px', padding: '6px' }}
                />
              </div>
            </div>
          );
        })}
        
      {/* CUMULATIVE RESULTS SECTION */}
      <div className="fp-card">
        <h2 className="fp-card-title">Cumulative Results</h2>
        <div className="fp-cumulative-grid">
          <FormField label="1. Quantity on Order (PO Qty)">
            <input className="fp-input" value={poData.po_qty || 10000} disabled />
          </FormField>
          <FormField label="2. Cumm. Qty Offered Previously">
            <input className="fp-input" value={poData.cummQtyOfferedPreviously || 2500} disabled />
          </FormField>
          <FormField label="3. Cumm. Qty Passed Previously">
            <input className="fp-input" value={poData.cummQtyPassedPreviously || 2400} disabled />
          </FormField>
          <FormField label="4. Qty Now Offered">
            <input className="fp-input" value={totalQtyOffered} disabled />
          </FormField>
          <FormField label="5. Qty Now Passed">
            <input
              className="fp-input"
              value={(() => {
                const ercUsed = lotsWithSampling.reduce((sum, lot) => sum + (parseInt(lotInspectionData[lot.lotNo]?.ercUsedForTesting) || 0), 0);
                const qtyRejected = lotsWithSampling.filter(lot => isLotRejected(lot.lotNo)).reduce((sum, lot) => sum + lot.lotSize, 0);
                return totalQtyOffered - ercUsed - qtyRejected;
              })()}
              disabled
            />
          </FormField>
          <FormField label="6. Qty Now Rejected">
            <input
              className="fp-input"
              value={lotsWithSampling.filter(lot => isLotRejected(lot.lotNo)).reduce((sum, lot) => sum + lot.lotSize, 0)}
              disabled
            />
          </FormField>
          <FormField label="7. Qty Still Due">
            <input
              className="fp-input"
              value={(() => {
                const poQty = poData.po_qty || 10000;
                const cummPassed = poData.cummQtyPassedPreviously || 2400;
                const ercUsed = lotsWithSampling.reduce((sum, lot) => sum + (parseInt(lotInspectionData[lot.lotNo]?.ercUsedForTesting) || 0), 0);
                const qtyRejected = lotsWithSampling.filter(lot => isLotRejected(lot.lotNo)).reduce((sum, lot) => sum + lot.lotSize, 0);
                const qtyNowPassed = totalQtyOffered - ercUsed - qtyRejected;
                return poQty - cummPassed - qtyNowPassed;
              })()}
              disabled
            />
          </FormField>
        </div>
      </div>

        {/* ACTION BUTTONS */}
        <div className="fp-actions">
          <button className="btn btn-outline">Save Draft</button>
          <button className="btn btn-outline">Pause Inspection</button>
          <button className="btn btn-outline">Withheld Inspection</button>
          <button className="btn btn-primary">Finish Inspection</button>
        </div>
      </div>


      {/* RETURN */}
      <button className="btn btn-secondary fp-return" onClick={onBack}>
        Return to Landing Page
      </button>
    </div>
  );
}
