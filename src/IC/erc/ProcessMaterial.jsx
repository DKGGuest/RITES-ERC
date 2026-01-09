// src/IC/erc/ProcessMaterialCertificate.jsx

import { useRef } from "react";
import ErcProcessIC from "./ErcProcessIc";
import { exportToPdf } from "../../utils/exportUtils";

const ProcessMaterialCertificate = ({ call }) => {
  const printAreaRef = useRef(null);

  const transformCallToIC = (c) => {
    if (!c || Object.keys(c).length === 0) return {};

    return {
      certificateNo: c.icNo || "",
      certificateDate: c.inspectionDate || "",
      offeredInstNo: c.offeredInstNo || "",
      passedInstNo: c.passedInstNo || "",

      contractor: c.contractor || c.vendorName || c.vendor_name || "",
      manufacturer: c.manufacturer || "",
      contractRef: c.contractRef || "",
      poDetails: c.poDetails || c.contractorPo || c.poNo || c.po_no || "",
      billPayingOfficer: c.billPayingOfficer || c.billOfficer || "",
      consigneeRailway: c.consigneeRailway || c.consignee || "",
      consigneeManufacturer: c.consigneeManufacturer || c.consigneeFinished || "",
      purchasingAuthority: c.purchasingAuthority || "",

      description: c.productDescription || c.productType || "",
      drgNo: c.drgNo || "",
      specNo: c.specNo || "",
      qapNo: c.qapNo || "",
      inspectionType: c.inspectionType || "",

      lots: c.lots || [],
      reference: c.reference || "",
      callDate: c.callDate || c.dateOfCall || "",
      inspectionDate: c.inspectionDate || c.dateOfInspection || "",
      manDays: c.manDays || "",
      sealingPattern: c.sealingPattern || "",
      inspectingEngineer: c.inspectingEngineer || ""
    };
  };

  // FINAL DATA: empty layout OR API populated
  const data = call ? transformCallToIC(call) : {};

  const handlePrint = () => {
    if (printAreaRef.current) {
      window.print();
    }
  };

  const handleExportPdf = async () => {
    if (printAreaRef.current) {
      await exportToPdf(printAreaRef.current, `Process_IC_${data.certificateNo || "Certificate"}.pdf`);
    }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>
        <button
          onClick={handlePrint}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Print
        </button>
        <button
          onClick={handleExportPdf}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Export PDF
        </button>
      </div>

      <div ref={printAreaRef}>
        <ErcProcessIC data={data} />
      </div>
    </div>
  );
};

export default ProcessMaterialCertificate;

