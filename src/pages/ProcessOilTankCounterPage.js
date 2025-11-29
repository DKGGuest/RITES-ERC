import React, { useState } from 'react';

const ProcessOilTankCounterPage = ({ onBack }) => {
  const [oilTankCounter, setOilTankCounter] = useState(45000);
  const [cleaningDone, setCleaningDone] = useState(false);

  const handleCleaningDone = (checked) => {
    if (checked && window.confirm('Are you sure the oil tank cleaning is complete? This will reset the counter to 0.')) {
      setCleaningDone(true);
      setOilTankCounter(0);
    } else {
      setCleaningDone(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 className="page-title">Oil Tank Counter</h1>
          <p className="page-subtitle">Process Material Inspection - No. of ERC quenched since last Cleaning of Oil Tank</p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>
          ← Back to Process Dashboard
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Oil Tank Counter Sub-Module</h3>
          <p className="card-subtitle">Monitor quenching count and oil tank status</p>
        </div>
        <div style={{ padding: 'var(--space-24)', background: 'var(--color-bg-2)', borderRadius: 'var(--radius-base)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>Auto-Running Counter</div>
          <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-16)', color: oilTankCounter >= 99000 ? 'var(--color-error)' : oilTankCounter >= 90000 ? 'var(--color-warning)' : 'var(--color-success)' }}>
            {oilTankCounter.toLocaleString()} ERCs
          </div>
          {oilTankCounter >= 90000 && oilTankCounter < 99000 && (
            <div className="alert alert-warning" style={{ marginBottom: 'var(--space-16)' }}>
              ⚠ ALERT: Counter reached 90,000 - Oil tank cleaning recommended soon
            </div>
          )}
          {oilTankCounter >= 99000 && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-16)' }}>
              🔒 LOCKED: Counter at 99,000 - Quenching entry section is DISABLED. Oil tank cleaning must be completed and counter reset to continue.
            </div>
          )}
          <div style={{ marginTop: 'var(--space-24)', padding: 'var(--space-20)', background: 'var(--color-surface)', borderRadius: 'var(--radius-base)' }}>
            <div className="checkbox-item" style={{ justifyContent: 'center' }}>
              <input 
                type="checkbox" 
                id="cleaningDone"
                checked={cleaningDone}
                onChange={(e) => handleCleaningDone(e.target.checked)}
                disabled={oilTankCounter === 0}
              />
              <label htmlFor="cleaningDone" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)' }}>Cleaning done in current shift?</label>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-12)' }}>When checked: Counter resets to 0 and starts counting from 0</p>
          </div>
        </div>
        {oilTankCounter >= 99000 && (
          <div style={{ marginTop: 'var(--space-24)', padding: 'var(--space-16)', background: 'rgba(var(--color-error-rgb), 0.1)', borderRadius: 'var(--radius-base)' }}>
            <h4 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-12)' }}>Quenching Entry Section - LOCKED</h4>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>This section is disabled until oil tank cleaning is completed and counter is reset.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'var(--space-24)', display: 'flex', gap: 'var(--space-16)', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { alert('Oil tank counter data saved!'); onBack(); }}>Save & Continue</button>
      </div>
    </div>
  );
};

export default ProcessOilTankCounterPage;

