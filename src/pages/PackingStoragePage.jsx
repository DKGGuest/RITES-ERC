import { useState, useEffect, useCallback } from 'react';
import RawMaterialSubmoduleNav from '../components/RawMaterialSubmoduleNav';
import './PackingStoragePage.css';

const STORAGE_KEY = 'packing_storage_draft_data';

/**
 * Packing & Storage Verification Page - Raw Material Sub-module
 * Verification of packing conditions and storage requirements
 */
const PackingStoragePage = ({ onBack, heats = [], onNavigateSubmodule, inspectionCallNo = '' }) => {

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

  // Packing checklist state
  const [packingChecklist, setPackingChecklist] = useState(() => {
    const draft = loadDraftData();
    if (draft?.packingChecklist) {
      return draft.packingChecklist;
    }
    return {
      bundlingSecure: '',
      tagsAttached: '',
      labelsCorrect: '',
      protectionAdequate: '',
      storageCondition: '',
      moistureProtection: '',
      stackingProper: '',
      remarks: ''
    };
  });

  // Auto-save to localStorage
  useEffect(() => {
    const storageKey = `${STORAGE_KEY}_${inspectionCallNo}`;
    localStorage.setItem(storageKey, JSON.stringify({ packingChecklist }));
  }, [packingChecklist, inspectionCallNo]);

  const updateChecklist = (field, value) => {
    setPackingChecklist(prev => ({ ...prev, [field]: value }));
  };

  const checklistItems = [
    { id: 'bundlingSecure', label: 'Bundling is secure and wire-tied properly' },
    { id: 'tagsAttached', label: 'Identification tags attached to each bundle' },
    { id: 'labelsCorrect', label: 'Labels show correct Heat No., Qty., Grade' },
    { id: 'protectionAdequate', label: 'Protection from mechanical damage is adequate' },
    { id: 'storageCondition', label: 'Storage area is clean and dry' },
    { id: 'moistureProtection', label: 'Moisture protection is in place' },
    { id: 'stackingProper', label: 'Stacking height and arrangement is proper' }
  ];

  return (
    <div className="packing-storage-page-container">
      <div className="packing-storage-page-header">
        <h1 className="packing-storage-page-title">📦 Packing & Storage Verification</h1>
        <button className="packing-storage-back-btn" onClick={onBack}>
          ← Back to Raw Material Dashboard
        </button>
      </div>

      <RawMaterialSubmoduleNav
        currentSubmodule="packing-storage"
        onNavigate={onNavigateSubmodule}
      />

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Packing & Storage Checklist</h3>
          <p className="card-subtitle">Verify packing conditions and storage requirements</p>
        </div>

        {/* Heat Summary */}
        <div className="packing-heat-summary">
          <h4 className="packing-summary-title">Heats Being Inspected:</h4>
          <div className="packing-heat-tags">
            {heats.map((heat, idx) => (
              <span key={idx} className="packing-heat-tag">
                {heat.heatNo || `Heat #${idx + 1}`}
              </span>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="packing-checklist">
          {checklistItems.map(item => (
            <div key={item.id} className="packing-checklist-item">
              <div className="packing-checklist-label">
                <span className="packing-checklist-text">{item.label}</span>
              </div>
              <div className="packing-checklist-options">
                <label className="packing-radio-label">
                  <input
                    type="radio"
                    name={item.id}
                    value="Yes"
                    checked={packingChecklist[item.id] === 'Yes'}
                    onChange={(e) => updateChecklist(item.id, e.target.value)}
                  />
                  <span className="packing-radio-text packing-radio-yes">Yes</span>
                </label>
                <label className="packing-radio-label">
                  <input
                    type="radio"
                    name={item.id}
                    value="No"
                    checked={packingChecklist[item.id] === 'No'}
                    onChange={(e) => updateChecklist(item.id, e.target.value)}
                  />
                  <span className="packing-radio-text packing-radio-no">No</span>
                </label>
                <label className="packing-radio-label">
                  <input
                    type="radio"
                    name={item.id}
                    value="NA"
                    checked={packingChecklist[item.id] === 'NA'}
                    onChange={(e) => updateChecklist(item.id, e.target.value)}
                  />
                  <span className="packing-radio-text packing-radio-na">N/A</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Remarks */}
        <div className="packing-remarks-section">
          <label className="packing-remarks-label">Overall Remarks</label>
          <textarea
            className="form-control packing-remarks-textarea"
            rows="4"
            placeholder="Enter any additional remarks or observations..."
            value={packingChecklist.remarks}
            onChange={(e) => updateChecklist('remarks', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default PackingStoragePage;

