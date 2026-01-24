import React from "react";

const ErcFinalIc = ({ data = {}, isEditing = false, onFieldChange = () => {} }) => {
  const {
    certificateNo = "",
    certificateDate = "",
    offeredInstNo = "",
    passedInstNo = "",
    contractor = "",
    placeOfInspection = "",
    contractRef = "",
    contractRefDate = "",
    billPayingOfficer = "",
    consignee = "",
    purchasingAuthority = "",
    description = "",
    quantityNowPassedText = "",
    qtyOnOrder = "",
    qtyOfferedPreviously = "",
    qtyPassedPreviously = "",
    qtyNowOffered = "",
    qtyNowPassed = "",
    qtyNowRejected = "",
    qtyStillDue = "",
    noOfItemsChecked = "",
    dateOfCall = "",
    noOfVisits = "",
    datesOfInspection = "",
    trRecDate = "",
    sealingPattern = "",
    facsimileText = "",
    reasonsForRejection = "Not Applicable",
    inspectingEngineer = ""
  } = data;

  const cell = "border border-black p-2 align-top break-words dynamic-text";
  const cellCenter = `${cell} text-center`;

  // Sanitize certificate number for display (remove BOM / zero-width chars)
  const displayCertificateNo = (certificateNo || '')
    .replace(/[\uFEFF\u200B]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .trim();

  // Editable field component
  const EditableField = ({ value, fieldName, placeholder = "" }) => {
    if (isEditing) {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onFieldChange(fieldName, e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "4px",
            border: "1px solid #ccc",
            borderRadius: "2px",
            fontSize: "inherit",
            fontFamily: "inherit"
          }}
        />
      );
    }
    return <span>{value}</span>;
  };

  // Note: Additional fields from API (lotDetails, remarks, totalLots, totalOfferedQty, totalAcceptedQty, totalRejectedQty)
  // are available but not displayed in the current certificate layout.
  // These can be used for future enhancements or additional reporting.

  return (
    <div className="a4-page">
      <style>
        {`
          @media print {
            thead {
              display: table-row-group !important;
            }
          }
        `}
      </style>

      <div className="certificate-container">
        <table className="w-full border-collapse border border-black h-full">
          <colgroup>
            <col className="w-[4%]" />
            <col className="w-[40%]" />
            <col className="w-[2%]" />
            <col className="w-[2%]" />
            <col className="w-[5%]" />
            <col className="w-[2%]" />
            <col className="w-[2%]" />
            <col className="w-[5%]" />
            <col className="w-[5%]" />
            <col className="w-[5%]" />
            <col className="w-[5%]" />
            <col className="w-[5%]" />
            <col className="w-[5%]" />
            <col className="w-[2%]" />
            <col className="w-[2%]" />
            <col className="w-[2%]" />
          </colgroup>

          <thead>
            <tr>
              <th colSpan={4} className={cell}></th>
              <th colSpan={4} className={cell}>
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="font-bold text-center text-sm">
                    प्रमाणपत्र सं. Certificate No.
                  </div>
                  <div className="mt-1 text-red-600 text-center whitespace-pre-wrap" style={{ cursor: isEditing ? "text" : "default" }}>
                    <EditableField value={displayCertificateNo} fieldName="certificateNo" placeholder="Enter Certificate No." />
                  </div>
                </div>
              </th>
              <th colSpan={4} className={cell}>
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="font-bold text-center text-sm">
                    दिनांक Date
                  </div>
                  <div className="mt-1 text-red-600 text-center whitespace-pre-wrap" style={{ cursor: isEditing ? "text" : "default" }}>
                    <EditableField value={certificateDate} fieldName="certificateDate" placeholder="DD.MM.YYYY" />
                  </div>
                </div>
              </th>
              <th colSpan={4} className={cell}>
                <div className="font-bold text-center text-sm">
                  प्रस्तावित किस्त सं.
                </div>
                <div className="text-center text-sm">
                  <span className="font-bold">Offered Instt No.</span> {offeredInstNo}
                </div>
                <div className="font-bold text-center text-sm mt-1">
                  परित किस्त सं.
                </div>
                <div className="text-center text-sm">
                  <span className="font-bold">Passed Instt No.</span> {passedInstNo}
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={7} className={cell}>
                <div className="font-bold mb-1">ठेकेदार Contractor</div>
                <div className="whitespace-pre-wrap text-red-600">{contractor}</div>
              </td>
              <td colSpan={9} className={cell}>
                <div className="font-bold mb-1">निरीक्षण का स्थान Place of Inspection</div>
                <div className="whitespace-pre-wrap text-red-600">{placeOfInspection}</div>
              </td>
            </tr>

            <tr>
              <td colSpan={7} className={cell}>
                <div className="font-bold">संविदा संदर्भ एवं Contract Reference</div>
                <div className="text-red-600 whitespace-pre-wrap">{contractRef}</div>
                <div className="font-bold mt-1">दिनांक Date</div>
                <div className="text-red-600 whitespace-pre-wrap">{contractRefDate}</div>
              </td>
              <td colSpan={9} className={cell}>
                <div className="font-bold">बिल अदायगी अधिकारी Bill Paying Officer</div>
                <div className="text-red-600 whitespace-pre-wrap">{billPayingOfficer}</div>
              </td>
            </tr>

            <tr>
              <td colSpan={7} className={cell}>
                <div className="font-bold">प्रेषिती Consignee</div>
                <div className="text-red-600 whitespace-pre-wrap">{consignee}</div>
              </td>
              <td colSpan={9} className={cell}>
                <div className="font-bold">क्रय प्राधिकारी Purchasing Authority</div>
                <div className="text-red-600 whitespace-pre-wrap">{purchasingAuthority}</div>
              </td>
            </tr>

            {/* TABLE HEADER */}
            <tr>
              <td className={`${cellCenter} text-sm`}>
                <div className="font-bold">मद सं Item No.</div>
                <div>1</div>
              </td>
              <td colSpan={3} className={`${cell} text-sm`}>
                <div className="font-bold">भंडार का विवरण</div>
                <div className="font-bold">Description of Stores</div>
                <div className="font-bold">2</div>
              </td>
              <td colSpan={2} className={`${cellCenter} text-sm`}>
                <div className="font-bold">आदेशित मात्रा</div>
                <div className="font-bold">Quantity on order</div>
                <div className="font-bold">3</div>
              </td>
              <td colSpan={2} className={`${cellCenter} text-sm`}>
                <div className="font-bold">पहले प्रस्तुत संचयी मात्रा</div>
                <div className="font-bold">Cumulative qty. offered previously</div>
                <div className="font-bold">4</div>
              </td>
              <td colSpan={2} className={`${cellCenter} text-sm`}>
                <div className="font-bold">पहले स्वीकृत मात्रा</div>
                <div className="font-bold">Quantity previously passed</div>
                <div className="font-bold">5</div>
              </td>
              <td colSpan={2} className={`${cellCenter} text-sm`}>
                <div className="font-bold">अब प्रस्तुत मात्रा</div>
                <div className="font-bold">Qty now offered</div>
                <div className="font-bold">6</div>
              </td>
              <td colSpan={2} className={`${cellCenter} text-sm`}>
                <div className="font-bold">अब स्वीकृत मात्रा</div>
                <div className="font-bold">Qty now passed</div>
                <div className="font-bold">7</div>
              </td>
              <td className={`${cellCenter} text-sm`}>
                <div className="font-bold">अब अस्वीकृत मात्रा</div>
                <div className="font-bold">Qty now rejected</div>
                <div className="font-bold">8</div>
              </td>
              <td className={`${cellCenter} text-sm`}>
                <div className="font-bold">बकाया मात्रा</div>
                <div className="font-bold">Qty still due</div>
                <div className="font-bold">9</div>
              </td>
            </tr>

            {/* ITEM ROW */}
            <tr>
              <td className={cellCenter} rowSpan={quantityNowPassedText ? 2 : 1}>
                1
              </td>
              <td colSpan={3} className={`${cell} whitespace-pre-wrap`} rowSpan={quantityNowPassedText ? 2 : 1}>
                {description}
              </td>
              <td colSpan={2} className={cellCenter}>
                <div className="text-sm">Nos.</div>
                <div className="text-red-600">{qtyOnOrder}</div>
              </td>
              <td colSpan={2} className={cellCenter}>
                <div className="text-sm">Nos.</div>
                <div className="text-red-600">{qtyOfferedPreviously}</div>
              </td>
              <td colSpan={2} className={cellCenter}>
                <div className="text-sm">Nos.</div>
                <div className="text-red-600">{qtyPassedPreviously}</div>
              </td>
              <td colSpan={2} className={cellCenter}>
                <div className="text-sm">Nos.</div>
                <div className="text-red-600">{qtyNowOffered}</div>
              </td>
              <td colSpan={2} className={cellCenter}>
                <div className="text-sm">Nos.</div>
                <div className="text-red-600">{qtyNowPassed}</div>
              </td>
              <td className={cellCenter}>
                <div className="text-sm">Nos.</div>
                <div className="text-red-600">{qtyNowRejected}</div>
              </td>
              <td className={cellCenter}>
                <div className="text-sm">Nos.</div>
                <div className="text-red-600">{qtyStillDue}</div>
              </td>
            </tr>

            {quantityNowPassedText && (
              <tr>
                <td colSpan={12} className={`${cell} text-red-600 whitespace-pre-wrap bg-white`}>
                  {quantityNowPassedText}
                </td>
              </tr>
            )}

            {/* INSPECTION DETAILS */}
            <tr>
              <td colSpan={2} className={cell}>
                <div className="font-bold">जाँची गई इकाइयों की संख्या</div>
                <div className="font-bold">No. of items checked</div>
                <div className="mt-1 text-red-600 whitespace-pre-wrap">{noOfItemsChecked}</div>
              </td>
              <td colSpan={2} className={cell}>
                <div className="font-bold">बुलावे की तिथि</div>
                <div className="font-bold">Date of call</div>
                <div className="mt-1 text-red-600 whitespace-pre-wrap">{dateOfCall}</div>
              </td>
              <td colSpan={4} className={cellCenter}>
                <div className="font-bold">दौरों की संख्या</div>
                <div className="font-bold">No. of visits</div>
                <div className="mt-1 text-red-600 whitespace-pre-wrap">{noOfVisits}</div>
              </td>
              <td colSpan={6} className={cell}>
                <div className="font-bold">निरीक्षण की तिथि (तिथियाँ) / Date(s) of inspection</div>
                <div className="mt-1 text-red-600 whitespace-pre-wrap">{datesOfInspection}</div>
              </td>
              <td colSpan={2} className={cellCenter}>
                <div className="font-bold">TR Rec. Dt.</div>
                <div className="mt-1 text-red-600 whitespace-pre-wrap">{trRecDate}</div>
              </td>
            </tr>

            {/* SEALING / FACSIMILE / ENGINEER */}
            <tr>
              <td colSpan={5} className={cell}>
                <div className="font-bold">सील / स्टैम्पिंग तथा स्थान / Pattern of sealing/stamping and location of seal/stamp/sticker</div>
                <div className="mt-1 text-red-600 whitespace-pre-wrap">{sealingPattern}</div>
              </td>
              <td colSpan={6} className={cell}>
                <div className="font-bold">मुहर / स्टैम्प की प्रतिकृति / Facsimile of seal/stamp/sticker</div>
                <div className="mt-1 text-red-600 whitespace-pre-wrap">{facsimileText}</div>
              </td>
              <td colSpan={5} rowSpan={2} className={cell}>
                <div className="font-bold">निरीक्षण अभियंता / Inspecting Engineer</div>
                <div className="mt-4 whitespace-pre-wrap">{inspectingEngineer}</div>
              </td>
            </tr>

            {/* REJECTION */}
            <tr>
              <td colSpan={11} className={cell}>
                <div className="font-bold">अस्वीकृति का कारण / Reasons for rejection</div>
                <div className="mt-1 whitespace-pre-wrap">{reasonsForRejection}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ErcFinalIc;

