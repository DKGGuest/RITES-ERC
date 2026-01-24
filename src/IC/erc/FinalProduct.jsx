// src/IC/erc/FinalProductCertificate.jsx

import { useRef, useState } from "react";
import ErcFinalIc from "./ErcFinalIc";
import { exportToPdf } from "../../utils/exportUtils";

/**
 * FINAL PRODUCT CERTIFICATE (Wrapper)
 * Displays blank certificate with certificate number and date.
 * All fields are editable.
 *
 * - NO API calls
 * - Editable fields
 * - Print and Export functionality
 */
export default function FinalProductCertificate({ call = {}, onBack }) {
  const printAreaRef = useRef();
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState({
    certificateNo: call.icNo || "",
    certificateDate: new Date().toLocaleDateString('en-GB'),
    offeredInstNo: "",
    passedInstNo: "",
    contractor: "",
    placeOfInspection: "",
    contractRef: "",
    contractRefDate: "",
    billPayingOfficer: "",
    consignee: "",
    purchasingAuthority: "",
    description: "",
    quantityNowPassedText: "",
    qtyOnOrder: "",
    qtyOfferedPreviously: "",
    qtyPassedPreviously: "",
    qtyNowOffered: "",
    qtyNowPassed: "",
    qtyNowRejected: "",
    qtyStillDue: "",
    noOfItemsChecked: "",
    dateOfCall: "",
    noOfVisits: "",
    datesOfInspection: "",
    trRecDate: "",
    sealingPattern: "",
    facsimileText: "",
    reasonsForRejection: "Not Applicable",
    inspectingEngineer: "",
    lotDetails: [],
    remarks: "",
  });

  // Handle field changes when editing
  const handleFieldChange = (fieldName, value) => {
    setData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

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
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? "btn btn-primary" : "btn btn-outline"}
          >
            {isEditing ? "✓ Done Editing" : "✎ Edit"}
          </button>
          <button onClick={() => window.print()} className="btn btn-outline">Print</button>
          <button onClick={handleExport} className="btn btn-primary">Export PDF</button>
        </div>
      </div>

      {/* Edit Mode Info */}
      {isEditing && (
        <div className="no-print" style={{ padding: 12, backgroundColor: "#fff3cd", borderRadius: 4, marginBottom: 12 }}>
          <p style={{ margin: 0, color: "#856404" }}>✎ Edit mode enabled - Click fields to edit certificate data</p>
        </div>
      )}

      {/* Printable content - Wrapped for proper print isolation */}
      <div className="certificate-print-wrapper" ref={printAreaRef}>
        <div className="certificate-page">
          <ErcFinalIc data={data} isEditing={isEditing} onFieldChange={handleFieldChange} />
        </div>
      </div>
    </div>
  );
}

