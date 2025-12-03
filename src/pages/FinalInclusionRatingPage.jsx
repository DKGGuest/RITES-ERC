import { useState, useMemo } from 'react';

const FinalInclusionRatingPage = ({ onBack }) => {
  // Mock lot data from Process IC
  const availableLots = [
    { lotNo: 'LOT-001', heatNo: 'HT-2025-A1', quantity: 500, hardnessSampleSize: 50, barDia: 14 },
    { lotNo: 'LOT-002', heatNo: 'HT-2025-A2', quantity: 800, hardnessSampleSize: 80, barDia: 16 },
    { lotNo: 'LOT-003', heatNo: 'HT-2025-B1', quantity: 1200, hardnessSampleSize: 125, barDia: 14 }
  ];

  const [selectedLot, setSelectedLot] = useState(availableLots[0].lotNo);
  const [colorCode, setColorCode] = useState('');
  const [remarks, setRemarks] = useState('');

  // 1st Sampling - Depth of Decarb
  const [depthOfDecarb, setDepthOfDecarb] = useState('');

  // 1st Sampling - Inclusion Ratings (A, B, C, D) - Type and Rating
  const [inclusions, setInclusions] = useState({
    A: { type: 'Thin', rating: '' },
    B: { type: 'Thin', rating: '' },
    C: { type: 'Thin', rating: '' },
    D: { type: 'Thin', rating: '' }
  });

  // 1st Sampling - Microstructure and Freedom from Defects
  const [microstructure, setMicrostructure] = useState('Tempered Martensite');
  const [freedomFromDefects, setFreedomFromDefects] = useState('Satisfactory');

  // 2nd Sampling States (Double Sampling)
  const [depthOfDecarb2nd, setDepthOfDecarb2nd] = useState('');
  const [inclusions2nd, setInclusions2nd] = useState({
    A: { type: 'Thin', rating: '' },
    B: { type: 'Thin', rating: '' },
    C: { type: 'Thin', rating: '' },
    D: { type: 'Thin', rating: '' }
  });
  const [microstructure2nd, setMicrostructure2nd] = useState('Tempered Martensite');
  const [freedomFromDefects2nd, setFreedomFromDefects2nd] = useState('Satisfactory');

  const currentLot = useMemo(() =>
    availableLots.find(l => l.lotNo === selectedLot) || availableLots[0],
    [selectedLot, availableLots]
  );

  // Calculate sample size: 6 or 0.5% of hardness sample size (whichever is higher)
  const sampleSize = useMemo(() => {
    const halfPercent = Math.ceil(currentLot.hardnessSampleSize * 0.005);
    return Math.max(6, halfPercent);
  }, [currentLot]);

  // Calculate max permissible decarb: <= 0.25mm or (d/100)mm whichever is less
  const maxDecarb = useMemo(() => {
    const dBy100 = currentLot.barDia / 100;
    return Math.min(0.25, dBy100);
  }, [currentLot]);

  // Validate depth of decarb (1st sampling)
  const decarbStatus = useMemo(() => {
    if (!depthOfDecarb || depthOfDecarb === '') return { valid: null, message: '', rejected: 0 };
    const val = parseFloat(depthOfDecarb);
    const isValid = val <= maxDecarb;
    return {
      valid: isValid,
      message: isValid ? 'Within limit' : `Exceeds limit of ${maxDecarb.toFixed(2)}mm`,
      rejected: isValid ? 0 : 1
    };
  }, [depthOfDecarb, maxDecarb]);

  // Validate depth of decarb (2nd sampling)
  const decarbStatus2nd = useMemo(() => {
    if (!depthOfDecarb2nd || depthOfDecarb2nd === '') return { valid: null, rejected: 0 };
    const val = parseFloat(depthOfDecarb2nd);
    const isValid = val <= maxDecarb;
    return { valid: isValid, rejected: isValid ? 0 : 1 };
  }, [depthOfDecarb2nd, maxDecarb]);

  // Count rejected in 1st sampling inclusions (rating > 2.0)
  const inclusionRejected1st = useMemo(() => {
    const maxRating = 2.0;
    return Object.values(inclusions).filter(inc => {
      if (!inc.rating || inc.rating === '') return false;
      return parseFloat(inc.rating) > maxRating;
    }).length;
  }, [inclusions]);

  // Count rejected in 2nd sampling inclusions
  const inclusionRejected2nd = useMemo(() => {
    const maxRating = 2.0;
    return Object.values(inclusions2nd).filter(inc => {
      if (!inc.rating || inc.rating === '') return false;
      return parseFloat(inc.rating) > maxRating;
    }).length;
  }, [inclusions2nd]);

  // Count microstructure rejection
  const microRejected1st = microstructure === 'Not Tempered Martensite' ? 1 : 0;
  const microRejected2nd = microstructure2nd === 'Not Tempered Martensite' ? 1 : 0;

  // Count defects rejection
  const defectsRejected1st = freedomFromDefects === 'Not Satisfactory' ? 1 : 0;
  const defectsRejected2nd = freedomFromDefects2nd === 'Not Satisfactory' ? 1 : 0;

  // Total rejections in 1st sampling
  const totalRejected1st = decarbStatus.rejected + inclusionRejected1st + microRejected1st + defectsRejected1st;

  // Total rejections in 2nd sampling
  const totalRejected2nd = decarbStatus2nd.rejected + inclusionRejected2nd + microRejected2nd + defectsRejected2nd;

  // Show 2nd sampling if any test has more than 1 rejected piece in 1st sampling
  const show2ndSampling = totalRejected1st > 1;

  // Combined total rejection
  const totalRejectedCombined = show2ndSampling ? totalRejected1st + totalRejected2nd : totalRejected1st;

  // Overall acceptance result with double sampling logic
  const acceptanceResult = useMemo(() => {
    // If 1st sampling has ≤1 rejection, accept
    if (totalRejected1st <= 1) {
      return { status: 'ACCEPTED', color: '#22c55e', icon: '✓' };
    }
    // If 2nd sampling is triggered
    if (show2ndSampling) {
      // Accept if combined rejection is within acceptable limit (e.g., ≤2 for double sampling)
      if (totalRejectedCombined <= 2) {
        return { status: 'ACCEPTED', color: '#22c55e', icon: '✓' };
      }
    }
    return { status: 'REJECTED', color: '#ef4444', icon: '✗' };
  }, [totalRejected1st, show2ndSampling, totalRejectedCombined]);

  const handleInclusionChange = (type, field, value, is2nd = false) => {
    if (is2nd) {
      setInclusions2nd(prev => ({
        ...prev,
        [type]: { ...prev[type], [field]: value }
      }));
    } else {
      setInclusions(prev => ({
        ...prev,
        [type]: { ...prev[type], [field]: value }
      }));
    }
  };

  const pageStyles = `
    .ir-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .ir-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ir-label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }
    .ir-label.required::after {
      content: ' *';
      color: #ef4444;
    }
    .ir-input {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
    }
    .ir-input:focus {
      outline: none;
      border-color: #0ea5e9;
    }
    .ir-input:disabled {
      background: #f1f5f9;
      color: #64748b;
    }
    .ir-input.valid {
      border-color: #22c55e;
      background: #f0fdf4;
    }
    .ir-input.invalid {
      border-color: #ef4444;
      background: #fef2f2;
    }
    .ir-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .ir-section-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ir-inclusion-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
    .ir-inclusion-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
    }
    .ir-inclusion-header {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .ir-inclusion-row {
      display: flex;
      gap: 10px;
    }
    .ir-result-box {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .ir-status-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .ir-status-badge.pass {
      background: #dcfce7;
      color: #166534;
    }
    .ir-status-badge.fail {
      background: #fee2e2;
      color: #991b1b;
    }
    .ir-validation-note {
      font-size: 11px;
      color: #64748b;
      background: #f1f5f9;
      padding: 8px 12px;
      border-radius: 6px;
      margin-top: 8px;
    }
    @media (max-width: 768px) {
      .ir-form-grid {
        grid-template-columns: 1fr 1fr;
      }
      .ir-inclusion-grid {
        grid-template-columns: 1fr 1fr;
      }
      .page-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 12px;
      }
      .page-header .btn {
        width: 100%;
      }
    }
    @media (max-width: 480px) {
      .ir-form-grid {
        grid-template-columns: 1fr;
      }
      .ir-inclusion-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  return (
    <div>
      <style>{pageStyles}</style>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 className="page-title">Inclusion Rating, Decarb & Defects</h1>
          <p className="page-subtitle">Final Product Inspection - Separate section for each lot</p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Lot Selection */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">📦 Lot Information</h3>
          <p className="card-subtitle">No. of Readings: 6 or 0.5% of hardness test sample size (whichever is higher)</p>
        </div>
        <div className="ir-form-grid">
          <div className="ir-field">
            <label className="ir-label required">Lot No.</label>
            <select className="ir-input" value={selectedLot} onChange={e => setSelectedLot(e.target.value)}>
              {availableLots.map(lot => (
                <option key={lot.lotNo} value={lot.lotNo}>{lot.lotNo}</option>
              ))}
            </select>
          </div>
          <div className="ir-field">
            <label className="ir-label">Heat No.</label>
            <input type="text" className="ir-input" value={currentLot.heatNo} disabled />
          </div>
          <div className="ir-field">
            <label className="ir-label">Quantity of Lot</label>
            <input type="number" className="ir-input" value={currentLot.quantity} disabled />
          </div>
          <div className="ir-field">
            <label className="ir-label">Sample Size (Auto)</label>
            <input type="number" className="ir-input" value={sampleSize} disabled />
          </div>
          <div className="ir-field">
            <label className="ir-label required">Color Code</label>
            <input type="text" className="ir-input" value={colorCode} onChange={e => setColorCode(e.target.value)} placeholder="Enter color code" />
          </div>
          <div className="ir-field">
            <label className="ir-label">Bar Diameter (mm)</label>
            <input type="number" className="ir-input" value={currentLot.barDia} disabled />
          </div>
        </div>
      </div>

      {/* Depth of Decarb */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">📏 Depth of Decarburization</h3>
          <p className="card-subtitle">Max limit: ≤ 0.25mm or (d/100)mm whichever is less</p>
        </div>
        <div className="ir-form-grid">
          <div className="ir-field">
            <label className="ir-label">Max Permissible (mm)</label>
            <input type="text" className="ir-input" value={maxDecarb.toFixed(2)} disabled />
          </div>
          <div className="ir-field">
            <label className="ir-label required">Observed Value (mm)</label>
            <input
              type="number"
              step="0.01"
              className={`ir-input ${decarbStatus.valid === true ? 'valid' : decarbStatus.valid === false ? 'invalid' : ''}`}
              value={depthOfDecarb}
              onChange={e => setDepthOfDecarb(e.target.value)}
              placeholder="Enter value"
            />
          </div>
          <div className="ir-field">
            <label className="ir-label">Status</label>
            <div style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: decarbStatus.valid === true ? '#dcfce7' : decarbStatus.valid === false ? '#fee2e2' : '#f1f5f9',
              color: decarbStatus.valid === true ? '#166534' : decarbStatus.valid === false ? '#991b1b' : '#64748b',
              fontWeight: 600,
              fontSize: '13px'
            }}>
              {decarbStatus.valid === true ? '✓ Within Limit' : decarbStatus.valid === false ? '✗ ' + decarbStatus.message : '— Enter Value'}
            </div>
          </div>
        </div>
        <div className="ir-validation-note">
          ℹ️ Validation: ≤ 0.25mm or (d/100)mm = ({currentLot.barDia}/100) = {(currentLot.barDia/100).toFixed(2)}mm, whichever is less = {maxDecarb.toFixed(2)}mm
        </div>
      </div>

      {/* Inclusion Rating */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">🔬 Inclusion Rating (A, B, C, D)</h3>
          <p className="card-subtitle">Select Type (Thick/Thin) and enter Rating for each inclusion type</p>
        </div>
        <div className="ir-inclusion-grid">
          {['A', 'B', 'C', 'D'].map((type) => (
            <div key={type} className="ir-inclusion-card">
              <div className="ir-inclusion-header">
                Inclusion Type {type} {type === 'A' ? '(Sulphide)' : type === 'B' ? '(Alumina)' : type === 'C' ? '(Silicate)' : '(Globular Oxide)'}
              </div>
              <div className="ir-inclusion-row">
                <div className="ir-field" style={{ flex: 1 }}>
                  <label className="ir-label required">Type</label>
                  <select
                    className="ir-input"
                    value={inclusions[type].type}
                    onChange={e => handleInclusionChange(type, 'type', e.target.value)}
                  >
                    <option value="Thick">Thick</option>
                    <option value="Thin">Thin</option>
                  </select>
                </div>
                <div className="ir-field" style={{ flex: 1 }}>
                  <label className="ir-label required">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    className="ir-input"
                    value={inclusions[type].rating}
                    onChange={e => handleInclusionChange(type, 'rating', e.target.value)}
                    placeholder="0.0 - 2.0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Microstructure */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">🧬 Microstructure</h3>
          <p className="card-subtitle">Select observed microstructure</p>
        </div>
        <div className="ir-form-grid">
          <div className="ir-field">
            <label className="ir-label required">Microstructure</label>
            <select
              className="ir-input"
              value={microstructure}
              onChange={e => setMicrostructure(e.target.value)}
            >
              <option value="Tempered Martensite">Tempered Martensite</option>
              <option value="Not Tempered Martensite">Not Tempered Martensite</option>
            </select>
          </div>
          <div className="ir-field">
            <label className="ir-label">Status</label>
            <span className={`ir-status-badge ${microstructure === 'Tempered Martensite' ? 'pass' : 'fail'}`}>
              {microstructure === 'Tempered Martensite' ? '✓ Acceptable' : '✗ Not Acceptable'}
            </span>
          </div>
        </div>
      </div>

      {/* Freedom from Defects */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">🛡️ Freedom from Defects</h3>
          <p className="card-subtitle">Surface and internal defect assessment</p>
        </div>
        <div className="ir-form-grid">
          <div className="ir-field">
            <label className="ir-label required">Freedom from Defects</label>
            <select
              className="ir-input"
              value={freedomFromDefects}
              onChange={e => setFreedomFromDefects(e.target.value)}
            >
              <option value="Satisfactory">Satisfactory</option>
              <option value="Not Satisfactory">Not Satisfactory</option>
            </select>
          </div>
          <div className="ir-field">
            <label className="ir-label">Status</label>
            <span className={`ir-status-badge ${freedomFromDefects === 'Satisfactory' ? 'pass' : 'fail'}`}>
              {freedomFromDefects === 'Satisfactory' ? '✓ Acceptable' : '✗ Not Acceptable'}
            </span>
          </div>
        </div>
      </div>

      {/* 1st Sampling Summary */}
      <div className="card" style={{ marginBottom: 'var(--space-16)', background: '#f0f9ff', border: '1px solid #0ea5e9' }}>
        <div className="card-header">
          <h3 className="card-title">📊 1st Sampling Summary</h3>
        </div>
        <div className="ir-form-grid">
          <div className="ir-field">
            <label className="ir-label">Total Rejected in 1st Sampling</label>
            <div style={{
              padding: '12px',
              background: totalRejected1st > 1 ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${totalRejected1st > 1 ? '#ef4444' : '#22c55e'}`,
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '18px',
              color: totalRejected1st > 1 ? '#ef4444' : '#22c55e',
              textAlign: 'center'
            }}>
              {totalRejected1st}
            </div>
          </div>
          <div className="ir-field">
            <label className="ir-label">2nd Sampling Required?</label>
            <div style={{
              padding: '12px',
              background: show2ndSampling ? '#fef3c7' : '#f0fdf4',
              border: `1px solid ${show2ndSampling ? '#f59e0b' : '#22c55e'}`,
              borderRadius: '6px',
              fontWeight: 600,
              color: show2ndSampling ? '#92400e' : '#166534'
            }}>
              {show2ndSampling ? '⚠️ YES - Rejected > 1' : '✓ NO - Accepted'}
            </div>
          </div>
        </div>
      </div>

      {/* 2nd Sampling - Conditional (Double Sampling) */}
      {show2ndSampling && (
        <div className="card" style={{ marginBottom: 'var(--space-16)', background: '#fef3c7', border: '2px solid #f59e0b' }}>
          <div className="card-header" style={{ background: '#fbbf24', color: '#78350f' }}>
            <h3 className="card-title" style={{ color: '#78350f' }}>⚠️ 2nd Sampling (Double Sampling)</h3>
            <p className="card-subtitle" style={{ color: '#92400e' }}>
              Triggered because rejected pieces in 1st sampling ({totalRejected1st}) &gt; 1
            </p>
          </div>

          {/* 2nd Sampling - Depth of Decarb */}
          <div className="ir-section" style={{ background: '#fffbeb' }}>
            <h4 className="ir-section-title">📏 Depth of Decarb (2nd Sampling)</h4>
            <div className="ir-form-grid">
              <div className="ir-field">
                <label className="ir-label required">Observed Value (mm)</label>
                <input
                  type="number"
                  step="0.01"
                  className={`ir-input ${decarbStatus2nd.valid === true ? 'valid' : decarbStatus2nd.valid === false ? 'invalid' : ''}`}
                  value={depthOfDecarb2nd}
                  onChange={e => setDepthOfDecarb2nd(e.target.value)}
                  placeholder="Enter value"
                />
              </div>
            </div>
          </div>

          {/* 2nd Sampling - Inclusion Rating */}
          <div className="ir-section" style={{ background: '#fffbeb' }}>
            <h4 className="ir-section-title">🔬 Inclusion Rating (2nd Sampling)</h4>
            <div className="ir-inclusion-grid">
              {['A', 'B', 'C', 'D'].map((type) => (
                <div key={type} className="ir-inclusion-card" style={{ background: '#fffef7' }}>
                  <div className="ir-inclusion-header">Type {type}</div>
                  <div className="ir-inclusion-row">
                    <div className="ir-field" style={{ flex: 1 }}>
                      <label className="ir-label">Type</label>
                      <select
                        className="ir-input"
                        value={inclusions2nd[type].type}
                        onChange={e => handleInclusionChange(type, 'type', e.target.value, true)}
                      >
                        <option value="Thick">Thick</option>
                        <option value="Thin">Thin</option>
                      </select>
                    </div>
                    <div className="ir-field" style={{ flex: 1 }}>
                      <label className="ir-label">Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        className="ir-input"
                        value={inclusions2nd[type].rating}
                        onChange={e => handleInclusionChange(type, 'rating', e.target.value, true)}
                        placeholder="0.0 - 2.0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2nd Sampling - Microstructure & Defects */}
          <div className="ir-section" style={{ background: '#fffbeb' }}>
            <h4 className="ir-section-title">🧬 Microstructure & Defects (2nd Sampling)</h4>
            <div className="ir-form-grid">
              <div className="ir-field">
                <label className="ir-label required">Microstructure</label>
                <select
                  className="ir-input"
                  value={microstructure2nd}
                  onChange={e => setMicrostructure2nd(e.target.value)}
                >
                  <option value="Tempered Martensite">Tempered Martensite</option>
                  <option value="Not Tempered Martensite">Not Tempered Martensite</option>
                </select>
              </div>
              <div className="ir-field">
                <label className="ir-label required">Freedom from Defects</label>
                <select
                  className="ir-input"
                  value={freedomFromDefects2nd}
                  onChange={e => setFreedomFromDefects2nd(e.target.value)}
                >
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Not Satisfactory">Not Satisfactory</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2nd Sampling Summary */}
          <div className="ir-form-grid" style={{ marginTop: '12px' }}>
            <div className="ir-field">
              <label className="ir-label">Rejected in 2nd Sampling</label>
              <div style={{
                padding: '10px',
                background: '#fee2e2',
                borderRadius: '6px',
                fontWeight: 700,
                color: '#ef4444',
                textAlign: 'center'
              }}>
                {totalRejected2nd}
              </div>
            </div>
            <div className="ir-field">
              <label className="ir-label">Total Combined (R1 + R2)</label>
              <div style={{
                padding: '10px',
                background: totalRejectedCombined <= 2 ? '#dcfce7' : '#fee2e2',
                borderRadius: '6px',
                fontWeight: 700,
                color: totalRejectedCombined <= 2 ? '#166534' : '#ef4444',
                textAlign: 'center'
              }}>
                {totalRejectedCombined}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acceptance Result */}
      <div className="card" style={{ marginBottom: 'var(--space-16)' }}>
        <div className="card-header">
          <h3 className="card-title">📊 Acceptance Result</h3>
          <p className="card-subtitle">Auto-calculated - Reject if any test is above limit</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div className="ir-result-box" style={{
            background: acceptanceResult.color + '20',
            color: acceptanceResult.color,
            border: `2px solid ${acceptanceResult.color}`
          }}>
            {acceptanceResult.icon} {acceptanceResult.status}
          </div>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            {acceptanceResult.status === 'REJECTED'
              ? 'One or more parameters are out of acceptable limits'
              : 'All parameters within acceptable limits'}
          </span>
        </div>
        <div className="ir-field">
          <label className="ir-label required">Remarks</label>
          <textarea
            className="ir-input"
            rows="3"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Enter remarks..."
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: 'var(--space-24)', display: 'flex', gap: 'var(--space-16)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { alert('Inclusion Rating data saved!'); onBack(); }}>Save & Continue</button>
      </div>
    </div>
  );
};

export default FinalInclusionRatingPage;

