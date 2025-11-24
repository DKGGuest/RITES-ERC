import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MOCK_PO_DATA } from '../data/mockData';
import { formatDate, calculateDaysLeft } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';
import Tabs from '../components/Tabs';
import FormField from '../components/FormField';
import { CALIBRATION_DATA } from '../data/mockData';

const RawMaterialDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('visual');

  // Pre-Inspection Data Entry State
  const [sourceOfRawMaterial, setSourceOfRawMaterial] = useState('');
  const [heats, setHeats] = useState([
    { heatNo: 'H001', weight: '2.5', colorCode: 'RED' },
    { heatNo: 'H002', weight: '3.0', colorCode: 'BLUE' }
  ]);
  const [numberOfBundles, setNumberOfBundles] = useState('10');
  const [testCertificates, setTestCertificates] = useState([
    { certificateNo: 'TC-2025-001', heatNo: 'H001', certificateDate: '2025-11-10' }
  ]);

  // Visual Defects State (exact order required by Excel)
  const defectList = useMemo(() => ([
    'No Defect',
    'Distortion',
    'Twist',
    'Kink',
    'Not Straight',
    'Fold',
    'Lap',
    'Crack',
    'Pit',
    'Groove',
    'Excessive Scaling',
    'Internal Defect (Piping, Segregation)'
  ]), []);
  // Per-heat Visual & Dimensional state
  const [activeHeatTab, setActiveHeatTab] = useState(0);

  const [heatVisualData, setHeatVisualData] = useState(() => (
    heats.map(() => ({
      selectedDefects: defectList.reduce((acc, d) => { acc[d] = false; return acc; }, {}),
      defectCounts: defectList.reduce((acc, d) => { acc[d] = ''; return acc; }, {}),
      dimSamples: Array.from({ length: 20 }).map(() => ({ diameter: '' })),
    }))
  ));

  // Keep heatVisualData in sync when heats change
  useEffect(() => {
    setHeatVisualData(prev => {
      const next = heats.map((h, idx) => prev[idx] || {
        selectedDefects: defectList.reduce((acc, d) => { acc[d] = false; return acc; }, {}),
        defectCounts: defectList.reduce((acc, d) => { acc[d] = ''; return acc; }, {}),
        dimSamples: Array.from({ length: 20 }).map(() => ({ diameter: '' })),
      });
      // ensure activeHeatTab is within bounds
      if (activeHeatTab >= next.length) setActiveHeatTab(Math.max(0, next.length - 1));
      return next;
    });
  }, [heats, activeHeatTab, defectList]);

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

  const diameterConfig = useMemo(() => {
    if (productModel === 'MK-V') {
      return { standard: 23.0, min: 22.81, max: 23.23 };
    }
    // default to MK-III
    return { standard: 20.64, min: 20.47, max: 20.84 };
  }, [productModel]);

  // Validation helpers for defects and dimensional samples
  // parseInteger removed (unused) to satisfy lint rules

  const parseFloatStrict = (v) => {
    if (v === '' || v === null || v === undefined) return NaN;
    const n = Number(String(v).trim());
    return Number.isFinite(n) ? n : NaN;
  };

  const updateHeatVisual = (heatIndex, updater) => {
    setHeatVisualData(prev => prev.map((h, idx) => idx === heatIndex ? updater(h) : h));
  };

  const handleDefectToggle = (defect, heatIndex = activeHeatTab) => {
    updateHeatVisual(heatIndex, prev => {
      const next = { ...prev };
      const nextSelected = { ...prev.selectedDefects };
      if (defect === 'No Defect') {
        const newVal = !nextSelected['No Defect'];
        defectList.forEach(d => { nextSelected[d] = (d === 'No Defect') ? newVal : false; });
      } else {
        nextSelected['No Defect'] = false;
        nextSelected[defect] = !nextSelected[defect];
      }
      next.selectedDefects = nextSelected;
      return next;
    });
  };

  const handleDefectCountChange = (defect, value, heatIndex = activeHeatTab) => {
    updateHeatVisual(heatIndex, prev => ({ ...prev, defectCounts: { ...prev.defectCounts, [defect]: value } }));
  };

  const handleDimSampleChange = (index, value, heatIndex = activeHeatTab) => {
    updateHeatVisual(heatIndex, prev => ({ ...prev, dimSamples: prev.dimSamples.map((s, i) => i === index ? { diameter: value } : s) }));
  };

  const validateDefectField = (defect, heatIndex = activeHeatTab) => {
    const hv = heatVisualData[heatIndex] || {};
    const selected = hv.selectedDefects || {};
    const counts = hv.defectCounts || {};
    if (!selected[defect] || defect === 'No Defect') return { valid: true };
    const v = counts[defect];
    if (v === '' || v === null || v === undefined) return { valid: false, message: 'Required' };
    const n = Number(String(v).trim());
    if (!Number.isFinite(n) || !Number.isInteger(n)) return { valid: false, message: 'Must be an integer' };
    if (n < 0) return { valid: false, message: 'Must be ≥ 0' };
    return { valid: true };
  };

  const validateDimSample = useCallback((sample) => {
    const v = sample.diameter;
    if (v === '' || v === null || v === undefined) return { valid: false, message: 'Required' };
    const n = parseFloatStrict(v);
    if (Number.isNaN(n)) return { valid: false, message: 'Invalid number' };
    if (n < diameterConfig.min || n > diameterConfig.max) return { valid: false, message: `Out of range (${diameterConfig.min}-${diameterConfig.max})` };
    return { valid: true };
  }, [diameterConfig]);

  const visualTotals = useMemo(() => {
    const hv = heatVisualData[activeHeatTab] || {};
    const selected = hv.selectedDefects || {};
    const counts = hv.defectCounts || {};
    let sum = 0;
    let anyInvalid = false;
    defectList.forEach(d => {
      if (d === 'No Defect') return;
      if (selected[d]) {
        const v = Number(String(counts[d]).trim());
        if (!Number.isFinite(v)) anyInvalid = true;
        else sum += v;
      }
    });
    return { sum, anyInvalid };
  }, [heatVisualData, activeHeatTab, defectList]);

  const visualRejected = visualTotals.sum > 1;

  const dimensionalResults = useMemo(() => {
    const hv = heatVisualData[activeHeatTab] || {};
    const samples = hv.dimSamples || [];
    let invalidCount = 0;
    const sampleResults = samples.map(s => {
      const res = validateDimSample(s);
      if (!res.valid) invalidCount += 1;
      return res;
    });
    const rejected = invalidCount > 1;
    return { invalidCount, rejected, sampleResults };
  }, [heatVisualData, activeHeatTab, validateDimSample]);

  const overallRejected = visualRejected || dimensionalResults.rejected;

  const tabs = [
    { id: 'calibration', label: 'Calibration & Documents' },
    { id: 'visual', label: 'Visual & Dimensional' },
    { id: 'material', label: 'Material Testing' },
    { id: 'summary', label: 'Summary / Reports' },
  ];

  // Material testing state: per-heat, two samples each
  const [materialData, setMaterialData] = useState(() => heats.map(() => ({
    samples: [
      { c: '', si: '', mn: '', p: '', s: '', grainSize: '', inclA: '', inclB: '', inclC: '', inclD: '', hardness: '', decarb: '', remarks: '' },
      { c: '', si: '', mn: '', p: '', s: '', grainSize: '', inclA: '', inclB: '', inclC: '', inclD: '', hardness: '', decarb: '', remarks: '' }
    ]
  })));

  // Keep materialData in sync when heats change (add/remove)
  useEffect(() => {
    setMaterialData(prev => {
      const next = heats.map((h, idx) => prev[idx] || {
        samples: [
          { c: '', si: '', mn: '', p: '', s: '', grainSize: '', inclA: '', inclB: '', inclC: '', inclD: '', hardness: '', decarb: '', remarks: '' },
          { c: '', si: '', mn: '', p: '', s: '', grainSize: '', inclA: '', inclB: '', inclC: '', inclD: '', hardness: '', decarb: '', remarks: '' }
        ]
      });
      return next;
    });
  }, [heats]);

  // Validation helpers
  const parseNumber = (v) => {
    if (v === null || v === undefined || v === '') return NaN;
    const n = Number(String(v).trim());
    return Number.isFinite(n) ? n : NaN;
  };

  const validateSample = (sample) => {
    const errors = {};
    const c = parseNumber(sample.c);
    if (Number.isNaN(c) || c < 0.5 || c > 0.6) errors.c = '%C must be between 0.50 and 0.60';

    const si = parseNumber(sample.si);
    if (Number.isNaN(si) || si < 1.5 || si > 2.0) errors.si = '%Si must be between 1.50 and 2.00';

    const mn = parseNumber(sample.mn);
    if (Number.isNaN(mn) || mn < 0.8 || mn > 1.0) errors.mn = '%Mn must be between 0.80 and 1.00';

    const p = parseNumber(sample.p);
    if (Number.isNaN(p) || p > 0.03) errors.p = '%P must be ≤ 0.030';

    const s = parseNumber(sample.s);
    if (Number.isNaN(s) || s > 0.03) errors.s = '%S must be ≤ 0.030';

    const grain = parseNumber(sample.grainSize);
    if (Number.isNaN(grain) || grain < 6) errors.grainSize = 'Grain size must be ≥ 6';

    ['inclA','inclB','inclC','inclD'].forEach(k => {
      const v = parseNumber(sample[k]);
      if (Number.isNaN(v) || v > 2.0) errors[k] = 'Inclusion rating must be ≤ 2.0';
    });

    const hardness = parseNumber(sample.hardness);
    if (Number.isNaN(hardness) || hardness < 45 || hardness > 55) errors.hardness = 'Hardness must be between 45 and 55';

    const decarb = parseNumber(sample.decarb);
    if (Number.isNaN(decarb) || decarb > 0.25) errors.decarb = 'Depth of decarb must be ≤ 0.25mm';

    return { errors, isSampleValid: Object.keys(errors).length === 0 };
  };

  const updateMaterialField = (heatIndex, sampleIndex, field, value) => {
    setMaterialData(prev => {
      const next = prev.map((h, hi) => {
        if (hi !== heatIndex) return h;
        const samples = h.samples.map((s, si) => si === sampleIndex ? { ...s, [field]: value } : s);
        return { ...h, samples };
      });
      return next;
    });
  };

  const validateHeat = (heatIndex) => {
    const heat = materialData[heatIndex];
    if (!heat) return { isValid: false, errors: [] };
    const sampleResults = heat.samples.map(s => validateSample(s));
    const isValid = sampleResults.every(r => r.isSampleValid);
    return { isValid, sampleResults };
  };

  // Auto-calculated values
  const totalQuantity = useMemo(() => {
    return heats.reduce((sum, heat) => sum + (parseFloat(heat.weight) || 0), 0).toFixed(2);
  }, [heats]);

  const numberOfHeats = useMemo(() => {
    return heats.length;
  }, [heats]);

  const numberOfERC = useMemo(() => {
    // Assuming 1 ERC per 0.5 MT of material
    return Math.ceil(parseFloat(totalQuantity) / 0.5);
  }, [totalQuantity]);

  // (defect lists and counts handled in visual module state)

  

  // Add/Remove Heat functionality
  const addHeat = () => {
    setHeats([...heats, { heatNo: '', weight: '', colorCode: '' }]);
  };

  const removeHeat = (index) => {
    if (heats.length > 1) {
      setHeats(heats.filter((_, i) => i !== index));
    }
  };

  const updateHeat = (index, field, value) => {
    const updatedHeats = [...heats];
    updatedHeats[index][field] = value;
    setHeats(updatedHeats);
  };

  // Add/Remove Test Certificate functionality
  const addTestCertificate = () => {
    setTestCertificates([...testCertificates, { certificateNo: '', heatNo: '', certificateDate: '' }]);
  };

  const removeTestCertificate = (index) => {
    if (testCertificates.length > 1) {
      setTestCertificates(testCertificates.filter((_, i) => i !== index));
    }
  };

  const updateTestCertificate = (index, field, value) => {
    const updatedCertificates = [...testCertificates];
    updatedCertificates[index][field] = value;
    setTestCertificates(updatedCertificates);
  };


  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [sourceOfRawMaterial, heats, numberOfBundles, testCertificates]);

  const heatNumbers = useMemo(() => heats.map(h => h.heatNo).filter(Boolean), [heats]);

  return (
    <div>
      <div className="breadcrumb">
        <div className="breadcrumb-item" onClick={onBack} style={{ cursor: 'pointer' }}>Landing Page</div>
        <span className="breadcrumb-separator">/</span>
        <div className="breadcrumb-item">Inspection Initiation</div>
        <span className="breadcrumb-separator">/</span>
        <div className="breadcrumb-item breadcrumb-active">ERC Raw Material</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <h1>ERC Raw Material Inspection</h1>
      </div>

      {/* Header with Static Data */}
      <div className="card" style={{ background: 'var(--color-gray-100)', marginBottom: 'var(--space-24)' }}>
        <div className="card-header">
          <h3 className="card-title">Inspection Details (Static Data)</h3>
          <p className="card-subtitle">Auto-fetched from PO/Sub PO information</p>
        </div>
        <div className="input-grid">
          <FormField label="PO / Sub PO Number">
            <input type="text" className="form-control" value={poData.sub_po_no || poData.po_no} disabled style={{ background: 'var(--color-gray-200)' }} />
          </FormField>
          <FormField label="PO / Sub PO Date">
            <input type="text" className="form-control" value={formatDate(poData.sub_po_date || poData.po_date)} disabled style={{ background: 'var(--color-gray-200)' }} />
          </FormField>
          <FormField label="Contractor Name">
            <input type="text" className="form-control" value={poData.contractor} disabled style={{ background: 'var(--color-gray-200)' }} />
          </FormField>
          <FormField label="Manufacturer">
            <input type="text" className="form-control" value={poData.manufacturer} disabled style={{ background: 'var(--color-gray-200)' }} />
          </FormField>
          <FormField label="Place of Inspection">
            <input type="text" className="form-control" value={poData.place_of_inspection} disabled style={{ background: 'var(--color-gray-200)' }} />
          </FormField>
          <FormField label="Stage of Inspection">
            <input type="text" className="form-control" value="Raw Material Inspection" disabled style={{ background: 'var(--color-gray-200)' }} />
          </FormField>
        </div>
      </div>

      {/* Pre-Inspection Data Entry */}
      <div className="card" style={{ marginBottom: 'var(--space-24)' }}>
        <div className="card-header">
          <h3 className="card-title">Pre-Inspection Data Entry</h3>
          <p className="card-subtitle">Enter raw material details before starting inspection</p>
        </div>

        <div className="input-grid">
          <FormField label="Source of Raw Material" required>
            <select
              className="form-control"
              value={sourceOfRawMaterial}
              onChange={(e) => setSourceOfRawMaterial(e.target.value)}
              required
            >
              <option value="">Select Source</option>
              <option value="domestic">Domestic</option>
              <option value="imported">Imported</option>
            </select>
          </FormField>

          <FormField label="No. of Bundles" required>
            <input
              type="number"
              className="form-control"
              value={numberOfBundles}
              onChange={(e) => setNumberOfBundles(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Total Quantity of Raw Material (MT)">
            <input
              type="text"
              className="form-control"
              value={totalQuantity}
              disabled
              style={{ background: 'var(--color-gray-200)', fontWeight: 'var(--font-weight-medium)' }}
            />
            <small style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Auto-calculated from heat weights</small>
          </FormField>

          <FormField label="No. of Heats">
            <input
              type="text"
              className="form-control"
              value={numberOfHeats}
              disabled
              style={{ background: 'var(--color-gray-200)', fontWeight: 'var(--font-weight-medium)' }}
            />
            <small style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Auto-calculated from heat entries</small>
          </FormField>

          <FormField label="No. of ERC (to be inspected)">
            <input
              type="text"
              className="form-control"
              value={numberOfERC}
              disabled
              style={{ background: 'var(--color-gray-200)', fontWeight: 'var(--font-weight-medium)' }}
            />
            <small style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Auto-calculated (1 ERC per 0.5 MT)</small>
          </FormField>
        </div>

        {/* Heat Number Entry Section */}
        <div style={{ marginTop: 'var(--space-24)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
            <h4>Heat Number Details</h4>
            <button className="btn btn-secondary" onClick={addHeat}>
              + Add Heat
            </button>
          </div>

          {heats.map((heat, index) => (
            <div key={index} style={{
              padding: 'var(--space-16)',
              background: 'var(--color-bg-2)',
              borderRadius: 'var(--radius-base)',
              marginBottom: 'var(--space-16)',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-12)' }}>
                <strong>Heat #{index + 1}</strong>
                {heats.length > 1 && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => removeHeat(index)}
                    style={{ padding: 'var(--space-4) var(--space-12)', fontSize: 'var(--font-size-sm)' }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="input-grid">
                <FormField label="Heat No." required>
                  <input
                    type="text"
                    className="form-control"
                    value={heat.heatNo}
                    onChange={(e) => updateHeat(index, 'heatNo', e.target.value)}
                    placeholder="e.g., H001"
                    required
                  />
                </FormField>
                <FormField label="Wt. of Material (MT)" required>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={heat.weight}
                    onChange={(e) => updateHeat(index, 'weight', e.target.value)}
                    placeholder="e.g., 2.5"
                    required
                  />
                </FormField>
                <FormField label="Color Code" required>
                  <input
                    type="text"
                    className="form-control"
                    value={heat.colorCode}
                    onChange={(e) => updateHeat(index, 'colorCode', e.target.value)}
                    placeholder="e.g., RED"
                    required
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>

        {/* Test Certificates Entry Section */}
        <div style={{ marginTop: 'var(--space-24)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
            <div>
              <h4>Test Certificates of Raw Material</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-4)' }}>
                Multiple test certificates can be added for same or different heat numbers
              </p>
            </div>
            <button className="btn btn-secondary" onClick={addTestCertificate}>
              + Add Test Certificate
            </button>
          </div>

          {testCertificates.map((cert, index) => (
            <div key={index} style={{
              padding: 'var(--space-16)',
              background: 'var(--color-bg-2)',
              borderRadius: 'var(--radius-base)',
              marginBottom: 'var(--space-16)',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-12)' }}>
                <strong>Test Certificate #{index + 1}</strong>
                {testCertificates.length > 1 && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => removeTestCertificate(index)}
                    style={{ padding: 'var(--space-4) var(--space-12)', fontSize: 'var(--font-size-sm)' }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="input-grid">
                <FormField label="Test Certificate No." required>
                  <input
                    type="text"
                    className="form-control"
                    value={cert.certificateNo}
                    onChange={(e) => updateTestCertificate(index, 'certificateNo', e.target.value)}
                    placeholder="e.g., TC-2025-001"
                    required
                  />
                </FormField>
                <FormField label="Heat Number" required>
                  <input
                    type="text"
                    className="form-control"
                    value={cert.heatNo}
                    onChange={(e) => updateTestCertificate(index, 'heatNo', e.target.value)}
                    placeholder="e.g., H001"
                    required
                  />
                  <small style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    Can be same or different across certificates
                  </small>
                </FormField>
                <FormField label="Date of Certificate" required>
                  <input
                    type="date"
                    className="form-control"
                    value={cert.certificateDate}
                    onChange={(e) => updateTestCertificate(index, 'certificateDate', e.target.value)}
                    required
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'visual' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Visual &amp; Dimensional Check (20 samples per Heat)</h3>
            <p className="card-subtitle">Raw Material Specific - Check for material defects and dimensional accuracy</p>
          </div>

          <div style={{ marginBottom: 'var(--space-20)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-12)', flexWrap: 'wrap' }}>
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

            <h4 style={{ marginBottom: 'var(--space-12)' }}>Visual Defects Checklist</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-12)' }}>
              {(() => {
                const hv = heatVisualData[activeHeatTab] || {};
                const selected = hv.selectedDefects || {};
                const counts = hv.defectCounts || {};
                return defectList.map((d) => {
                  const isNoDefect = d === 'No Defect';
                  const checked = selected[d];
                  const disabled = isNoDefect ? false : selected['No Defect'];
                  const defectValidation = validateDefectField(d, activeHeatTab);
                  return (
                    <div key={d} className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', width: '100%' }}>
                      <input
                        type="checkbox"
                        id={`defect-${d}`}
                        checked={!!checked}
                        onChange={() => handleDefectToggle(d)}
                        disabled={disabled}
                      />
                      <label htmlFor={`defect-${d}`} style={{ flex: '1 1 auto', marginRight: 'var(--space-8)' }}>{d}</label>

                      {/* For selected defects (except No Defect) show count input */}
                      {!isNoDefect && selected[d] && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', justifyContent: 'flex-end' }}>
                          <div style={{ minWidth: 160 }}>
                            <input
                              type="number"
                              className={`form-control ${!defectValidation.valid ? 'error' : ''}`}
                              value={counts[d]}
                              onChange={(e) => handleDefectCountChange(d, e.target.value)}
                              placeholder="Number of defective pieces"
                              step="1"
                              min="0"
                              required
                            />
                            {!defectValidation.valid && <div className="form-error">{defectValidation.message}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Visual status */}
            <div style={{ marginTop: 'var(--space-12)' }}>
              <strong>Visual Status: </strong>
              {visualRejected ? (
                <span className="alert alert-error" style={{ display: 'inline-block', marginLeft: 'var(--space-8)' }}>REJECTED</span>
              ) : (
                <span className="alert alert-success" style={{ display: 'inline-block', marginLeft: 'var(--space-8)' }}>ACCEPTED</span>
              )}
            </div>
            {visualRejected && (
              <div className="alert alert-error" style={{ marginTop: 'var(--space-12)' }}>
                Sum of defective pieces &gt; 1 — Visual check failed.
              </div>
            )}
          </div>

          <div style={{ marginBottom: 'var(--space-20)' }}>
            <h4 style={{ marginBottom: 'var(--space-12)' }}>Standard Diameter</h4>
            <div className="input-grid">
              <FormField label="Product Model">
                <input type="text" className="form-control" value={productModel} disabled />
              </FormField>
              <FormField label="Standard Rod Diameter (mm)">
                <input type="text" className="form-control" value={diameterConfig.standard} disabled />
                <small style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Auto-fetched from PO</small>
              </FormField>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-12)' }}>
            <h4 style={{ marginBottom: 'var(--space-12)' }}>Dimensional Check (20 samples)</h4>
            <div style={{ maxWidth: '900px', margin: 'auto' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                <thead>
                  <tr>
                    <th>Sample No.</th>
                    <th>Bar Diameter (mm)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const hv = heatVisualData[activeHeatTab] || {};
                    const samples = hv.dimSamples || [];
                    return samples.map((s, idx) => {
                      const res = dimensionalResults.sampleResults[idx];
                      return (
                        <tr key={idx}>
                          <td><strong>{idx + 1}</strong></td>
                          <td style={{ minWidth: 160 }}>
                            <input
                              type="number"
                              step="0.01"
                              className={`form-control ${res && !res.valid ? 'error' : ''}`}
                              value={s.diameter}
                              onChange={(e) => handleDimSampleChange(idx, e.target.value)}
                              required
                            />
                            {res && !res.valid && <div className="form-error">{res.message}</div>}
                          </td>
                          <td>
                            {res && res.valid ? <StatusBadge status="Valid" /> : <StatusBadge status="Invalid" />}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-12)' }}>
              <strong>Dimensional Status: </strong>
              {dimensionalResults.rejected ? (
                <span className="alert alert-error" style={{ display: 'inline-block', marginLeft: 'var(--space-8)' }}>REJECTED</span>
              ) : (
                <span className="alert alert-success" style={{ display: 'inline-block', marginLeft: 'var(--space-8)' }}>ACCEPTED</span>
              )}
            </div>
            {dimensionalResults.rejected && (
              <div className="alert alert-error" style={{ marginTop: 'var(--space-12)' }}>
                Invalid diameter count &gt; 1 — Dimensional check failed.
              </div>
            )}
          </div>

          <div style={{ marginTop: 'var(--space-12)' }}>
            <strong>Overall Heat Status: </strong>
            {overallRejected ? (
              <span className="alert alert-error" style={{ display: 'inline-block', marginLeft: 'var(--space-8)' }}>REJECTED</span>
            ) : (
              <span className="alert alert-success" style={{ display: 'inline-block', marginLeft: 'var(--space-8)' }}>ACCEPTED</span>
            )}
          </div>
        </div>
      )}

      {activeTab === 'material' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Material Testing (2 samples per Heat)</h3>
            <p className="card-subtitle">Chemical Analysis &amp; Mechanical Properties - Raw Material Specific</p>
          </div>
          <div className="alert alert-info" style={{ marginBottom: 'var(--space-24)' }}>
            ℹ️ Calibration status of testing instruments is verified and valid (see Calibration tab)
          </div>

          {/* Render material testing table for each heat */}
          {heats.map((heat, heatIndex) => {
            const heatValidation = validateHeat(heatIndex);
            return (
              <div key={heatIndex} style={{ marginBottom: 'var(--space-24)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-12)' }}>
                  <h4>Heat: {heat.heatNo || `#${heatIndex + 1}`} — Material Testing (2 samples)</h4>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>2 samples per heat (Sample 1 &amp; Sample 2)</div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Sample No.</th>
                        <th>%C</th>
                        <th>%Si</th>
                        <th>%Mn</th>
                        <th>%P</th>
                        <th>%S</th>
                        <th>Grain Size</th>
                        <th>Inclusion A</th>
                        <th>Inclusion B</th>
                        <th>Inclusion C</th>
                        <th>Inclusion D</th>
                        <th>Hardness (HRC)</th>
                        <th>Depth of Decarb (mm)</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[0, 1].map(sampleIndex => {
                        const sample = materialData[heatIndex]?.samples[sampleIndex] || {};
                        const sampleErrors = heatValidation.sampleResults && heatValidation.sampleResults[sampleIndex] ? heatValidation.sampleResults[sampleIndex].errors : {};
                        return (
                          <tr key={sampleIndex}>
                            <td><strong>{sampleIndex + 1}</strong></td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                className={`form-control ${sampleErrors.c ? 'error' : ''}`}
                                value={sample.c}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'c', e.target.value)}
                                required
                              />
                              {sampleErrors.c && <div className="form-error">{sampleErrors.c}</div>}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                className={`form-control ${sampleErrors.si ? 'error' : ''}`}
                                value={sample.si}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'si', e.target.value)}
                                required
                              />
                              {sampleErrors.si && <div className="form-error">{sampleErrors.si}</div>}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                className={`form-control ${sampleErrors.mn ? 'error' : ''}`}
                                value={sample.mn}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'mn', e.target.value)}
                                required
                              />
                              {sampleErrors.mn && <div className="form-error">{sampleErrors.mn}</div>}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.001"
                                className={`form-control ${sampleErrors.p ? 'error' : ''}`}
                                value={sample.p}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'p', e.target.value)}
                                required
                              />
                              {sampleErrors.p && <div className="form-error">{sampleErrors.p}</div>}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.001"
                                className={`form-control ${sampleErrors.s ? 'error' : ''}`}
                                value={sample.s}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 's', e.target.value)}
                                required
                              />
                              {sampleErrors.s && <div className="form-error">{sampleErrors.s}</div>}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.1"
                                className={`form-control ${sampleErrors.grainSize ? 'error' : ''}`}
                                value={sample.grainSize}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'grainSize', e.target.value)}
                                required
                              />
                              {sampleErrors.grainSize && <div className="form-error">{sampleErrors.grainSize}</div>}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.1"
                                className={`form-control ${sampleErrors.inclA ? 'error' : ''}`}
                                value={sample.inclA}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'inclA', e.target.value)}
                                required
                              />
                              {sampleErrors.inclA && <div className="form-error">{sampleErrors.inclA}</div>}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.1"
                                className={`form-control ${sampleErrors.inclB ? 'error' : ''}`}
                                value={sample.inclB}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'inclB', e.target.value)}
                                required
                              />
                              {sampleErrors.inclB && <div className="form-error">{sampleErrors.inclB}</div>}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.1"
                                className={`form-control ${sampleErrors.inclC ? 'error' : ''}`}
                                value={sample.inclC}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'inclC', e.target.value)}
                                required
                              />
                              {sampleErrors.inclC && <div className="form-error">{sampleErrors.inclC}</div>}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.1"
                                className={`form-control ${sampleErrors.inclD ? 'error' : ''}`}
                                value={sample.inclD}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'inclD', e.target.value)}
                                required
                              />
                              {sampleErrors.inclD && <div className="form-error">{sampleErrors.inclD}</div>}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.1"
                                className={`form-control ${sampleErrors.hardness ? 'error' : ''}`}
                                value={sample.hardness}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'hardness', e.target.value)}
                                required
                              />
                              {sampleErrors.hardness && <div className="form-error">{sampleErrors.hardness}</div>}
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                className={`form-control ${sampleErrors.decarb ? 'error' : ''}`}
                                value={sample.decarb}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'decarb', e.target.value)}
                                required
                              />
                              {sampleErrors.decarb && <div className="form-error">{sampleErrors.decarb}</div>}
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={sample.remarks}
                                onChange={(e) => updateMaterialField(heatIndex, sampleIndex, 'remarks', e.target.value)}
                                placeholder="Remarks (optional)"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Heat-level Acceptance / Rejection */}
                <div style={{ marginTop: 'var(--space-12)' }}>
                  <strong>Overall Heat Status: </strong>
                  {heatValidation.isValid ? (
                    <span className="alert alert-success" style={{ display: 'inline-block', marginLeft: 'var(--space-8)' }}>Heat Accepted</span>
                  ) : (
                    <span className="alert alert-error" style={{ display: 'inline-block', marginLeft: 'var(--space-8)' }}>Heat Rejected</span>
                  )}
                </div>
                {!heatValidation.isValid && (
                  <div className="alert alert-error" style={{ marginTop: 'var(--space-12)' }}>
                    If any data is outside the tolerance then the complete heat is rejected.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'calibration' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Calibration &amp; Document Verification - Raw Material</h3>
              <p className="card-subtitle">Instrument calibration information for Raw Material inspection. Vendor can enter data, IE verifies.</p>
            </div>
            {CALIBRATION_DATA.map((item, idx) => {
              const daysLeft = calculateDaysLeft(item.due_date);
              return (
                <div key={idx} className="calibration-item">
                  <div className="calibration-info">
                    <div className="calibration-name">{item.instrument}</div>
                    <div className="calibration-date">Due: {formatDate(item.due_date)}</div>
                  </div>
                  <div className="calibration-countdown">
                    <StatusBadge status={daysLeft > 0 ? 'Valid' : 'Expired'} />
                    <div style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-4)' }}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'var(--space-16)', flex: 1 }}>
                    <input type="text" className="form-control" placeholder="IE Remarks" />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card" style={{ marginTop: 'var(--space-24)' }}>
            <div className="card-header">
              <h3 className="card-title">Vendor Document Verification</h3>
            </div>
            <FormField label="IE Verification Remarks">
              <textarea className="form-control" rows="3" placeholder="Enter your verification remarks for vendor documentation..."></textarea>
            </FormField>
            <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
              <button className="btn btn-secondary">Request Vendor Update</button>
              <button className="btn btn-primary">Approve Calibration</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Raw Material Inspection Summary - Auto-Compiled</h3>
              <p className="card-subtitle">Consolidated results from all RM inspection modules</p>
            </div>
            <div className="alert alert-success">
              ✓ Raw Material inspection completed successfully
            </div>
            <div style={{ marginBottom: 'var(--space-20)' }}>
              <h4 style={{ marginBottom: 'var(--space-12)' }}>Calibration Module Results:</h4>
              <p>All instruments calibrated and valid. 1 instrument expiring soon (Dimensional Gauge - Nov 10)</p>
            </div>
            <div style={{ marginBottom: 'var(--space-20)' }}>
              <h4 style={{ marginBottom: 'var(--space-12)' }}>Visual &amp; Dimensional Check Results:</h4>
              <p><strong>Samples Inspected:</strong> 20 samples per heat</p>
              <p><strong>Defects Found:</strong> 2 minor defects (Kink, Pit)</p>
              <p><strong>Dimensional Measurements:</strong> All within tolerance</p>
            </div>
            <div style={{ marginBottom: 'var(--space-20)' }}>
              <h4 style={{ marginBottom: 'var(--space-12)' }}>Material Testing Results:</h4>
              <p><strong>Chemical Analysis:</strong></p>
              <ul style={{ marginLeft: 'var(--space-20)' }}>
                <li>Carbon %: 0.55 (Valid - Range: 0.50-0.60)</li>
                <li>Grain Size: 5</li>
              </ul>
              <p><strong>Mechanical Properties:</strong></p>
              <ul style={{ marginLeft: 'var(--space-20)' }}>
                <li>Hardness: 48 HRC (Valid - Range: 45-55)</li>
                <li>Depth of Decarb: 0.2mm</li>
              </ul>
            </div>
          </div>
          <div className="card" style={{ marginTop: 'var(--space-24)' }}>
            <div className="card-header">
              <h3 className="card-title">Final Results - Raw Material (Auto-Populated)</h3>
            </div>
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
                        <input type="text" className="form-control" placeholder="Enter remarks..." required />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card" style={{ marginTop: 'var(--space-24)' }}>
            <div className="card-header">
              <h3 className="card-title">Accept/Reject Decision</h3>
            </div>
            <FormField label="Material Lot Status">
              <select className="form-control" style={{ maxWidth: '300px' }}>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </FormField>
            <FormField label="Reason for Rejection (if rejected)">
              <input type="text" className="form-control" placeholder="Enter reason..." />
            </FormField>
            <FormField label="Overall IE Remarks" required>
              <textarea className="form-control" rows="3" placeholder="Enter your overall remarks..."></textarea>
            </FormField>
            <div style={{ display: 'flex', gap: 'var(--space-16)', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline">Save Draft</button>
              <button className="btn btn-secondary" onClick={() => { if (window.confirm('Are you sure you want to reject this lot?')) { alert('Raw Material lot rejected'); } }}>Reject Lot</button>
              <button className="btn btn-primary" onClick={() => { alert('Raw Material lot accepted and inspection completed!'); onBack(); }}>Accept Lot &amp; Complete Inspection</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 'var(--space-24)' }}>
        <button className="btn btn-secondary" onClick={onBack}>Return to Landing Page</button>
      </div>
    </div>
  );
};

export default RawMaterialDashboard;
