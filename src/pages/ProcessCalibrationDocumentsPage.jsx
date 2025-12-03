import React, { useState } from 'react';
import CalibrationModule from '../components/CalibrationModule';
import ProcessLineToggle from '../components/ProcessLineToggle';

const ProcessCalibrationDocumentsPage = ({ onBack, selectedLines = [] }) => {
  const [activeLine, setActiveLine] = useState((selectedLines && selectedLines[0]) || 'Line-1');
  return (
    <div>
      {/* Line selector bar */}
      {selectedLines.length > 0 && (
        <ProcessLineToggle
          selectedLines={selectedLines}
          activeLine={activeLine}
          onChange={setActiveLine}
        />
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 className="page-title">Calibration & Documents</h1>
          <p className="page-subtitle">Process Material Inspection - Verify instrument calibration</p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>
          ← Back to Process Dashboard
        </button>
      </div>

      <CalibrationModule />

      <div style={{ marginTop: 'var(--space-24)', display: 'flex', gap: 'var(--space-16)', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { alert('Calibration data saved!'); onBack(); }}>Save & Continue</button>
      </div>
    </div>
  );
};

export default ProcessCalibrationDocumentsPage;

