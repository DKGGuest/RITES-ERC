import { useState, useMemo, useEffect, useRef } from 'react';
import { MOCK_PO_DATA } from '../data/mockData';
import { formatDate } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';
import HeatNumberDetails from '../components/HeatNumberDetails';
import MobileResponsiveSelect from '../components/MobileResponsiveSelect';
import './RawMaterialDashboard.css';

const RawMaterialDashboard = ({ onBack, onNavigateToSubModule, onHeatsChange, onProductModelChange }) => {

  // Pre-Inspection Data Entry State
  const [sourceOfRawMaterial, setSourceOfRawMaterial] = useState('');
  // Mock data simulating vendor call data - will be replaced with API data
  const [heats] = useState([
    {
      id: 1,
      heatNo: 'H001',
      weight: '2.5',
      tcNo: 'TC-2025-001',
      tcDate: '2025-11-10',
      manufacturerName: 'Steel Authority of India',
      invoiceNumber: 'INV-2025-0012',
      invoiceDate: '2025-11-05',
      subPoNumber: 'SPO-2025-001',
      subPoDate: '2025-10-15',
      subPoQty: '5.0',
      totalValueOfPo: '₹ 25,00,000',
      tcQuantity: '2.5',
      offeredQty: '2.5',
      colorCode: ''
    },
    {
      id: 2,
      heatNo: 'H002',
      weight: '3.0',
      tcNo: 'TC-2025-002',
      tcDate: '2025-11-12',
      manufacturerName: 'Steel Authority of India',
      invoiceNumber: 'INV-2025-0012',
      invoiceDate: '2025-11-05',
      subPoNumber: 'SPO-2025-001',
      subPoDate: '2025-10-15',
      subPoQty: '5.0',
      totalValueOfPo: '₹ 25,00,000',
      tcQuantity: '3.0',
      offeredQty: '3.0',
      colorCode: ''
    }
  ]);
  const [numberOfBundles, setNumberOfBundles] = useState('');



  // Get PO data for header (move up so memo hooks can reference it)
  const poData = MOCK_PO_DATA["PO-2025-1001"];

  // Determine product model/type from PO data — fall back to MK-III
  const productModel = useMemo(() => {
    const name = (poData.product_name || '').toString();
    if (/MK-III/i.test(name) || /MK III/i.test(name)) return 'MK-III';
    if (/MK-V/i.test(name) || /MK V/i.test(name)) return 'MK-V';
    // if mock data or PO doesn't contain model, check other fields
    if (poData.model && /MK-III/i.test(poData.model)) return 'MK-III';
    if (poData.model && /MK-V/i.test(poData.model)) return 'MK-V';
    return 'MK-III';
  }, [poData]);

  // Sync heats and productModel to parent for submodule pages
  useEffect(() => {
    if (onHeatsChange) onHeatsChange(heats);
  }, [heats, onHeatsChange]);

  useEffect(() => {
    if (onProductModelChange) onProductModelChange(productModel);
  }, [productModel, onProductModelChange]);

  // Auto-calculated values
  const totalQuantity = useMemo(() => {
    return heats.reduce((sum, heat) => sum + (parseFloat(heat.weight) || 0), 0).toFixed(2);
  }, [heats]);

  const numberOfHeats = useMemo(() => {
    return heats.length;
  }, [heats]);

  /**
   * Calculate No. of ERC (Finished) based on product model
   * MK-V:   Weight / 0.00114 (weight per clip in MT)
   * MK-III: Weight / 0.000092 (weight per clip in MT)
   */
  const numberOfERC = useMemo(() => {
    const weightMT = parseFloat(totalQuantity) || 0;
    if (productModel === 'MK-V') {
      return Math.floor(weightMT / 0.00114);
    } else {
      // MK-III
      return Math.floor(weightMT / 0.000092);
    }
  }, [totalQuantity, productModel]);

  // (defect lists and counts handled in visual module state)

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [sourceOfRawMaterial, heats, numberOfBundles]);

  const heatNumbers = useMemo(() => heats.map(h => h.heatNo).filter(Boolean), [heats]);

  return (
    <div className="rm-dashboard-container">
      <div className="breadcrumb">
        <div className="breadcrumb-item" onClick={onBack} style={{ cursor: 'pointer' }}>Landing Page</div>
        <span className="breadcrumb-separator">/</span>
        <div className="breadcrumb-item">Inspection Initiation</div>
        <span className="breadcrumb-separator">/</span>
        <div className="breadcrumb-item breadcrumb-active">ERC Raw Material</div>
      </div>

      <div className="rm-page-header">
        <h1>ERC Raw Material Inspection</h1>
        <button className="rm-back-button" onClick={onBack}>
          ← Back to Landing Page
        </button>
      </div>

      {/* Header with Static Data */}
      <div className="card" style={{ background: 'var(--color-gray-100)', marginBottom: 'var(--space-24)' }}>
        <div className="card-header rm-card-header">
          <h3 className="card-title rm-card-title">Inspection Details (Static Data)</h3>
          <p className="card-subtitle">Auto-fetched from PO/Sub PO information</p>
        </div>
        <div className="rm-form-grid">
          <div className="rm-form-group">
            <label className="rm-form-label">PO / Sub PO Number</label>
            <input type="text" className="rm-form-input" value={poData.sub_po_no || poData.po_no} disabled />
          </div>
          <div className="rm-form-group">
            <label className="rm-form-label">PO / Sub PO Date</label>
            <input type="text" className="rm-form-input" value={formatDate(poData.sub_po_date || poData.po_date)} disabled />
          </div>
          <div className="rm-form-group">
            <label className="rm-form-label">Contractor Name</label>
            <input type="text" className="rm-form-input" value={poData.contractor} disabled />
          </div>
          <div className="rm-form-group">
            <label className="rm-form-label">Manufacturer</label>
            <input type="text" className="rm-form-input" value={poData.manufacturer} disabled />
          </div>
          <div className="rm-form-group">
            <label className="rm-form-label">Place of Inspection</label>
            <input type="text" className="rm-form-input" value={poData.place_of_inspection} disabled />
          </div>
          <div className="rm-form-group">
            <label className="rm-form-label">Stage of Inspection</label>
            <input type="text" className="rm-form-input" value="Raw Material Inspection" disabled />
          </div>
        </div>
      </div>

      {/* Pre-Inspection Data Entry */}
      <div className="card" style={{ marginBottom: 'var(--space-24)' }}>
        <div className="card-header rm-card-header">
          <h3 className="card-title rm-card-title">Pre-Inspection Data Entry</h3>
          {/* <p className="card-subtitle">Heat data from vendor call + cumulative inspection summary</p> */}
        </div>

        {/* Section 1: Heat Data from Vendor Call (with Color Code manual entry) */}
        <HeatNumberDetails />

        {/* Section 2: Cumulative Data Summary */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#166534' }}>
            📊 Cumulative Data Summary
          </h4>
          <div className="rm-form-grid">
            {/* Auto-calculated fields */}
            <div className="rm-form-group">
              <label className="rm-form-label">Total Heats Offered</label>
              <input type="text" className="rm-form-input" value={numberOfHeats} disabled />
              <span className="rm-form-hint">Auto-calculated from vendor call</span>
            </div>

            <div className="rm-form-group">
              <label className="rm-form-label">Total Qty Offered (MT)</label>
              <input type="text" className="rm-form-input" value={totalQuantity} disabled />
              <span className="rm-form-hint">Auto-calculated from heat weights</span>
            </div>

            {/* Manual entry fields */}
            <div className="rm-form-group">
              <label className="rm-form-label required">No. of Bundles</label>
              <input
                type="number"
                className="rm-form-input"
                value={numberOfBundles}
                onChange={(e) => setNumberOfBundles(e.target.value)}
                placeholder="Enter number"
                style={{ backgroundColor: '#ffffff' }}
                required
              />
              <span className="rm-form-hint">Manual entry required</span>
            </div>

            <div className="rm-form-group">
              <label className="rm-form-label">No. of ERC (Finished)</label>
              <input type="text" className="rm-form-input" value={numberOfERC.toLocaleString()} disabled />
              <span className="rm-form-hint">
                {productModel === 'MK-V' ? 'Calculated: Wt ÷ 0.00114' : 'Calculated: Wt ÷ 0.000092'} ({productModel})
              </span>
            </div>

            <div className="rm-form-group">
              <label className="rm-form-label required">Source of Raw Material</label>
              <MobileResponsiveSelect
                value={sourceOfRawMaterial}
                onChange={(e) => setSourceOfRawMaterial(e.target.value)}
                options={[
                  { value: '', label: 'Select Source' },
                  { value: 'domestic', label: 'Domestic' },
                  { value: 'imported', label: 'Imported' }
                ]}
                required={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sub Module Session */}
      <div className="submodule-session">
        <div className="submodule-session-header">
          <h3 className="submodule-session-title">📋 Sub Module Session</h3>
          <p className="submodule-session-subtitle">Select a module to proceed with inspection</p>
        </div>
        <div className="submodule-buttons">
          <button className="submodule-btn" onClick={() => onNavigateToSubModule('calibration-documents')}>
            <span className="submodule-btn-icon">📄</span>
            <p className="submodule-btn-title">Calibration & Documents</p>
            <p className="submodule-btn-desc">Verify instrument calibration</p>
          </button>
          <button className="submodule-btn" onClick={() => onNavigateToSubModule('visual-inspection')}>
            <span className="submodule-btn-icon">👁️</span>
            <p className="submodule-btn-title">Visual Inspection</p>
            <p className="submodule-btn-desc">Visual check & defects</p>
          </button>
          <button className="submodule-btn" onClick={() => onNavigateToSubModule('dimensional-check')}>
            <span className="submodule-btn-icon">📐</span>
            <p className="submodule-btn-title">Dimensional Check</p>
            <p className="submodule-btn-desc">Check bar dimensions</p>
          </button>
          <button className="submodule-btn" onClick={() => onNavigateToSubModule('material-testing')}>
            <span className="submodule-btn-icon">🧪</span>
            <p className="submodule-btn-title">Material Testing</p>
            <p className="submodule-btn-desc">Chemical & mechanical tests</p>
          </button>
          <button className="submodule-btn" onClick={() => onNavigateToSubModule('packing-storage')}>
            <span className="submodule-btn-icon">📦</span>
            <p className="submodule-btn-title">Packing & Storage</p>
            <p className="submodule-btn-desc">Verify packing conditions</p>
          </button>
          <button className="submodule-btn" onClick={() => onNavigateToSubModule('summary-reports')}>
            <span className="submodule-btn-icon">📊</span>
            <p className="submodule-btn-title">Summary and Reports</p>
            <p className="submodule-btn-desc">View consolidated results</p>
          </button>
        </div>
      </div>

      {/* Post Inspection Session - Always visible at bottom of page */}
      <div className="card" style={{ marginTop: '32px', borderTop: '4px solid var(--color-primary)' }}>
        <div className="card-header rm-card-header" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
          <h3 className="card-title rm-card-title" style={{ fontSize: '20px', color: '#0369a1' }}>🔍 Post Inspection Session</h3>
          <p className="card-subtitle" style={{ color: '#0284c7' }}>Final results and decision for the inspection</p>
        </div>

        {/* Final Results Table */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Final Results - Raw Material (Auto-Populated)</h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Heat No.</th>
                  <th>Status</th>
                  <th>Weight of Material (Tons)</th>
                  <th>Remarks (Required)</th>
                </tr>
              </thead>
              <tbody>
                {heatNumbers.map(heat => (
                  <tr key={heat}>
                    <td><strong>{heat}</strong></td>
                    <td><StatusBadge status="Valid" /> Accepted</td>
                    <td>2.75 tons</td>
                    <td>
                      <input type="text" className="rm-form-input" placeholder="Enter remarks..." required style={{ minWidth: '200px' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Accept/Reject Decision */}
        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Accept/Reject Decision</h4>
          <div className="rm-form-grid">
            <div className="rm-form-group">
              <label className="rm-form-label">Material Lot Status</label>
              <MobileResponsiveSelect
                value="accepted"
                onChange={() => {}}
                options={[
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'rejected', label: 'Rejected' }
                ]}
              />
            </div>
            <div className="rm-form-group">
              <label className="rm-form-label">Reason for Rejection (if rejected)</label>
              <input type="text" className="rm-form-input" placeholder="Enter reason..." />
            </div>
            <div className="rm-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="rm-form-label required">Overall IE Remarks</label>
              <textarea className="rm-form-input" rows="3" placeholder="Enter your overall remarks..." style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="rm-action-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: '24px' }}>
          <button className="btn btn-outline" style={{ minHeight: '44px', padding: '10px 20px' }}>Save Draft</button>
          {/* <button className="btn btn-secondary" style={{ minHeight: '44px', padding: '10px 20px' }} onClick={() => { if (window.confirm('Are you sure you want to reject this lot?')) { alert('Raw Material lot rejected'); } }}>Reject Lot</button>
          <button className="btn btn-primary" style={{ minHeight: '44px', padding: '10px 20px' }} onClick={() => { alert('Raw Material lot accepted and inspection completed!'); onBack(); }}>Accept Lot &amp; Complete Inspection</button> */}
           <button className="btn btn-outline">Pause Inspection</button>
          <button className="btn btn-outline">Withheld Inspection</button>
          <button className="btn btn-primary">Finish Inspection</button>
        </div>
      </div>

      <div className="rm-action-buttons" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <button className="rm-back-button" onClick={onBack} style={{ maxWidth: '300px' }}>
          ← Return to Landing Page
        </button>
      </div>
    </div>
  );
};

export default RawMaterialDashboard;
