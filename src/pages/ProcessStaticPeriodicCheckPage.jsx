import React, { useState } from 'react';
import ProcessLineToggle from '../components/ProcessLineToggle';

const ProcessStaticPeriodicCheckPage = ({ onBack, selectedLines = [] }) => {
  // Active line + per-line state store
  const [activeLine, setActiveLine] = useState((selectedLines && selectedLines[0]) || 'Line-1');
  const defaultLineState = {
    shearingPress: true,
    forgingPress: true,
    reheatingFurnace: true,
    quenchingTime: true,
    oilTankCounter: 45000,
    cleaningDone: false,
  };
  const [perLineState, setPerLineState] = useState({});

  const current = perLineState[activeLine] || defaultLineState;

  const updateLine = (patch) => {
    setPerLineState((prev) => ({
      ...prev,
      [activeLine]: { ...(prev[activeLine] || defaultLineState), ...patch },
    }));
  };

  const allChecksPassed =
    current.shearingPress && current.forgingPress && current.reheatingFurnace && current.quenchingTime;
  const isCounterLocked = current.oilTankCounter >= 90000;
  const isQuenchingLocked = current.oilTankCounter >= 90000;

  const handleCleaningDone = (checked) => {
    if (checked && window.confirm('Are you sure the oil tank cleaning is complete? This will reset the counter to 0.')) {
      updateLine({ cleaningDone: true, oilTankCounter: 0 });
    } else {
      updateLine({ cleaningDone: false });
    }
  };

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

      <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 className="page-title">Static Periodic Check</h1>
          <p className="page-subtitle">Process Material Inspection - Required field - All checks must be completed</p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>
          ← Back to Process Dashboard
        </button>
      </div>

      {/* Equipment Verification Checks */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Periodic Equipment Checks</h3>
          <p className="card-subtitle">Manual Check box Verification - To be done for each line</p>
        </div>
        <div className="checkbox-group" style={{ gridTemplateColumns: '1fr' }}>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="shearingPress"
              checked={current.shearingPress}
              onChange={(e) => updateLine({ shearingPress: e.target.checked })}
            />
            <label htmlFor="shearingPress" style={{ fontWeight: 'var(--font-weight-medium)' }}>Is Shearing Press Capacity &gt;= 100MT? (Yes/No)</label>
          </div>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="forgingPress"
              checked={current.forgingPress}
              onChange={(e) => updateLine({ forgingPress: e.target.checked })}
            />
            <label htmlFor="forgingPress" style={{ fontWeight: 'var(--font-weight-medium)' }}>Is Forging Press Capacity &gt;= 150MT? (Yes/No)</label>
          </div>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="reheatingFurnace"
              checked={current.reheatingFurnace}
              onChange={(e) => updateLine({ reheatingFurnace: e.target.checked })}
            />
            <label htmlFor="reheatingFurnace" style={{ fontWeight: 'var(--font-weight-medium)' }}>Is type of Reheating Furnace Induction Type? (Yes/No)</label>
          </div>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="quenchingTime"
              checked={current.quenchingTime}
              onChange={(e) => updateLine({ quenchingTime: e.target.checked })}
            />
            <label htmlFor="quenchingTime" style={{ fontWeight: 'var(--font-weight-medium)' }}>Is Quenching Done within 20 seconds after completion of Forging? (Yes/No)</label>
          </div>
        </div>
        {allChecksPassed && (
          <div className="alert alert-success" style={{ marginTop: 'var(--space-24)' }}>
            ✓ All static periodic checks passed
          </div>
        )}
      </div>

      {/* Oil Tank Counter Sub Module */}
      <div className="card" style={{ marginTop: 'var(--space-24)' }}>
        <div className="card-header">
          <h3 className="card-title">🛢️ Oil Tank Counter Sub-Module</h3>
          <p className="card-subtitle">No. of ERC quenched since last Cleaning of Oil Tank (Auto Counter - Required)</p>
        </div>

        <div style={{ padding: 'var(--space-24)', background: 'var(--color-bg-2)', borderRadius: 'var(--radius-base)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>Auto-Running Counter</div>
          <div style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--space-16)',
            color: current.oilTankCounter >= 90000 ? 'var(--color-error)' : current.oilTankCounter >= 80000 ? 'var(--color-warning)' : 'var(--color-success)'
          }}>
            {current.oilTankCounter.toLocaleString()} ERCs
          </div>

          {/* Alert at 90k */}
          {current.oilTankCounter >= 90000 && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-16)' }}>
              🔒 <strong>ALERT:</strong> Counter crossed 90,000! Quenching section entry is <strong>LOCKED</strong>. Oil tank cleaning must be completed and counter reset to continue.
            </div>
          )}

          {current.oilTankCounter >= 80000 && current.oilTankCounter < 90000 && (
            <div className="alert alert-warning" style={{ marginBottom: 'var(--space-16)' }}>
              ⚠ <strong>WARNING:</strong> Counter approaching 90,000 - Oil tank cleaning recommended soon
            </div>
          )}

          {/* Cleaning Checkbox */}
          <div style={{ marginTop: 'var(--space-24)', padding: 'var(--space-20)', background: 'var(--color-surface)', borderRadius: 'var(--radius-base)', border: '2px solid #e2e8f0' }}>
            <div className="checkbox-item" style={{ justifyContent: 'center' }}>
              <input
                type="checkbox"
                id="cleaningDone"
                checked={current.cleaningDone}
                onChange={(e) => handleCleaningDone(e.target.checked)}
                disabled={current.oilTankCounter === 0}
              />
              <label htmlFor="cleaningDone" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                Cleaning done in current shift?
              </label>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-12)' }}>
              If cleaning is done in current shift, then:<br/>
              i. Reset the counter<br/>
              ii. Start adding the ERC quenched after the reset time
            </p>
          </div>
        </div>

        {/* Quenching Entry Lock Warning */}
        {isQuenchingLocked && (
          <div style={{ marginTop: 'var(--space-24)', padding: 'var(--space-16)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-base)', border: '1px solid var(--color-error)' }}>
            <h4 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-12)' }}>🔒 Quenching Entry Section - LOCKED</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-error)' }}>
              This section is disabled until oil tank cleaning is completed and counter is reset.
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'var(--space-24)', display: 'flex', gap: 'var(--space-16)', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        <button
          className="btn btn-primary"
          onClick={() => { alert('Static periodic check saved!'); onBack(); }}
          disabled={isCounterLocked}
        >
          Save & Continue
        </button>
      </div>


    </div>
  </div>

  );
};

export default ProcessStaticPeriodicCheckPage;

