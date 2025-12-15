import { useState, useMemo, useEffect, useCallback } from 'react';
import Tabs from '../components/Tabs';
import './RawMaterialDimensionalPage.css';

/**
 * Dimensional Check & Material Testing Page - Raw Material Sub-module
 * Handles dimensional samples, material testing, and packing verification
 */
const RawMaterialDimensionalPage = ({ onBack, heats = [], productModel = 'ERC-12' }) => {
  const [activeTab, setActiveTab] = useState('dimensional');
  const [activeHeatTab, setActiveHeatTab] = useState(0);

  const tabs = [
    { id: 'dimensional', label: 'Dimensional Check' },
    { id: 'material', label: 'Material Testing' },
    { id: 'packing', label: 'Packing & Storage Verification' },
  ];

  // Per-heat Dimensional state (20 samples per heat)
  const [heatDimData, setHeatDimData] = useState(() => (
    heats.map(() => ({
      dimSamples: Array.from({ length: 20 }).map(() => ({ diameter: '' })),
    }))
  ));

  // Keep heatDimData in sync when heats change
  useEffect(() => {
    setHeatDimData(prev => {
      const next = heats.map((_, idx) => prev[idx] || {
        dimSamples: Array.from({ length: 20 }).map(() => ({ diameter: '' })),
      });
      if (activeHeatTab >= heats.length) setActiveHeatTab(Math.max(0, heats.length - 1));
      return next;
    });
  }, [heats, activeHeatTab]);

  const handleDimSampleChange = useCallback((idx, value) => {
    setHeatDimData(prev => {
      const next = [...prev];
      const hd = { ...next[activeHeatTab] };
      const samples = [...hd.dimSamples];
      samples[idx] = { ...samples[idx], diameter: value };
      hd.dimSamples = samples;
      next[activeHeatTab] = hd;
      return next;
    });
  }, [activeHeatTab]);

  // Standard diameter derived from product model
  const standardDiameter = useMemo(() => {
    const modelNum = productModel.match(/\d+/)?.[0];
    const parsed = modelNum ? parseFloat(modelNum) : NaN;
    return Number.isNaN(parsed) ? '' : parsed;
  }, [productModel]);

  // Material testing state
  const [materialData, setMaterialData] = useState(() => heats.map(() => ({
    samples: [
      { c: '', si: '', mn: '', p: '', s: '', grainSize: '', inclTypeA: '', inclA: '', inclTypeB: '', inclB: '', inclTypeC: '', inclC: '', inclTypeD: '', inclD: '', hardness: '', decarb: '', remarks: '' },
      { c: '', si: '', mn: '', p: '', s: '', grainSize: '', inclTypeA: '', inclA: '', inclTypeB: '', inclB: '', inclTypeC: '', inclC: '', inclTypeD: '', inclD: '', hardness: '', decarb: '', remarks: '' }
    ]
  })));

  const updateMaterialField = (heatIndex, sampleIndex, field, value) => {
    setMaterialData(prev => {
      const next = [...prev];
      next[heatIndex] = { ...next[heatIndex], samples: [...next[heatIndex].samples] };
      next[heatIndex].samples[sampleIndex] = { ...next[heatIndex].samples[sampleIndex], [field]: value };
      return next;
    });
  };

  // Packing & Storage Verification state
  const [packingData, setPackingData] = useState({
    isPaintMarkingAvailable: false,
    paintMarkingRemarks: '',
    areBarStoredHeatWise: false,
    areBarsBundled: false,
    isMetalTagPresent: false,
    packingRemarks: '',
  });

  const [packingErrors, setPackingErrors] = useState({
    paintMarkingRemarks: false,
    packingRemarks: false,
  });

  const [packingSubmitted, setPackingSubmitted] = useState(false);

  const handlePackingChange = (field, value) => {
    setPackingData(prev => ({ ...prev, [field]: value }));
    if (field === 'paintMarkingRemarks' || field === 'packingRemarks') {
      if (value.trim()) {
        setPackingErrors(prev => ({ ...prev, [field]: false }));
      }
    }
  };

  const validatePackingForm = () => {
    const errors = {
      paintMarkingRemarks: !packingData.paintMarkingRemarks.trim(),
      packingRemarks: !packingData.packingRemarks.trim(),
    };
    setPackingErrors(errors);
    return !errors.paintMarkingRemarks && !errors.packingRemarks;
  };

  const handlePackingSubmit = () => {
    if (validatePackingForm()) {
      setPackingSubmitted(true);
      const jsonOutput = {
        isPaintMarkingAvailable: packingData.isPaintMarkingAvailable,
        paintMarkingRemarks: packingData.paintMarkingRemarks,
        areBarStoredHeatWise: packingData.areBarStoredHeatWise,
        areBarsBundled: packingData.areBarsBundled,
        isMetalTagPresent: packingData.isMetalTagPresent,
        packingRemarks: packingData.packingRemarks,
      };
      console.log('Packing & Storage Verification Data:', JSON.stringify(jsonOutput, null, 2));
      alert('Packing & Storage data saved successfully!\n\nCheck console for JSON output.');
      return jsonOutput;
    }
    return null;
  };

  return (
    <div className="dimensional-page-container">
      <div className="dimensional-page-header">
        <h1 className="dimensional-page-title">📐 Dimensional Check & Material Testing</h1>
        <button className="dimensional-back-btn" onClick={onBack}>
          ← Back to Sub Module Session
        </button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Dimensional Check Tab */}
      {activeTab === 'dimensional' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Dimensional Check (20 samples per Heat)</h3>
            <p className="card-subtitle">Check dimensional accuracy of raw material bars</p>
          </div>

          {/* Heat selector buttons */}
          <div className="dim-heat-selector">
            {heats.map((h, idx) => (
              <button
                key={idx}
                type="button"
                className={idx === activeHeatTab ? 'btn btn-primary' : 'btn btn-outline'}
                onClick={() => setActiveHeatTab(idx)}
              >
                {`Heat ${h.heatNo || `#${idx + 1}`}`}
              </button>
            ))}
          </div>

          {/* Standard Diameter Info */}
          <div className="dim-form-grid">
            <div className="dim-form-group">
              <label className="dim-form-label">Product Model</label>
              <input type="text" className="dim-form-input" value={productModel} disabled />
            </div>
            <div className="dim-form-group">
              <label className="dim-form-label">Standard Rod Diameter (mm)</label>
              <input type="text" className="dim-form-input" value={standardDiameter || 'NA'} disabled />
            </div>
          </div>

          {/* Dimensional Samples Grid */}
          <h4 style={{ marginBottom: '16px', marginTop: '20px' }}>Dimensional Check (20 samples)</h4>
          <div className="dimensional-samples-grid">
            {(() => {
              const hd = heatDimData[activeHeatTab] || {};
              const samples = hd.dimSamples || [];
              return samples.map((s, idx) => (
                <div key={idx} className="dim-form-group dimensional-sample-card">
                  <label className="dim-form-label" style={{ marginBottom: '8px' }}>
                    Sample {idx + 1}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="dim-form-input"
                    value={s.diameter}
                    onChange={(e) => handleDimSampleChange(idx, e.target.value)}
                    placeholder="Bar Diameter (mm)"
                  />
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Material Testing Tab */}
      {activeTab === 'material' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Material Testing (2 samples per Heat)</h3>
            <p className="card-subtitle">Chemical Analysis &amp; Mechanical Properties - Raw Material Specific</p>
          </div>
          <div className="alert alert-info" style={{ marginBottom: '24px' }}>
            ℹ️ Calibration status of testing instruments is verified and valid
          </div>

          {heats.map((heat, heatIndex) => (
            <div key={heatIndex} style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '12px' }}>Heat: {heat.heatNo || `#${heatIndex + 1}`} — Material Testing (2 samples)</h4>

              {/* Chemical Composition & Mechanical Properties Table */}
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
                    {[0, 1].map(sampleIndex => {
                      const sample = materialData[heatIndex]?.samples[sampleIndex] || {};
                      return (
                        <tr key={sampleIndex}>
                          <td data-label="Sample"><strong>Sample {sampleIndex + 1}</strong></td>
                          <td data-label="%C (Carbon)">
                            <input type="number" step="0.01" className="form-control" required
                              value={sample.c} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'c', e.target.value)} />
                          </td>
                          <td data-label="%Si (Silicon)">
                            <input type="number" step="0.01" className="form-control" required
                              value={sample.si} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'si', e.target.value)} />
                          </td>
                          <td data-label="%Mn (Manganese)">
                            <input type="number" step="0.01" className="form-control" required
                              value={sample.mn} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'mn', e.target.value)} />
                          </td>
                          <td data-label="%P (Phosphorus)">
                            <input type="number" step="0.01" className="form-control" required
                              value={sample.p} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'p', e.target.value)} />
                          </td>
                          <td data-label="%S (Sulphur)">
                            <input type="number" step="0.01" className="form-control" required
                              value={sample.s} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 's', e.target.value)} />
                          </td>
                          <td data-label="Grain Size (≥6)">
                            <input type="number" step="1" className="form-control" required min="6"
                              value={sample.grainSize} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'grainSize', e.target.value)}
                              placeholder="≥6" />
                          </td>
                          <td data-label="Hardness (HRC)">
                            <input type="number" step="1" className="form-control" required
                              value={sample.hardness} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'hardness', e.target.value)} />
                          </td>
                          <td data-label="Decarb (≤0.25mm)">
                            <input type="number" step="0.01" className="form-control" required max="0.25"
                              value={sample.decarb} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'decarb', e.target.value)}
                              placeholder="≤0.25" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Inclusion Rating Section */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ marginBottom: '16px', color: '#334155' }}>Inclusion Rating (Type)</h5>
                {[0, 1].map(sampleIndex => {
                  const sample = materialData[heatIndex]?.samples[sampleIndex] || {};
                  return (
                    <div key={sampleIndex} style={{ marginBottom: sampleIndex === 0 ? '16px' : '0', padding: '12px', background: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontWeight: '600', marginBottom: '12px', color: '#475569' }}>Sample {sampleIndex + 1}</div>
                      <div className="inclusion-rating-grid">
                        {['A', 'B', 'C', 'D'].map(type => (
                          <div key={type} className="inclusion-rating-item">
                            <label className="inclusion-rating-label">
                              Inclusion Rating ({type}) <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div className="inclusion-rating-inputs">
                              <select className="form-control" required
                                value={sample[`inclType${type}`]} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, `inclType${type}`, e.target.value)}>
                                <option value="">Type</option>
                                <option value="Thick">Thick</option>
                                <option value="Thin">Thin</option>
                              </select>
                              <input type="number" step="0.1" className="form-control" required max="2.0"
                                value={sample[`incl${type}`]} onChange={(e) => updateMaterialField(heatIndex, sampleIndex, `incl${type}`, e.target.value)}
                                placeholder="≤2.0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Packing & Storage Verification Tab */}
      {activeTab === 'packing' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📦 Packing & Storage Verification</h3>
            <p className="card-subtitle">Verify packing conditions and storage compliance</p>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="packing-checkbox-item">
              <input type="checkbox" id="isPaintMarkingAvailable" checked={packingData.isPaintMarkingAvailable}
                onChange={(e) => handlePackingChange('isPaintMarkingAvailable', e.target.checked)} />
              <label htmlFor="isPaintMarkingAvailable">Is Paint Marking available at end of Bars</label>
            </div>

            <div className={`packing-remarks-field ${packingErrors.paintMarkingRemarks ? 'error' : ''}`}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                Paint Marking at End of Bars – Remarks <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea className="form-control" rows="3" value={packingData.paintMarkingRemarks}
                onChange={(e) => handlePackingChange('paintMarkingRemarks', e.target.value)}
                placeholder="Enter remarks about paint marking..."
                style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '6px', resize: 'vertical' }} required />
              {packingErrors.paintMarkingRemarks && <span style={{ color: '#ef4444', fontSize: '12px' }}>⚠ This field is required</span>}
            </div>

            <div className="packing-checkbox-item">
              <input type="checkbox" id="areBarStoredHeatWise" checked={packingData.areBarStoredHeatWise}
                onChange={(e) => handlePackingChange('areBarStoredHeatWise', e.target.checked)} />
              <label htmlFor="areBarStoredHeatWise">Are Bars stored in heat wise stacks</label>
            </div>

            <div className="packing-checkbox-item">
              <input type="checkbox" id="areBarsBundled" checked={packingData.areBarsBundled}
                onChange={(e) => handlePackingChange('areBarsBundled', e.target.checked)} />
              <label htmlFor="areBarsBundled">Are bars bundled with binding wires &amp; packing strips at minimum 3 locations having manufacturer's seal/name/logo/code</label>
            </div>

            <div className="packing-checkbox-item">
              <input type="checkbox" id="isMetalTagPresent" checked={packingData.isMetalTagPresent}
                onChange={(e) => handlePackingChange('isMetalTagPresent', e.target.checked)} />
              <label htmlFor="isMetalTagPresent">Is Metal Tag present with PO Number, Heat Number, Date, Grade, Size &amp; Length</label>
            </div>

            <div className={`packing-remarks-field ${packingErrors.packingRemarks ? 'error' : ''}`}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                Packing Remarks <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea className="form-control" rows="3" value={packingData.packingRemarks}
                onChange={(e) => handlePackingChange('packingRemarks', e.target.value)}
                placeholder="Enter packing remarks..."
                style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '6px', resize: 'vertical' }} required />
              {packingErrors.packingRemarks && <span style={{ color: '#ef4444', fontSize: '12px' }}>⚠ This field is required</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button type="button" onClick={handlePackingSubmit} className="btn btn-primary"
                style={{ padding: '12px 32px', fontSize: '15px', fontWeight: '600' }}>
                Save Packing & Storage Data
              </button>
            </div>

            {packingSubmitted && (
              <div style={{ padding: '12px 16px', background: '#d1fae5', border: '1px solid #10b981', borderRadius: '8px', color: '#065f46' }}>
                ✅ Packing & Storage Verification data saved successfully!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RawMaterialDimensionalPage;

