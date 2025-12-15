// src/IC/erc/RawMaterialCertificate.jsx

import React, { useRef } from "react";
import RawMaterialPreview from "./RawMaterialPreview";
import { exportToPdf } from "../../utils/exportUtils";

/**
 * RAW MATERIAL CERTIFICATE (Wrapper)
 * Shows EMPTY layout by default and renders API data when provided.
 *
 * - NO mock data
 * - NO default values
 * - Layout NEVER changes
 * - API integration becomes trivial
 */
export default function RawMaterialCertificate({ call = {}, onBack }) {
  const printAreaRef = useRef();

  /** 
   * Transform API response to component format.
   * KEEP IT MINIMAL: Do NOT insert default values.
   */
  const transformCallToIC = (c) => {
    if (!c || Object.keys(c).length === 0) return {};

    return {
      certificateNo: c.icNo || "",
      date: c.inspectionDate || "",
      offeredInstNo: c.offeredInstNo || "",
      passedInstNo: c.passedInstNo || "",

      contractor: c.vendorName || "",
      manufacturer: c.manufacturer || "",
      placeOfInspection: c.inspectionPlace || "",
      contractRef: c.contractRef || "",
      poNoContractor: c.poNo || "",
      billPayingOfficer: c.billOfficer || "",
      consigneeRailway: c.consignee || "",
      purchasingAuthority: c.purchasingAuthority || "",
      consigneeManufacturer: c.consigneeFinished || "",

      description: c.productDescription || c.productType || "",
      drgNo: c.drgNo || "",
      specNo: c.specNo || "",
      qapNo: c.qapNo || "",
      detailsOfInspection: c.detailsOfInspection || "",
      chpClause: c.chpClause || "",
      contractChpReq: c.contractChpReq || "",

      result: c.result || "",
      qtyCleared: c.qtyCleared || "",
      qtyRejected: c.qtyRejected || "",

      remarks: c.remarks || "",
      dateOfCall: c.dateOfCall || "",
      noOfVisits: c.noOfVisits || "",
      dateOfInspection: c.dateOfInspection || "",
      sealingPattern: c.sealingPattern || "",
      facsimile: c.facsimile || "",
      inspectingEngineer: c.inspectingEngineer || ""
    };
  };

  // FINAL DATA: empty layout OR API populated
  const data = transformCallToIC(call);

  const handleExport = async () => {
    if (!printAreaRef.current) return;
    await exportToPdf(printAreaRef.current, "RawMaterialIC.pdf");
  };

  return (
    <div style={{ padding: 18 }}>
      {/* Top Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={onBack} className="btn btn-outline">← Back</button>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.print()} className="btn btn-outline">Print</button>
          <button onClick={handleExport} className="btn btn-primary">Export PDF</button>
        </div>
      </div>

      {/* Printable content */}
      <div ref={printAreaRef}>
        <RawMaterialPreview data={data} />
      </div>
    </div>
  );
}
