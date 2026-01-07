// src/IC/erc/ProcessMaterial.jsx
import { useRef } from "react";
import ProcessMaterialPreview from "./ProcessMaterialPreview";
import { exportToPdf } from "../../utils/exportUtils";

/**
 * Wrapper page for Process Material IC.
 * Expects `call` prop (object). If absent, uses mock data for testing.
 */
export default function ProcessMaterialCertificate({ call, onBack }) {
  const printAreaRef = useRef();

  const mockData = {
    certificateNo: "W/WCR/W25010306/BDS",
    date: "06.04.2025",
    offeredInstNo: "1ST",
    passedInstNo: "1ST & Part",
    contractor: "M/s SAI KRIPA INDUSTRIES –DURG\nNear Pawan Kirana Stores, House No. 606, Sangram Chowk,\nSikola Bhata, Durg, Chhattisgarh, India, 491001",
    manufacturer: "M/s SAI KRIPA INDUSTRIES –DURG\nNear Pawan Kirana Stores, House No. 606, Sangram Chowk,\nSikola Bhata, Durg, Chhattisgarh, India, 491001",
    placeOfInspection: "Sikola Bhata, Durg, Chhattisgarh, India, 491001",
    contractRef: "RB L. No. 2024/RS(G)/779/12(E3482675)__Dt. 06.01.2025\nRB L. No. 2024/RS(G)/779/12(E3482675)__Dt. 27.01.2025\nRB L. No. 2022/RS(G)/779/9(E3393387)__ Dt. 31.07.2023",
    poNoContractor: "8124585110/2020\t\t\tDt. 16.11.2024\nM.A No. 000299\t\t\tDt. 29.01.2025\nM.A No. 000302\t\t\tDt. 29.01.2025\nM.A No. 001291\t\t\tDt. 23.04.2025",
    billPayingOfficer: "FA & CAO/WCR/JBP (A1003) -\nIPAS AU Code: 3601-WCR",
    consigneeRailway: "AEP/WAY/KURJ",
    purchasingAuthority: "DY. CMM(S)/WCR, CORE BUILDING, FIRST FLOOR,\nINDIRA MARKET, JABALPUR-482001",
    consigneeManufacturer: "M/s SAI KRIPA INDUSTRIES –DURG",
    description: "Manufacture and supply of Elastic Rail Clip MK-V with Flat Toe for 60 KG UIC/52 KG Rail section (Alt-2) KDSs Drg No. T-3919 and as per Corrigendum No.1 of IRS Specification No. T-31-2021 (Fifth Revision) with latest amendments upto one month before date of opening of tender.",
    drgNo: "IRS T-31-2021",
    specNo: "RAILWAY BOARD's Letter No. 2024/RS(G)/779/12(E3482675), Dt. 06.01.2025",
    qapNo: "Clause 4.11.2 & 4.11.3 of QAP",
    chpClause: "4.11.2",
    contractChpReq: "As per contract",
    detailsOfInspection: "Checking Length of Coil Bar, Turning Length/ MF Checking of Coil Quenching Temp. & Duration Quenching Hardness Tempering Temp. & Duration Quenching Hardness Tempering",
    typeOfInspection: "Checking Length of Coil Bar, Turning Length/ MFI Test/Checking of Die/Quenching Temp. & Duration/Quenching Hardness/ Tempering Temperature & Duration/Dimensional Check/Hardness of Finished ERC/ Documentation.",
    result: "CONFORMS",
    qtyCleared: "34842",
    qtyRejected: "142",
    remarks: "LOT FOUND ACCEPTABLE AND CLEARED FOR MANUFACTURING OF ERC MK-III",
    dateOfCall: "8/03/2025",
    noOfVisits: "ONE",
    dateOfInspection: "06/04/2025",
    sealingPattern: "IT IS PACKED IN GUNNY BAG HAVING METAL TAG SHEET HOLOGRAM FROM SL. NO. W-0809613 TO W-0809618 AFFIXED WITH TAPE ON LEAD SEAL OR ON TAG OF EACH BUNDLE. PIPE LINE FOR PROCESS INSPECTION OF ERC AT FIRM PREMISES.",
    inspectingEngineer: "R. KUMAR",
    totalQtyMfgStage: "35000",
    reference: "Raw Material STAGE IC No. W25010306, Dt. 19.03.2025 (Specn. No.: 2047/2025)"
  };

  const transformCallToIC = (callData) => {
    if (!callData) return {};

    return {
      certificateNo: callData.icNo || "W/WCR/W25010306/BDS",
      date: callData.inspectionDate || "",
      offeredInstNo: "1ST",
      passedInstNo: "1ST & FINAL",

      contractor: callData.vendorName || "",
      manufacturer: callData.manufacturer || callData.vendorName || "",
      placeOfInspection: callData.inspectionPlace || "",
      contractRef: callData.contractRef || "",
      poNoContractor: callData.poNo || "",
      billPayingOfficer: callData.billOfficer || "",
      consigneeRailway: callData.consignee || "",
      purchasingAuthority: callData.purchasingAuthority || "",
      consigneeManufacturer: callData.consigneeFinished || "",

      description: callData.description || "",
      drgNo: callData.drawingNo || "—",
      specNo: callData.specNo || "",
      qapNo: callData.qapNo || "",

      chpClause: callData.chpClause || "",
      contractChpReq: callData.contractChpReq || "As per contract",
      detailsOfInspection: callData.inspectionDetails || "",
      result: callData.result || "CONFORMS",
      qtyCleared: callData.qtyCleared || "",
      qtyRejected: callData.qtyRejected || "NIL",

      remarks: callData.remarks || "",
      dateOfCall: callData.callDate || "",
      noOfVisits: callData.noOfVisits || "ONE",
      dateOfInspection: callData.inspectionDate || "",
      sealingPattern: callData.sealingPattern || "",
      inspectingEngineer: callData.inspectingEngineer || "",
      totalQtyMfgStage: callData.totalQtyMfgStage || "",
      reference: callData.reference || ""
    };
  };

  // data used: prefer runtime call, fall back to mock for quick test
  const data = call && Object.keys(call).length ? transformCallToIC(call) : transformCallToIC(mockData);

  const handleExport = async () => {
    if (!printAreaRef.current) return;
    await exportToPdf(printAreaRef.current, "ProcessMaterialIC.pdf");
  };

  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={onBack} className="btn btn-outline">← Back</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.print()} className="btn btn-outline">Print</button>
          <button onClick={handleExport} className="btn btn-primary">Export PDF</button>
        </div>
      </div>

      <div ref={printAreaRef}>
        <ProcessMaterialPreview data={data} />
      </div>
    </div>
  );
}

