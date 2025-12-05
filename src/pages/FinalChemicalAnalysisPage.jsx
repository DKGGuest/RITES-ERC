import { useState } from 'react';
import FinalSubmoduleNav from '../components/FinalSubmoduleNav';

const availableLots = [
  { lotNo: 'LOT-001', heatNo: 'HT-2025-A1', ladleAnalysis: { c: 0.55, si: 1.75, mn: 0.90, s: 0.020, p: 0.025 } },
  { lotNo: 'LOT-002', heatNo: 'HT-2025-A2', ladleAnalysis: { c: 0.54, si: 1.80, mn: 0.88, s: 0.018, p: 0.022 } }
];

const FinalChemicalAnalysisPage = ({ onBack, onNavigateSubmodule }) => {
  const [chemValues, setChemValues] = useState({});

  const handleChemChange = (lotNo, element, value) => {
    setChemValues(prev => ({
      ...prev,
      [lotNo]: { ...(prev[lotNo] || {}), [element]: value }
    }));
  };

  const chemicalFields = [
    { id: 'c', label: '% C (Carbon)' },
    { id: 'si', label: '% Si (Silicon)' },
    { id: 'mn', label: '% Mn (Manganese)' },
    { id: 's', label: '% S (Sulphur)' },
    { id: 'p', label: '% P (Phosphorus)' }
  ];

  const pageStyles = `
    .chem-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .chem-section-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 14px;
    }

    .label-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-left: 120px;
      margin-bottom: 6px;
    }

    .label-grid span {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }

    .ladle-row,
    .product-row {
      display: flex;
      gap: 12px;
      margin-bottom: 10px;
      align-items: flex-start;
    }

    .row-label {
      width: 120px;
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      padding-top: 8px;
    }

    .ladle-grid,
    .product-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .ladle-value {
      padding: 8px 10px;
      background: #f1f5f9;
      border: 1px solid #d0d7df;
      border-radius: 6px;
      font-weight: 600;
    }

    .product-input {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 13px;
    }

    @media (max-width: 480px) {
      .label-grid {
        margin-left: 0;
        grid-template-columns: 1fr;
      }
      .row-label {
        width: 100%;
      }
      .ladle-row,
      .product-row {
        flex-direction: column;
      }
      .ladle-grid,
      .product-grid {
        width: 100%;
        grid-template-columns: 1fr;
      }
    }
  `;

  return (
    <div>
      <style>{pageStyles}</style>

      {/* HEADER */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Chemical Analysis</h1>
          <p className="page-subtitle">Final Product Inspection - One section per Lot</p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>← Back</button>
      </div>

      <FinalSubmoduleNav currentSubmodule="final-chemical-analysis" onNavigate={onNavigateSubmodule} />

      {/* LOT SECTIONS */}
      {availableLots.map(lot => (
        <div key={lot.lotNo} className="chem-section">
          <div className="chem-section-title">
            📦 Lot: {lot.lotNo} &nbsp; | &nbsp; Heat No: {lot.heatNo}
          </div>

          {/* CHEMICAL LABEL HEADER */}
          <div className="label-grid">
            {chemicalFields.map(field => (
              <span key={field.id}>{field.label}</span>
            ))}
          </div>

          {/* LADLE VALUES */}
          <div className="ladle-row">
            <div className="row-label">Ladle Values</div>
            <div className="ladle-grid">
              {chemicalFields.map(field => (
                <div key={field.id} className="ladle-value">
                  {lot.ladleAnalysis[field.id]?.toFixed(field.id === 's' || field.id === 'p' ? 3 : 2)}
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT VALUES */}
          <div className="product-row">
            <div className="row-label">Product Values</div>
            <div className="product-grid">
              {chemicalFields.map(field => (
                <input
                  key={field.id}
                  type="number"
                  step="0.001"
                  className="product-input"
                  placeholder="Enter value"
                  value={chemValues[lot.lotNo]?.[field.id] || ''}
                  onChange={e => handleChemChange(lot.lotNo, field.id, e.target.value)}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, gap: 10 }}>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button className="btn btn-primary" onClick={() => alert('Chemical Data Saved!')}>
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default FinalChemicalAnalysisPage;
