import React from 'react';
import { MOCK_PO_DATA } from '../data/mockData';
import { formatDate } from '../utils/helpers';
import { getProductTypeDisplayName } from '../utils/helpers';

const InspectionInitiationFormContent = ({ call, formData, onFormDataChange }) => {
  const poData = MOCK_PO_DATA[call.po_no] || {};

  const getOfferedQtyStatus = () => {
    if (formData.offeredQty < call.call_qty) return { type: 'error', message: 'Not allowed - Offered Qty cannot be less than Call Qty' };
    if (formData.offeredQty === call.call_qty) return { type: 'success', message: 'Allowed - Quantities match' };
    if (formData.offeredQty > call.call_qty) return { type: 'warning', message: 'Requires CM approval - Offered Qty exceeds Call Qty' };
  };

  const offeredQtyStatus = getOfferedQtyStatus();

  const addProductionLine = () => {
    onFormDataChange({
      productionLines: [...formData.productionLines, {
        lineNumber: formData.productionLines.length + 1,
        icNumber: '',
        poNumber: '',
        rawMaterialIC: '',
        productType: ''
      }]
    });
  };

  const updateProductionLine = (index, field, value) => {
    const updated = [...formData.productionLines];
    updated[index][field] = value;
    onFormDataChange({ productionLines: updated });
  };

  return (
    <div className="form-container">
      {/* SECTION A: Main PO Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">SECTION A: Main PO Information (Auto-Fetched)</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">PO Number</label>
            <input type="text" className="form-input" value={poData.po_no || call.po_no} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">PO Date</label>
            <input type="text" className="form-input" value={formatDate(poData.po_date || call.po_date)} disabled />
            <small style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>✓ PO Date ≤ Today</small>
          </div>
          <div className="form-group">
            <label className="form-label">PO Ammd. No./Numbers</label>
            <input type="text" className="form-input" value={poData.po_amend_no || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">PO Ammd. Dates</label>
            <input type="text" className="form-input" value={poData.po_amend_dates || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input type="text" className="form-input" value={poData.product_name || 'ERC Components'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">PL No.</label>
            <input type="text" className="form-input" value={poData.pl_no || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Vendor Name</label>
            <input type="text" className="form-input" value={poData.vendor_name || call.vendor_name} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Purchasing Authority</label>
            <input type="text" className="form-input" value={poData.purchasing_authority || 'Manager, Procurement'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">BPO (Bill Paying Officer)</label>
            <input type="text" className="form-input" value={poData.bpo || 'BPO-001'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">PO Quantity</label>
            <input type="text" className="form-input" value={poData.po_qty || call.po_qty} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">DP (Delivery Period)</label>
            <input type="text" className="form-input" value={poData.delivery_period || call.delivery_period || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Place of Inspection</label>
            <input type="text" className="form-input" value={poData.place_of_inspection || call.place_of_inspection || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Inspection Fees Payment Details (in Advance)</label>
            <input type="text" className="form-input" value={poData.inspection_fees_payment || 'N/A'} disabled />
          </div>

          {/* Section A Verification Checkbox */}
          <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: 'var(--space-16)', padding: 'var(--space-16)', background: 'var(--color-gray-100)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-gray-300)' }}>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id={`sectionA-verify-${call.id}`}
                checked={formData.sectionAVerified || false}
                onChange={(e) => onFormDataChange({ sectionAVerified: e.target.checked })}
              />
              <label htmlFor={`sectionA-verify-${call.id}`} style={{ fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                {formData.sectionAVerified && <span style={{ color: 'var(--color-success)', fontSize: '18px' }}>✓</span>}
                I verify that all information in this section has been reviewed and is correct
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: Details of PO Item */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">SECTION B: Details of PO Item (Auto-Fetched + Manual)</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label required">Shift of Inspection</label>
            <select className="form-select" value={formData.shift} onChange={(e) => onFormDataChange({ shift: e.target.value })}>
              <option value="">Select Shift</option>
              <option value="Day">Day</option>
              <option value="Night">Night</option>
              <option value="General">General</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date of Inspection</label>
            <input
              type="date"
              className="form-input"
              value={formData.inspectionDate}
              onChange={(e) => onFormDataChange({ inspectionDate: e.target.value })}
              max="2025-11-14"
              min="2025-11-13"
              disabled={formData.shift !== 'Night'}
            />
            <small style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Stage C: Manual entry (today or yesterday)</small>
          </div>
          <div className="form-group">
            <label className="form-label">Inspection Call No.</label>
            <input type="text" className="form-input" value={call.call_no} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Inspection Call Date</label>
            <input type="text" className="form-input" value={formatDate(call.requested_date)} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">PO Item / Sr.No.</label>
            <input type="text" className="form-input" value="1" disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input type="text" className="form-input" value={poData.product_name || 'ERC Components'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Product Type</label>
            <input type="text" className="form-input" value={getProductTypeDisplayName(call.product_type)} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">PO Qty</label>
            <input type="text" className="form-input" value={poData.po_qty || call.po_qty} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Call Qty</label>
            <input type="text" className="form-input" value={call.call_qty} disabled />
          </div>
          <div className="form-group">
            <label className="form-label required">Offered Qty</label>
            <input
              type="number"
              className={`form-input ${offeredQtyStatus.type === 'error' ? 'error' : ''}`}
              value={formData.offeredQty}
              onChange={(e) => onFormDataChange({ offeredQty: Number(e.target.value) })}
            />
            <div className={`form-${offeredQtyStatus.type === 'success' ? 'success' : offeredQtyStatus.type === 'error' ? 'error' : 'warning'}`} style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-4)', color: offeredQtyStatus.type === 'success' ? 'var(--color-success)' : offeredQtyStatus.type === 'error' ? 'var(--color-error)' : 'var(--color-warning)' }}>
              {offeredQtyStatus.type === 'success' ? '✓' : offeredQtyStatus.type === 'error' ? '✗' : '⚠'} {offeredQtyStatus.message}
            </div>
          </div>
          {formData.offeredQty > call.call_qty && (
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id={`cmApproval-${call.id}`}
                  checked={formData.cmApproval}
                  onChange={(e) => onFormDataChange({ cmApproval: e.target.checked })}
                />
                <label htmlFor={`cmApproval-${call.id}`} style={{ fontWeight: 'var(--font-weight-medium)' }}>Approval received from CM (Controlling Manager)</label>
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Delivery Completion Period</label>
            <input type="text" className="form-input" value={call.delivery_period} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Rate</label>
            <input type="text" className="form-input" value={`₹${call.rate}`} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Place of Inspection</label>
            <input type="text" className="form-input" value={call.place_of_inspection} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Stage of Inspection</label>
            <input type="text" className="form-input" value={call.stage} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">IC Number of Previous Stages</label>
            <input type="text" className="form-input" value="RM-IC-001, RM-IC-002" disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Remarks for Inspection Call by Vendor</label>
            <textarea className="form-textarea" rows="2" value="Urgent inspection required for production schedule" disabled />
          </div>

          {/* Section B Verification Checkbox */}
          <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: 'var(--space-16)', padding: 'var(--space-16)', background: 'var(--color-gray-100)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-gray-300)' }}>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id={`sectionB-verify-${call.id}`}
                checked={formData.sectionBVerified || false}
                onChange={(e) => onFormDataChange({ sectionBVerified: e.target.checked })}
              />
              <label htmlFor={`sectionB-verify-${call.id}`} style={{ fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                {formData.sectionBVerified && <span style={{ color: 'var(--color-success)', fontSize: '18px' }}>✓</span>}
                I verify that all information in this section has been reviewed and is correct
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C: Sub PO Details (if applicable) */}
      {(call.product_type === 'Raw Material' || call.product_type.includes('Process')) && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">SECTION C: Details of Sub PO in case inspection call is requested for Raw Material / process</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Raw Material Name</label>
              <input type="text" className="form-input" value="Steel Bars Grade 45C8" disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Sub PO Number</label>
              <input type="text" className="form-input" value="SUB-PO-2025-001" disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Sub PO Date</label>
              <input type="text" className="form-input" value="2025-10-18" disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Contractor</label>
              <input type="text" className="form-input" value="Premium Materials Inc" disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Manufacturer</label>
              <input type="text" className="form-input" value="Steel Works Ltd" disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Place of Inspection</label>
              <input type="text" className="form-input" value="Vendor Site" disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Bill Paying Officer</label>
              <input type="text" className="form-input" value="BPO-002" disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Consignee</label>
              <input type="text" className="form-input" value="Central Warehouse" disabled />
            </div>

            {/* Section C Verification Checkbox */}
            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: 'var(--space-16)', padding: 'var(--space-16)', background: 'var(--color-gray-100)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-gray-300)' }}>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id={`sectionC-verify-${call.id}`}
                  checked={formData.sectionCVerified || false}
                  onChange={(e) => onFormDataChange({ sectionCVerified: e.target.checked })}
                />
                <label htmlFor={`sectionC-verify-${call.id}`} style={{ fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                  {formData.sectionCVerified && <span style={{ color: 'var(--color-success)', fontSize: '18px' }}>✓</span>}
                  I verify that all information in this section has been reviewed and is correct
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION D: Multiple Production Lines */}
      {call.product_type.includes('Process') && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">SECTION D: Multiple Production Lines (if applicable)</h3>
          </div>
        <div className="checkbox-item" style={{ marginBottom: 'var(--space-16)' }}>
          <input
            type="checkbox"
            id={`multipleLinesActive-${call.id}`}
            checked={formData.multipleLinesActive}
            onChange={(e) => onFormDataChange({ multipleLinesActive: e.target.checked })}
          />
          <label htmlFor={`multipleLinesActive-${call.id}`} style={{ fontWeight: 'var(--font-weight-medium)' }}>Multiple production lines operating?</label>
        </div>
        {formData.multipleLinesActive && (
          <div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-16)' }}>All data points must be collected for each line number separately.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Line Number</th>
                    <th>Inspection Call Number</th>
                    <th>PO Number</th>
                    <th>Raw Material IC Number(s)</th>
                    <th>Product Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.productionLines.map((line, idx) => (
                    <tr key={idx}>
                      <td><input type="number" className="form-input" value={line.lineNumber} onChange={(e) => updateProductionLine(idx, 'lineNumber', e.target.value)} /></td>
                      <td><input type="text" className="form-input" value={line.icNumber} onChange={(e) => updateProductionLine(idx, 'icNumber', e.target.value)} placeholder="IC-2025-xxx" /></td>
                      <td><input type="text" className="form-input" value={line.poNumber} onChange={(e) => updateProductionLine(idx, 'poNumber', e.target.value)} disabled /></td>
                      <td><input type="text" className="form-input" value={line.rawMaterialIC} onChange={(e) => updateProductionLine(idx, 'rawMaterialIC', e.target.value)} placeholder="RM-IC-001, RM-IC-002" /></td>
                      <td>
                        <select className="form-select" value={line.productType} onChange={(e) => updateProductionLine(idx, 'productType', e.target.value)}>
                          <option value="">Select</option>
                          <option value="ERC Process">ERC-PROCESS MATERIAL</option>
                          <option value="Raw Material">ERC-RAW MATERIAL</option>
                          <option value="Final Product">ERC-FINAL</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline" onClick={() => onFormDataChange({ productionLines: formData.productionLines.filter((_, i) => i !== idx) })}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={addProductionLine} style={{ marginTop: 'var(--space-16)' }}>+ Add Production Line</button>
          </div>
        )}

        {/* Section D Verification Checkbox */}
        <div style={{ marginTop: 'var(--space-16)', padding: 'var(--space-16)', background: 'var(--color-gray-100)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-gray-300)' }}>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id={`sectionD-verify-${call.id}`}
              checked={formData.sectionDVerified || false}
              onChange={(e) => onFormDataChange({ sectionDVerified: e.target.checked })}
            />
            <label htmlFor={`sectionD-verify-${call.id}`} style={{ fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              {formData.sectionDVerified && <span style={{ color: 'var(--color-success)', fontSize: '18px' }}>✓</span>}
              I verify that all information in this section has been reviewed and is correct
            </label>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default InspectionInitiationFormContent;
