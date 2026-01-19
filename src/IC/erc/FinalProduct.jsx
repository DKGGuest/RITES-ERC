// src/IC/erc/FinalProductCertificate.jsx

import { useRef } from "react";
import ErcFinalIc from "./ErcFinalIc";
import { exportToPdf } from "../../utils/exportUtils";

/**
 * FINAL PRODUCT CERTIFICATE (Wrapper)
 * Shows EMPTY layout by default and renders API data when provided.
 *
 * - NO mock data
 * - NO default values
 * - Layout NEVER changes
 * - API integration becomes trivial
 */
export default function FinalProductCertificate({ call = {}, onBack }) {
  const printAreaRef = useRef();

  /**
   * Transform API response to component format.
   * KEEP IT MINIMAL: Do NOT insert default values.
   */
  const transformCallToIC = (c) => {
    if (!c || Object.keys(c).length === 0) return {};

    return {
      certificateNo: c.certificateNo || "",
      certificateDate: c.certificateDate || "",
      offeredInstNo: c.offeredInstNo || "",
      passedInstNo: c.passedInstNo || "",
      contractor: c.contractor || "",
      placeOfInspection: c.placeOfInspection || "",
      contractRef: c.contractRef || "",
      contractRefDate: c.contractRefDate || "",
      billPayingOfficer: c.billPayingOfficer || "",
      consignee: c.consignee || "",
      purchasingAuthority: c.purchasingAuthority || "",
      description: c.description || "",
      quantityNowPassedText: c.quantityNowPassedText || "",
      qtyOnOrder: c.qtyOnOrder || "",
      qtyOfferedPreviously: c.qtyOfferedPreviously || "",
      qtyPassedPreviously: c.qtyPassedPreviously || "",
      qtyNowOffered: c.qtyNowOffered || "",
      qtyNowPassed: c.qtyNowPassed || "",
      qtyNowRejected: c.qtyNowRejected || "",
      qtyStillDue: c.qtyStillDue || "",
      noOfItemsChecked: c.noOfItemsChecked || "",
      dateOfCall: c.dateOfCall || "",
      noOfVisits: c.noOfVisits || "",
      datesOfInspection: c.datesOfInspection || "",
      trRecDate: c.trRecDate || "",
      sealingPattern: c.sealingPattern || "",
      facsimileText: c.facsimileText || "",
      reasonsForRejection: c.reasonsForRejection || "Not Applicable",
      inspectingEngineer: c.inspectingEngineer || "",
    };
  };

  // FINAL DATA: empty layout OR API populated
  const data = transformCallToIC(call);

  const handleExport = async () => {
    if (!printAreaRef.current) return;

    // Use certificate number as filename, fallback to default if not available
    const certificateNo = data.certificateNo || "FinalProductIC";
    // Sanitize filename: remove special characters that are invalid in filenames
    const sanitizedFilename = certificateNo.replace(/[/\\?%*:|"<>]/g, '-');

    await exportToPdf(printAreaRef.current, `${sanitizedFilename}.pdf`);
  };

  return (
    <div style={{ padding: 18 }}>
      {/* Top Buttons - Hidden during print */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={onBack} className="btn btn-outline">← Back</button>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.print()} className="btn btn-outline">Print</button>
          <button onClick={handleExport} className="btn btn-primary">Export PDF</button>
        </div>
      </div>

      {/* Printable content - Wrapped for proper print isolation */}
      <div className="certificate-print-wrapper" ref={printAreaRef}>
        <div className="certificate-page">
          <ErcFinalIc data={data} />
        </div>
      </div>
    </div>
  );
}

