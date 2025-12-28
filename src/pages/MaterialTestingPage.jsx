import { useState, useEffect, useCallback } from 'react';
import RawMaterialSubmoduleNav from '../components/RawMaterialSubmoduleNav';
import './MaterialTestingPage.css';

const STORAGE_KEY = 'material_testing_draft_data';
const CALIBRATION_STORAGE_KEY = 'calibration_draft_data';

/**
 * Specification limits for raw material testing
 * Based on validation rules from specification document
 * Note: C, Si, Mn also have ±tolerance from ladle analysis (to be validated when ladle data available)
 */
const SPEC_LIMITS = {
  c: { min: 0.50, max: 0.60 },      // %C: 0.5-0.6 (also ±0.03 from ladle analysis)
  si: { min: 1.50, max: 2.00 },     // %Si: 1.5-2.0 (also ±0.04 from ladle analysis)
  mn: { min: 0.80, max: 1.00 },     // %Mn: 0.8-1.0 (also ±0.05 from ladle analysis)
  p: { min: 0, max: 0.030 },        // %P: ≤0.030 max
  s: { min: 0, max: 0.030 },        // %S: ≤0.030 max
  grainSize: { min: 6, max: 999 },  // Grain Size: ≥6
  decarb: { min: 0, max: 0.25 },    // Depth of Decarb: ≤0.25mm
  inclA: { min: 0, max: 2.0 },      // Inclusion A: ≤2.0
  inclB: { min: 0, max: 2.0 },      // Inclusion B: ≤2.0
  inclC: { min: 0, max: 2.0 },      // Inclusion C: ≤2.0
  inclD: { min: 0, max: 2.0 },      // Inclusion D: ≤2.0
  // Note: Hardness (HRC) has no specific range - just Required, Float
};

/**
 * Get validation status for a value based on specification limits
 * Returns 'pass' (green), 'fail' (red), or '' (no color)
 */
const getValueStatus = (field, value) => {
  if (value === '' || value === null || value === undefined) return '';

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '';

  const limits = SPEC_LIMITS[field];
  if (!limits) return '';

  // Check if value is within acceptable range
  if (numValue >= limits.min && numValue <= limits.max) {
    return 'pass';
  }
  return 'fail';
};

/**
 * Material Testing Page - Raw Material Sub-module
 * Chemical Analysis & Mechanical Properties (2 samples per Heat)
 */
const MaterialTestingPage = ({ onBack, heats = [], onNavigateSubmodule, inspectionCallNo = '' }) => {
  const [activeHeatTab, setActiveHeatTab] = useState(0);

  // Load draft data from localStorage
  const loadDraftData = useCallback(() => {
    const storageKey = `${STORAGE_KEY}_${inspectionCallNo}`;
    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft);
      } catch (e) {
        console.error('Error parsing draft data:', e);
      }
    }
    return null;
  }, [inspectionCallNo]);

  // Material testing state
  const [materialData, setMaterialData] = useState(() => {
    const draft = loadDraftData();
    if (draft?.materialData) {
      return draft.materialData;
    }
    return heats.map(() => ({
      samples: [
        { c: '', si: '', mn: '', p: '', s: '', grainSize: '', inclTypeA: '', inclA: '', inclTypeB: '', inclB: '', inclTypeC: '', inclC: '', inclTypeD: '', inclD: '', hardness: '', decarb: '', remarks: '' },
        { c: '', si: '', mn: '', p: '', s: '', grainSize: '', inclTypeA: '', inclA: '', inclTypeB: '', inclB: '', inclTypeC: '', inclC: '', inclTypeD: '', inclD: '', hardness: '', decarb: '', remarks: '' }
      ]
    }));
  });

  // Auto-save to localStorage
  useEffect(() => {
    const storageKey = `${STORAGE_KEY}_${inspectionCallNo}`;
    localStorage.setItem(storageKey, JSON.stringify({ materialData }));
  }, [materialData, inspectionCallNo]);

  const updateMaterialField = (heatIndex, sampleIndex, field, value) => {
    setMaterialData(prev => {
      const next = [...prev];
      next[heatIndex] = { ...next[heatIndex], samples: [...next[heatIndex].samples] };
      next[heatIndex].samples[sampleIndex] = { ...next[heatIndex].samples[sampleIndex], [field]: value };
      return next;
    });
  };

  const currentHeat = heats[activeHeatTab] || {};
  const heatIndex = activeHeatTab;

  // Load ladle values from calibration draft data
  const getLadleValues = useCallback(() => {
    const calStorageKey = `${CALIBRATION_STORAGE_KEY}_${inspectionCallNo}`;
    const calDraft = localStorage.getItem(calStorageKey);
    if (calDraft) {
      try {
        const parsed = JSON.parse(calDraft);
        if (parsed.heats && Array.isArray(parsed.heats)) {
          return parsed.heats;
        }
      } catch (e) {
        console.error('Error parsing calibration data:', e);
      }
    }
    return [];
  }, [inspectionCallNo]);

  const ladleHeats = getLadleValues();
  const currentLadleHeat = ladleHeats[heatIndex] || {};

  // Format ladle value for display
  const formatLadleValue = (value) => {
    if (value === '' || value === null || value === undefined) return '-';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '-';
    return numValue.toFixed(3);
  };

  return (
    <div className="material-testing-page-container">
      <div className="material-testing-page-header">
        <h1 className="material-testing-page-title">🧪 Material Testing</h1>
        <button className="material-testing-back-btn" onClick={onBack}>
          ← Back to Raw Material Dashboard
        </button>
      </div>

      <RawMaterialSubmoduleNav
        currentSubmodule="material-testing"
        onNavigate={onNavigateSubmodule}
      />

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Material Testing (2 samples per Heat)</h3>
          <p className="card-subtitle">Chemical Analysis &amp; Mechanical Properties</p>
        </div>
        <div className="alert alert-info" style={{ marginBottom: '16px' }}>
          ℹ️ Calibration status of testing instruments is verified and valid
        </div>

        {/* Specification Limits Info Box */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px'
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#0369a1', fontSize: '0.9rem' }}>📋 Specification Limits (Green = Pass, Red = Fail)</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: '#0c4a6e' }}>
            <span><strong>%C:</strong> 0.50-0.60</span>
            <span><strong>%Si:</strong> 1.50-2.00</span>
            <span><strong>%Mn:</strong> 0.80-1.00</span>
            <span><strong>%P:</strong> ≤0.030</span>
            <span><strong>%S:</strong> ≤0.030</span>
            <span><strong>Grain Size:</strong> ≥6</span>
            <span><strong>Decarb:</strong> ≤0.25mm</span>
            <span><strong>Inclusions (A/B/C/D):</strong> ≤2.0 each</span>
          </div>
        </div>

        {/* Heat Toggle */}
        <div className="material-heat-toggle">
          <span className="heat-toggle-label">Select Heat:</span>
          <div className="heat-toggle-buttons">
            {heats.map((heat, idx) => (
              <button
                key={idx}
                type="button"
                className={`heat-toggle-btn ${idx === activeHeatTab ? 'active' : ''}`}
                onClick={() => setActiveHeatTab(idx)}
              >
                Heat {heat.heatNo || `#${idx + 1}`}
              </button>
            ))}
          </div>
        </div>

        {heats.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px' }}>Heat: {currentHeat.heatNo || `#${heatIndex + 1}`} — Material Testing (2 samples)</h4>

            {/* Chemical Composition Table */}
            <div className="material-testing-table-wrapper" style={{ marginBottom: '24px' }}>
              <table className="material-testing-table">
                <thead>
                  <tr>
                    <th>Sample</th>
                    <th>%C</th>
                    <th>%Si</th>
                    <th>%Mn</th>
                    <th>%P</th>
                    <th>%S</th>
                    <th>Grain Size</th>
                    <th>Hardness (HRC)</th>
                    <th>Decarb (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Ladle Values Row - Reference from Calibration */}
                  <tr style={{ background: '#fffbeb' }}>
                    <td style={{ fontWeight: 600, color: '#92400e' }}>Ladle Values</td>
                    <td style={{ color: '#92400e', fontWeight: 500 }}>{formatLadleValue(currentLadleHeat.percentC)}</td>
                    <td style={{ color: '#92400e', fontWeight: 500 }}>{formatLadleValue(currentLadleHeat.percentSi)}</td>
                    <td style={{ color: '#92400e', fontWeight: 500 }}>{formatLadleValue(currentLadleHeat.percentMn)}</td>
                    <td style={{ color: '#92400e', fontWeight: 500 }}>{formatLadleValue(currentLadleHeat.percentP)}</td>
                    <td style={{ color: '#92400e', fontWeight: 500 }}>{formatLadleValue(currentLadleHeat.percentS)}</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                  </tr>
                  {[0, 1].map(sampleIndex => {
                    const sample = materialData[heatIndex]?.samples[sampleIndex] || {};
                    return (
                      <tr key={sampleIndex}>
                        <td data-label="Sample"><strong>Sample {sampleIndex + 1}</strong></td>
                        <td data-label="%C">
                          <input type="number" step="0.01" className={`form-control ${getValueStatus('c', sample.c)}`} value={sample.c} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'c', e.target.value)} />
                        </td>
                        <td data-label="%Si">
                          <input type="number" step="0.01" className={`form-control ${getValueStatus('si', sample.si)}`} value={sample.si} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'si', e.target.value)} />
                        </td>
                        <td data-label="%Mn">
                          <input type="number" step="0.01" className={`form-control ${getValueStatus('mn', sample.mn)}`} value={sample.mn} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'mn', e.target.value)} />
                        </td>
                        <td data-label="%P">
                          <input type="number" step="0.01" className={`form-control ${getValueStatus('p', sample.p)}`} value={sample.p} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'p', e.target.value)} />
                        </td>
                        <td data-label="%S">
                          <input type="number" step="0.01" className={`form-control ${getValueStatus('s', sample.s)}`} value={sample.s} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 's', e.target.value)} />
                        </td>
                        <td data-label="Grain Size">
                          <input type="number" step="1" className={`form-control ${getValueStatus('grainSize', sample.grainSize)}`} value={sample.grainSize} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'grainSize', e.target.value)} />
                        </td>
                        <td data-label="Hardness">
                          <input type="number" step="1" className={`form-control ${getValueStatus('hardness', sample.hardness)}`} value={sample.hardness} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'hardness', e.target.value)} />
                        </td>
                        <td data-label="Decarb">
                          <input type="number" step="0.01" className={`form-control ${getValueStatus('decarb', sample.decarb)}`} value={sample.decarb} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'decarb', e.target.value)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Inclusion Rating Section */}
            <div className="inclusion-section">
              <h5 className="inclusion-section-title">Inclusion Rating (Type)</h5>
              {[0, 1].map(sampleIndex => {
                const sample = materialData[heatIndex]?.samples[sampleIndex] || {};
                return (
                  <div key={sampleIndex} className="inclusion-sample-card">
                    <div className="inclusion-sample-label">Sample {sampleIndex + 1}</div>
                    <div className="inclusion-rating-grid">
                      {['A', 'B', 'C', 'D'].map(type => {
                        const fieldName = `incl${type}`;
                        const fieldValue = sample[fieldName];
                        return (
                          <div key={type} className="inclusion-rating-item">
                            <label className="inclusion-rating-label">
                              Inclusion ({type}) <span className="required-star">*</span>
                            </label>
                            <div className="inclusion-rating-inputs">
                              <select className="form-control" value={sample[`inclType${type}`]} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, `inclType${type}`, e.target.value)}>
                                <option value="">Type</option>
                                <option value="Thick">Thick</option>
                                <option value="Thin">Thin</option>
                              </select>
                              <input
                                type="number"
                                step="0.1"
                                className={`form-control ${getValueStatus(fieldName, fieldValue)}`}
                                max="2.0"
                                value={fieldValue}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, fieldName, e.target.value)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialTestingPage;

