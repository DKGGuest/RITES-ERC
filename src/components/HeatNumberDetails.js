import { useState, useCallback } from 'react';

// Responsive styles for Heat Number Details
const heatResponsiveStyles = `
  /* 4-column grid layout for desktop - space efficient */
  .heat-form-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  .heat-form-group {
    display: flex;
    flex-direction: column;
  }

  .heat-form-label {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }

  .heat-form-label .required {
    color: #ef4444;
  }

  .heat-form-input {
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    font-size: 13px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background-color: #ffffff;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .heat-form-input:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
  }

  .heat-form-input:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    color: #374151;
  }

  .heat-form-hint {
    font-size: 11px;
    color: #6b7280;
    margin-top: 2px;
  }

  .heat-card {
    padding: 16px;
    background: #fefce8;
    border-radius: 8px;
    margin-bottom: 12px;
    border: 1px solid #fef08a;
  }

  .heat-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .heat-card-title {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
  }

  .heat-section-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 16px;
  }

  .heat-section-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .heat-auto-fetched-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 500;
    color: #0369a1;
    background-color: #e0f2fe;
    border-radius: 4px;
  }

  /* Tablet: 3 columns */
  @media (max-width: 1024px) {
    .heat-form-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
  }

  /* Mobile: 2 columns */
  @media (max-width: 768px) {
    .heat-form-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .heat-form-input {
      font-size: 14px;
      min-height: 44px;
      padding: 10px 12px;
    }

    .heat-card {
      padding: 14px;
    }
  }

  /* Small mobile: 1 column */
  @media (max-width: 480px) {
    .heat-form-grid {
      grid-template-columns: 1fr;
    }

    .heat-form-input {
      font-size: 16px;
      min-height: 48px;
      padding: 12px 14px;
    }

    .heat-form-label {
      font-size: 13px;
    }

    .heat-section-title {
      font-size: 16px;
    }
  }
`;

/**
 * Heat Number Details Component
 * Displays heat data auto-fetched from vendor call with Color Code as manual entry
 */
const HeatNumberDetails = ({ heats: propHeats, onHeatsChange }) => {
  // Mock data simulating vendor call data - will be replaced with API data
  const [heats, setHeats] = useState(propHeats || [
    {
      id: 1,
      heatNo: 'H001',
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

  // Update color code (only manual field)
  const updateColorCode = useCallback((heatIndex, value) => {
    setHeats(prev => {
      const updated = [...prev];
      updated[heatIndex] = { ...updated[heatIndex], colorCode: value };
      if (onHeatsChange) onHeatsChange(updated);
      return updated;
    });
  }, [onHeatsChange]);

  return (
    <div style={{ marginTop: '24px' }}>
      <style>{heatResponsiveStyles}</style>

      <div className="heat-section-header">
        <h4 className="heat-section-title">Heat Number Details</h4>
        {/* <span className="heat-auto-fetched-badge">📥 Auto-fetched from Vendor Call</span> */}
      </div>

      {heats.map((heat, heatIndex) => (
        <div key={heat.id} className="heat-card">
          <div className="heat-card-header">
            <span className="heat-card-title">Heat {heatIndex + 1}: {heat.heatNo}</span>
          </div>

          {/* All fields in compact 4-column grid */}
          <div className="heat-form-grid">
            {/* Row 1: Heat No, TC No, TC Date, Manufacturer */}
            <div className="heat-form-group">
              <label className="heat-form-label">Heat No.</label>
              <input type="text" className="heat-form-input" value={heat.heatNo} disabled />
            </div>
            <div className="heat-form-group">
              <label className="heat-form-label">TC No.</label>
              <input type="text" className="heat-form-input" value={heat.tcNo} disabled />
            </div>
            <div className="heat-form-group">
              <label className="heat-form-label">TC Date</label>
              <input type="text" className="heat-form-input" value={heat.tcDate} disabled />
            </div>
            <div className="heat-form-group">
              <label className="heat-form-label">Manufacturer Name</label>
              <input type="text" className="heat-form-input" value={heat.manufacturerName} disabled />
            </div>

            {/* Row 2: Invoice Number, Invoice Date, Sub PO Number, Sub PO Date */}
            <div className="heat-form-group">
              <label className="heat-form-label">Invoice Number</label>
              <input type="text" className="heat-form-input" value={heat.invoiceNumber} disabled />
            </div>
            <div className="heat-form-group">
              <label className="heat-form-label">Invoice Date</label>
              <input type="text" className="heat-form-input" value={heat.invoiceDate} disabled />
            </div>
            <div className="heat-form-group">
              <label className="heat-form-label">Sub PO Number</label>
              <input type="text" className="heat-form-input" value={heat.subPoNumber} disabled />
            </div>
            <div className="heat-form-group">
              <label className="heat-form-label">Sub PO Date</label>
              <input type="text" className="heat-form-input" value={heat.subPoDate} disabled />
            </div>

            {/* Row 3: Sub PO Qty, Total Value, TC Qty, Offered Qty */}
            <div className="heat-form-group">
              <label className="heat-form-label">Sub PO Qty (MT)</label>
              <input type="text" className="heat-form-input" value={heat.subPoQty} disabled />
            </div>
            <div className="heat-form-group">
              <label className="heat-form-label">Total Value of PO</label>
              <input type="text" className="heat-form-input" value={heat.totalValueOfPo} disabled />
            </div>
            <div className="heat-form-group">
              <label className="heat-form-label">TC Quantity (MT)</label>
              <input type="text" className="heat-form-input" value={heat.tcQuantity} disabled />
            </div>
            <div className="heat-form-group">
              <label className="heat-form-label">Offered Qty (MT)</label>
              <input type="text" className="heat-form-input" value={heat.offeredQty} disabled />
            </div>

            {/* Row 4: Color Code (MANUAL ENTRY) */}
            <div className="heat-form-group">
              <label className="heat-form-label">Color Code <span className="required">*</span></label>
              <input
                type="text"
                className="heat-form-input"
                value={heat.colorCode}
                onChange={(e) => updateColorCode(heatIndex, e.target.value)}
                placeholder="Enter color code"
                style={{ backgroundColor: '#ffffff' }}
                required
              />
              <span className="heat-form-hint">Manual entry required</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeatNumberDetails;
