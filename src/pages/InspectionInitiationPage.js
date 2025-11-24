import React, { useState } from 'react';
import { MOCK_PO_DATA } from '../data/mockData';
import { formatDate } from '../utils/helpers';
import { getProductTypeDisplayName } from '../utils/helpers';
import InspectionInitiationFormContent from '../components/InspectionInitiationFormContent';

const InspectionInitiationPage = ({ call, onProceed, onBack }) => {
  const [shift, setShift] = useState('');
  const [offeredQty, setOfferedQty] = useState(call.call_qty);
  const [cmApproval, setCmApproval] = useState(false);
  const [inspectionDate, setInspectionDate] = useState('2025-11-14');
  const [multipleLinesActive, setMultipleLinesActive] = useState(false);
  const [productionLines, setProductionLines] = useState([{ lineNumber: 1, icNumber: '', poNumber: '', rawMaterialIC: '', productType: '' }]);
  const [sectionAVerified, setSectionAVerified] = useState(false);
  const [sectionBVerified, setSectionBVerified] = useState(false);
  const [sectionCVerified, setSectionCVerified] = useState(false);
  const [sectionDVerified, setSectionDVerified] = useState(false);
  const currentDateTime = new Date('2025-11-14T17:00:00').toLocaleString();
  const poData = MOCK_PO_DATA[call.po_no] || {};



  const getOfferedQtyStatus = () => {
    if (offeredQty < call.call_qty) return { type: 'error', message: 'Not allowed - Offered Qty cannot be less than Call Qty' };
    if (offeredQty === call.call_qty) return { type: 'success', message: 'Allowed - Quantities match' };
    if (offeredQty > call.call_qty) return { type: 'warning', message: 'Requires CM approval - Offered Qty exceeds Call Qty' };
  };

  const offeredQtyStatus = getOfferedQtyStatus();

  // Check if all required sections are verified
  const allSectionsVerified = sectionAVerified && sectionBVerified && sectionCVerified &&
    (call.product_type.includes('Process') ? sectionDVerified : true);

  const canProceed = shift && (offeredQty === call.call_qty || (offeredQty > call.call_qty && cmApproval)) && allSectionsVerified;

  const addProductionLine = () => {
    setProductionLines([...productionLines, { lineNumber: productionLines.length + 1, icNumber: '', poNumber: '', rawMaterialIC: '', productType: '' }]);
  };

  const updateProductionLine = (index, field, value) => {
    const updated = [...productionLines];
    updated[index][field] = value;
    setProductionLines(updated);
  };

  const formData = {
    shift,
    offeredQty,
    cmApproval,
    inspectionDate,
    multipleLinesActive,
    productionLines,
    sectionAVerified,
    sectionBVerified,
    sectionCVerified,
    sectionDVerified,
  };

  const onFormDataChange = (updates) => {
    if (updates.shift !== undefined) setShift(updates.shift);
    if (updates.offeredQty !== undefined) setOfferedQty(updates.offeredQty);
    if (updates.cmApproval !== undefined) setCmApproval(updates.cmApproval);
    if (updates.inspectionDate !== undefined) setInspectionDate(updates.inspectionDate);
    if (updates.multipleLinesActive !== undefined) setMultipleLinesActive(updates.multipleLinesActive);
    if (updates.productionLines !== undefined) setProductionLines(updates.productionLines);
    if (updates.sectionAVerified !== undefined) setSectionAVerified(updates.sectionAVerified);
    if (updates.sectionBVerified !== undefined) setSectionBVerified(updates.sectionBVerified);
    if (updates.sectionCVerified !== undefined) setSectionCVerified(updates.sectionCVerified);
    if (updates.sectionDVerified !== undefined) setSectionDVerified(updates.sectionDVerified);
  };

  return (
    <div>
        <div className="breadcrumb">
            <div className="breadcrumb-item" onClick={onBack} style={{ cursor: 'pointer' }}>Landing Page</div>
            <span className="breadcrumb-separator">/</span>
            <div className="breadcrumb-item breadcrumb-active">Inspection Initiation</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
            <h1>Inspection Initiation for {call.call_no}</h1>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {currentDateTime}
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
            <InspectionInitiationFormContent call={call} formData={formData} onFormDataChange={onFormDataChange} />
        </div>

        <div style={{ marginTop: 'var(--space-24)', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={onBack}>Back to Landing Page</button>
            <button
            className="btn btn-primary"
            disabled={!canProceed}
            onClick={() => onProceed(call.product_type)}
            >
            {canProceed ? 'Proceed to Inspection' : 'Complete All Sections to Proceed'}
            </button>
        </div>
    </div>
  );
};

export default InspectionInitiationPage;
