import { useState, useMemo, useEffect, useCallback } from 'react';
import './VisualInspectionPage.css';

/**
 * Visual Inspection Page - Raw Material Sub-module
 * Handles visual defects checklist per heat
 */
const VisualInspectionPage = ({ onBack, heats = [] }) => {
  const [activeHeatTab, setActiveHeatTab] = useState(0);

  // Visual Defects List
  const defectList = useMemo(() => ([
    'No Defect', 'Distortion', 'Twist', 'Kink', 'Not Straight', 'Fold',
    'Lap', 'Crack', 'Pit', 'Groove', 'Excessive Scaling', 'Internal Defect (Piping, Segregation)'
  ]), []);

  // Per-heat Visual state
  const [heatVisualData, setHeatVisualData] = useState(() => (
    heats.map(() => ({
      selectedDefects: defectList.reduce((acc, d) => { acc[d] = false; return acc; }, {}),
      defectCounts: defectList.reduce((acc, d) => { acc[d] = ''; return acc; }, {}),
    }))
  ));

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

  return (
    <div className="visual-page-container">
      <div className="visual-page-header">
        <h1 className="visual-page-title">👁️ Visual Inspection</h1>
        <button className="visual-back-btn" onClick={onBack}>
          ← Back to Sub Module Session
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Visual Defects Checklist</h3>
          <p className="card-subtitle">Check for material defects per heat</p>
        </div>

        {/* Heat selector buttons */}
        <div className="visual-heat-selector">
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
                      placeholder={`${d} Count`}
                      min="0"
                    />
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

export default VisualInspectionPage;

