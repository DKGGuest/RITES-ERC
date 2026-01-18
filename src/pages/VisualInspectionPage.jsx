import { useState, useMemo, useEffect, useCallback } from 'react';
import Notification from '../components/Notification';
import RawMaterialSubmoduleNav from '../components/RawMaterialSubmoduleNav';
import './VisualInspectionPage.css';

const STORAGE_KEY = 'visual_inspection_draft_data';

// Weight calculation factors per metre
const WEIGHT_FACTORS = {
  'MK-III': 0.00263,  // tonnes per metre
  'MK-V': 0.00326     // tonnes per metre
};

// Defects that contribute to total defective length
const LENGTH_DEFECTS = ['Distortion', 'Twist', 'Kink', 'Not Straight', 'Fold', 'Lap', 'Crack'];

/**
 * Visual Inspection Page - Raw Material Sub-module
 * Handles visual defects checklist per heat
 * Data persists while switching tabs/submodules until user submits
 */
const VisualInspectionPage = ({ onBack, heats = [], productModel = 'MK-III', onNavigateSubmodule, inspectionCallNo = '' }) => {
  const [activeHeatTab, setActiveHeatTab] = useState(0);
  const [notification, setNotification] = useState({ message: '', type: 'error' });

  const showNotification = (message, type = 'error', autoClose = true, delay = 4000) => {
    setNotification({ message, type });
    if (autoClose) {
      setTimeout(() => setNotification({ message: '', type }), delay);
    }
  };

  // Visual Defects List
  const defectList = useMemo(() => ([
    'No Defect', 'Distortion', 'Twist', 'Kink', 'Not Straight', 'Fold',
    'Lap', 'Crack', 'Pit', 'Groove', 'Excessive Scaling', 'Internal Defect (Piping, Segregation)'
  ]), []);

  // Load draft data from localStorage or initialize empty
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

  // Per-heat Visual state
  const [heatVisualData, setHeatVisualData] = useState(() => {
    const draft = loadDraftData();
    if (draft && draft.length > 0) {
      return draft;
    }
    return heats.map(() => ({
      selectedDefects: defectList.reduce((acc, d) => { acc[d] = false; return acc; }, {}),
      defectCounts: defectList.reduce((acc, d) => { acc[d] = ''; return acc; }, {}),
    }));
  });

  // Keep heatVisualData in sync when heats change
  useEffect(() => {
    setHeatVisualData(prev => {
      const next = heats.map((_, idx) => prev[idx] || {
        selectedDefects: defectList.reduce((acc, d) => { acc[d] = false; return acc; }, {}),
        defectCounts: defectList.reduce((acc, d) => { acc[d] = ''; return acc; }, {}),
      });
      if (activeHeatTab >= heats.length) setActiveHeatTab(Math.max(0, heats.length - 1));
      return next;
    });
  }, [heats, defectList, activeHeatTab]);

  // Auto-save to localStorage on heatVisualData change (persist while switching tabs/submodules)
  useEffect(() => {
    const storageKey = `${STORAGE_KEY}_${inspectionCallNo}`;
    localStorage.setItem(storageKey, JSON.stringify(heatVisualData));
  }, [heatVisualData, inspectionCallNo]);

  // Defect handlers
  const handleDefectToggle = useCallback((defectName) => {
    setHeatVisualData(prev => {
      const next = [...prev];
      const hv = { ...next[activeHeatTab] };
      const sel = { ...hv.selectedDefects };
      const counts = { ...hv.defectCounts };
      if (defectName === 'No Defect') {
        if (sel['No Defect']) {
          sel['No Defect'] = false;
        } else {
          Object.keys(sel).forEach(k => { sel[k] = false; counts[k] = ''; });
          sel['No Defect'] = true;
        }
      } else {
        sel[defectName] = !sel[defectName];
        if (!sel[defectName]) counts[defectName] = '';
        if (sel['No Defect']) sel['No Defect'] = false;
      }
      hv.selectedDefects = sel;
      hv.defectCounts = counts;
      next[activeHeatTab] = hv;
      return next;
    });
  }, [activeHeatTab]);

  const handleDefectCountChange = useCallback((defectName, value) => {
    setHeatVisualData(prev => {
      const next = [...prev];
      const hv = { ...next[activeHeatTab] };
      hv.defectCounts = { ...hv.defectCounts, [defectName]: value };
      next[activeHeatTab] = hv;
      return next;
    });
  }, [activeHeatTab]);

  // Validation: ensure that if any length-defect is selected, its value must be filled
  const validateHeatData = useCallback((heatIdx) => {
    const hv = heatVisualData[heatIdx] || {};
    const selected = hv.selectedDefects || {};
    const counts = hv.defectCounts || {};

    for (let defect of LENGTH_DEFECTS) {
      if (selected[defect]) {
        const v = counts[defect];
        if (v === undefined || v === null || String(v).trim() === '') {
          showNotification(`Please enter value for ${defect} before leaving this tab.`, 'warning');
          return false;
        }
      }
    }
    return true;
  }, [heatVisualData]);

  const handleSelectHeat = useCallback((idx) => {
    // If trying to leave current heat, validate current heat
    if (activeHeatTab !== idx) {
      const ok = validateHeatData(activeHeatTab);
      if (!ok) return; // block change
    }
    setActiveHeatTab(idx);
  }, [activeHeatTab, validateHeatData]);

  // Wrap navigation and back handlers to validate current heat before allowing navigation
  const handleBackClick = useCallback(() => {
    const ok = validateHeatData(activeHeatTab);
    if (!ok) return;
    onBack();
  }, [activeHeatTab, validateHeatData, onBack]);

  const handleNavigateSubmodule = useCallback((sub) => {
    const ok = validateHeatData(activeHeatTab);
    if (!ok) return;
    if (onNavigateSubmodule) onNavigateSubmodule(sub);
  }, [activeHeatTab, validateHeatData, onNavigateSubmodule]);

  /**
   * Calculate total defective length for current heat
   * Sum of all length-based defects (Distortion, Twist, Kink, Not Straight, Fold, Lap, Crack)
   * Input is in metres, output is in metres
   */
  const calculateTotalDefectiveLength = useCallback((heatData) => {
    if (!heatData?.selectedDefects || !heatData?.defectCounts) return 0;

    const selected = heatData.selectedDefects;
    const counts = heatData.defectCounts;

    let totalMetres = 0;
    LENGTH_DEFECTS.forEach(defect => {
      if (selected[defect]) {
        const lengthMetres = parseFloat(counts[defect]) || 0;
        totalMetres += lengthMetres;
      }
    });

    return totalMetres;
  }, []);

  /**
   * Calculate weight rejected based on total defective length
   * Formula: MK-III: Length(m) * 0.00263, MK-V: Length(m) * 0.00326
   */
  const calculateWeightRejected = useCallback((totalLengthMetres) => {
    const model = productModel?.toUpperCase().includes('V') ? 'MK-V' : 'MK-III';
    const factor = WEIGHT_FACTORS[model];
    return totalLengthMetres * factor;
  }, [productModel]);

  // Calculate values for current heat
  const currentHeatData = heatVisualData[activeHeatTab] || {};
  const totalDefectiveLength = calculateTotalDefectiveLength(currentHeatData);
  const weightRejected = calculateWeightRejected(totalDefectiveLength);

  return (
    <div className="visual-page-container">
      <div className="visual-page-header">
        <h1 className="visual-page-title">👁️ Visual Inspection</h1>
        <button className="visual-back-btn" onClick={handleBackClick}>
          ← Back to Raw Material Dashboard
        </button>
      </div>

      {/* Submodule Navigation */}
      <RawMaterialSubmoduleNav
        currentSubmodule="visual-inspection"
        onNavigate={handleNavigateSubmodule}
      />

      {/* App notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: notification.type })}
        autoClose={true}
        autoCloseDelay={4000}
      />

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Visual Defects Checklist</h3>
          <p className="card-subtitle">Check for material defects per heat</p>
        </div>

        {/* Acceptance Criteria Info Box */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <span style={{ fontSize: '18px' }}>ℹ️</span>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: '#0369a1', fontSize: '0.9rem' }}>Acceptance Criteria</p>
            <p style={{ margin: '4px 0 0', color: '#0c4a6e', fontSize: '0.85rem' }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ OK</span> — "No Defect" is selected
              <span style={{ margin: '0 12px', color: '#94a3b8' }}>|</span>
              <span style={{ color: '#dc2626', fontWeight: 600 }}>✗ NOT OK</span> — Any defect is selected
            </p>
          </div>
        </div>

        {/* Heat selector buttons */}
        <div className="visual-heat-selector">
          {heats.map((h, idx) => (
            <button
              key={idx}
              type="button"
              className={idx === activeHeatTab ? 'btn btn-primary' : 'btn btn-outline'}
                onClick={() => handleSelectHeat(idx)}
            >
              {`Heat ${h.heatNo || `#${idx + 1}`}`}
            </button>
          ))}
        </div>

        {/* Visual Defects Grid */}
        <div className="visual-defect-grid">
          {(() => {
            const hv = heatVisualData[activeHeatTab] || {};
            const selected = hv.selectedDefects || {};
            const counts = hv.defectCounts || {};
            return defectList.map((d) => {
              const isNoDefect = d === 'No Defect';
              const checked = selected[d];
              const disabled = isNoDefect ? false : selected['No Defect'];
              const isMatchingDefectType = !!checked;
              const rowClassName = [
                'checkbox-item',
                'visual-defect-row',
                isMatchingDefectType ? 'matching' : 'non-matching'
              ].join(' ');
              return (
                <div key={d} className={rowClassName}>
                  <input
                    type="checkbox"
                    id={`defect-${d}`}
                    checked={!!checked}
                    onChange={() => handleDefectToggle(d)}
                    disabled={disabled}
                  />
                  <label htmlFor={`defect-${d}`}>{d}</label>
                  {!isNoDefect && selected[d] && (
                    <input
                      type="number"
                      className="form-control visual-defect-count"
                      value={counts[d]}
                      onChange={(e) => handleDefectCountChange(d, e.target.value)}
                      placeholder="Length (m)"
                      min="0"
                      step="0.001"
                    />
                  )}
                </div>
              );
            });
          })()}
        </div>

        {/* Calculation Summary */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: '8px'
            }}>
              Total Defective Length (metres)
            </label>
            <div style={{
              padding: '12px',
              background: '#fff',
              border: '2px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: totalDefectiveLength > 0 ? '#dc2626' : '#64748b'
            }}>
              {totalDefectiveLength.toFixed(3)} m
            </div>
            <p style={{
              margin: '8px 0 0',
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontStyle: 'italic'
            }}>
              Auto-calculated from: Distortion, Twist, Kink, Not Straight, Fold, Lap, Crack
            </p>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: '8px'
            }}>
              Weight Rejected (tonnes)
            </label>
            <div style={{
              padding: '12px',
              background: '#fff',
              border: '2px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: weightRejected > 0 ? '#dc2626' : '#64748b'
            }}>
              {weightRejected.toFixed(6)} T
            </div>
            <p style={{
              margin: '8px 0 0',
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontStyle: 'italic'
            }}>
              Formula: {productModel?.toUpperCase().includes('V') ? 'MK-V' : 'MK-III'} = Length (m) × {productModel?.toUpperCase().includes('V') ? '0.00326' : '0.00263'}
            </p>
          </div>
        </div>

        {/* Note for defective portion */}
        <p className="visual-defect-note">
          <strong>Note:</strong> In case of defective, enter the total length of defective portion (in metres).
        </p>

      </div>
    </div>
  );
};

export default VisualInspectionPage;

