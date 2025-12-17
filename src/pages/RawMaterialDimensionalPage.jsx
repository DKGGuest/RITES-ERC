import { useState, useMemo, useEffect, useCallback } from 'react';
import RawMaterialSubmoduleNav from '../components/RawMaterialSubmoduleNav';
import './RawMaterialDimensionalPage.css';

const STORAGE_KEY = 'dimensional_check_draft_data';

/**
 * Dimensional Check Page - Raw Material Sub-module
 * Handles dimensional samples (20 samples per heat)
 * Data persists while switching submodules until user submits
 */
const RawMaterialDimensionalPage = ({ onBack, heats = [], productModel = 'ERC-12', onNavigateSubmodule, inspectionCallNo = '' }) => {
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

  // Per-heat Dimensional state (20 samples per heat)
  const [heatDimData, setHeatDimData] = useState(() => {
    const draft = loadDraftData();
    if (draft?.heatDimData) {
      return draft.heatDimData;
    }
    return heats.map(() => ({
      dimSamples: Array.from({ length: 20 }).map(() => ({ diameter: '' })),
    }));
  });

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

  // Auto-save to localStorage (persist while switching submodules)
  useEffect(() => {
    const storageKey = `${STORAGE_KEY}_${inspectionCallNo}`;
    const draftData = { heatDimData };
    localStorage.setItem(storageKey, JSON.stringify(draftData));
  }, [heatDimData, inspectionCallNo]);

  return (
    <div className="dimensional-page-container">
      <div className="dimensional-page-header">
        <h1 className="dimensional-page-title">📐 Dimensional Check</h1>
        <button className="dimensional-back-btn" onClick={onBack}>
          ← Back to Raw Material Dashboard
        </button>
      </div>

      {/* Submodule Navigation */}
      <RawMaterialSubmoduleNav
        currentSubmodule="dimensional-check"
        onNavigate={onNavigateSubmodule}
      />

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
    </div>
  );
};

export default RawMaterialDimensionalPage;

