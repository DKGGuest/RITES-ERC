import React from "react";
import "./RawMaterial.css";

/**
 * RAW MATERIAL IC A4 PREVIEW
 * - Black text = fixed layout labels
 * - Red text   = dynamic data from `data`
 * Boxes expand automatically with content.
 */
export default function RawMaterialPreview({ data = {} }) {
  const get = (key) => data[key] || "";

  return (
    <div className="rmc-a4">
      <div className="rmc-sheet">
        {/* =============== HEADER (ROW 1) =============== */}
        <table className="rmc-table rmc-top">
          <tbody>
            <tr>
              <td className="rmc-top-col-1" />
              <td className="rmc-top-col-2" />

              <td className="rmc-top-col-3">
                <span className="rmc-label">
                  प्रमाणपत्र सं. / Certificate No.
                </span>
                <span className="rmc-value-red">{get("certificateNo")}</span>
              </td>

              <td className="rmc-top-col-4">
                <span className="rmc-label">दिनांक / Date</span>
                <span className="rmc-value-red">{get("date")}</span>
              </td>

              <td className="rmc-top-col-5">
                <div>
                  <span className="rmc-label">
                    प्रस्तावित किस्त सं. / Offered Instt No.
                  </span>
                  <span className="rmc-value-red">{get("offeredInstNo")}</span>
                </div>
                <div className="rmc-row-spacer">
                  <span className="rmc-label">
                    परित किस्त सं. / Passed Instt No.
                  </span>
                  <span className="rmc-value-red">{get("passedInstNo")}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* =============== MAIN GRID (ROWS 2–6) =============== */}
        <table className="rmc-table rmc-main">
          <tbody>
            {/* ROW 2: Contractor / Manufacturer + Place of Inspection */}
            <tr className="rmc-row2">
              <td style={{ width: "50%" }}>
                <span className="rmc-label">ठेकेदार / Contractor</span>
                <span className="rmc-value-red">{get("contractor")}</span>
              </td>
              <td style={{ width: "50%" }}>
                <span className="rmc-label">उत्पादक / Manufacturer</span>
                <span className="rmc-value-red">{get("manufacturer")}</span>
                <span className="sub-label">
                  निरीक्षण का स्थान / Place of Inspection
                </span>
                <span className="rmc-value-red">{get("placeOfInspection")}</span>
              </td>
            </tr>

            {/* ROW 3: Contract Ref / Contractor PO / BPO */}
            <tr className="rmc-row3">
              <td style={{ width: "50%" }}>
                <span className="rmc-label">
                  संविदा संदर्भ एवं दिनांक (रेलवे) / Contract Ref. & Date (Rly)
                </span>
                <span className="rmc-value-red">{get("contractRef")}</span>
                <span className="sub-label">
                  खरीद आदेश / Contractor PO No. & Date (Contractor)
                </span>
                <span className="rmc-value-red">{get("poNoContractor")}</span>
              </td>
              <td style={{ width: "50%" }}>
                <span className="rmc-label">
                  बिल अदायगी अधिकारी / Bill Paying Officer
                </span>
                <span className="rmc-value-red">{get("billPayingOfficer")}</span>
              </td>
            </tr>

            {/* ROW 4: Consignees + Purchasing Authority */}
            <tr className="rmc-row4">
              <td style={{ width: "50%" }}>
                <span className="rmc-label">
                  प्रेषिती (रेलवे) / Consignee (Railway) Non Railway
                </span>
                <span className="rmc-value-red">{get("consigneeRailway")}</span>
                <span className="sub-label">
                  प्रेषिती (निर्मित उत्पाद निर्माता) / Consignee (Manufacturer of
                  Finished Product)
                </span>
                <span className="rmc-value-red">{get("consigneeManufacturer")}</span>
              </td>
              <td style={{ width: "50%" }}>
                <span className="rmc-label">
                  क्रय प्राधिकारी (रेलवे) / Purchasing Authority (Railway)
                  Non-Railway
                </span>
                <span className="rmc-value-red">{get("purchasingAuthority")}</span>
              </td>
            </tr>

            {/* ROW 5: Description / Drg + Spec / QAP (3 columns) */}
            <tr className="rmc-row5">
              <td className="col-desc">
                <span className="rmc-label">विवरण / Description</span>
                <span className="rmc-value-red">{get("description")}</span>
              </td>
              <td className="col-drg">
                <span className="rmc-label">ड्रॉइंग सं. / Drg. No.</span>
                <span className="rmc-value-red">{get("drgNo")}</span>
                <span className="rmc-label sub-label">मानक सं. / Specn. No.</span>
                <span className="rmc-value-red">{get("specNo")}</span>
              </td>
              <td className="col-qap">
                <span className="rmc-label">
                  प्रमाण आधार योजना सं. / QAP No.
                </span>
                <span className="rmc-value-red">{get("qapNo")}</span>
              </td>
            </tr>

            {/* ROW 6: Static text – Type of inspection/tests conducted */}
            <tr>
              <td colSpan={3}>
                <span className="rmc-label">
                  किए गए निरीक्षण/परीक्षण विवरण / Type of inspection/tests
                  conducted: Visual / Physical / Chemical / Metallurgical /
                  Electrical / Dimensional / ADP / Performance
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* =============== SIX-COLUMN CHP TABLE =============== */}
        <table className="rmc-table rmc-inner">
          <thead>
            <tr>
              <th className="col-chp">चप क्लॉज / CHP Cl. No.</th>
              <th className="col-contract">
                अनुबंध के अनुसार आवश्यकताएँ / Contract requirement as per QAP
              </th>
              <th className="col-details">
                किए गए निरीक्षण/परीक्षण का विवरण / Details of
                inspection/tests conducted
              </th>
              <th className="col-result">परिणाम / Result</th>
              <th className="col-qty">
                जिस मात्रा के लिए चरण स्वीकृत है / Qty. for which stage is
                cleared
              </th>
              <th className="col-reject">निरस्त मात्रा / Qty. rejected</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="rmc-value-red">{get("chpClause")}</td>
              <td className="rmc-value-red">{get("contractChpReq")}</td>
              <td className="rmc-value-red">{get("detailsOfInspection")}</td>
              <td className="rmc-value-red">{get("result")}</td>
              <td className="rmc-value-red">{get("qtyCleared")}</td>
              <td className="rmc-value-red">{get("qtyRejected")}</td>
            </tr>
          </tbody>
        </table>

        {/* =============== REMARKS & BOTTOM GRID =============== */}
        <table className="rmc-table rmc-bottom">
          <tbody>
            <tr>
              <td className="rmc-label" style={{ width: "18%" }}>
                टिप्पणी / Remarks
              </td>
              <td colSpan={5} className="rmc-value-red">
                {get("remarks")}
              </td>
            </tr>

            <tr>
              <td>
                <span className="rmc-label">कॉल दिनांक / Date of call</span>
                <span className="rmc-value-red">{get("dateOfCall")}</span>
              </td>
              <td>
                <span className="rmc-label">दौरों की संख्या / No. of visits</span>
                <span className="rmc-value-red">{get("noOfVisits")}</span>
              </td>
              <td colSpan={2}>
                <span className="rmc-label">
                  निरीक्षण की तिथि / Date of inspection
                </span>
                <span className="rmc-value-red">{get("dateOfInspection")}</span>
              </td>
              <td colSpan={2}>
                <span className="rmc-label">
                  निरीक्षण अभियंता / Inspecting Engineer
                </span>
                <span className="rmc-value-red">{get("inspectingEngineer")}</span>
              </td>
            </tr>

            <tr>
              <td colSpan={3}>
                <span className="rmc-label">
                  सील/स्टैम्प की पहचान या विवरण / Pattern of
                  sealing/identification
                </span>
                <span className="rmc-value-red">{get("sealingPattern")}</span>
              </td>
              <td colSpan={2}>
                <span className="rmc-label">
                  सील/स्टैम्प की प्रतिकृति / Facsimile of seal/stamp
                </span>
                <span className="rmc-value-red">{get("facsimile")}</span>
              </td>
              <td>
                <span className="rmc-label">
                  निरीक्षण अभियंता / Inspecting Engineer
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="rmc-footer">
          It is certified that material is cleared for the next stage.
          <br />
          <strong>Distribution:</strong> Manufacturer office copy, RITES Bill
          copy, Contractor, Purchaser (Railway), Consignee (Railway), Consignee
          (Manufacturer of finished product), RITES office copy, RITES for final
          IC
        </div>
      </div>
    </div>
  );
}
