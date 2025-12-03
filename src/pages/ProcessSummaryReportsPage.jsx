import React, { useState } from 'react';
import ProcessLineToggle from '../components/ProcessLineToggle';
import StatusBadge from '../components/StatusBadge';
import FormField from '../components/FormField';

const ProcessSummaryReportsPage = ({ onBack, selectedLines = [] }) => {
  const [activeLine, setActiveLine] = useState((selectedLines && selectedLines[0]) || 'Line-1');
  // Mock data for summary
  const lotNumbers = ['LOT-001', 'LOT-002'];
  const heatNumbersMap = { 'LOT-001': 'H001', 'LOT-002': 'H002' };

  return (
    <div>
      {/* Line selector bar */}
      {selectedLines.length > 0 && (
        <ProcessLineToggle selectedLines={selectedLines} activeLine={activeLine} onChange={setActiveLine} />
      )}

      <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 className="page-title">Summary / Reports</h1>
          <p className="page-subtitle">Process Material Inspection - Consolidated overview of all inspection activities</p>
        </div>
        <button className="btn btn-outline" onClick={onBack}>
          ← Back to Process Dashboard
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Inspection Summary - Auto-Compiled from All Sub-Modules</h3>
          <p className="card-subtitle">Consolidated overview of all inspection and testing activities</p>
        </div>
        <div className="alert alert-success">
          ✓ Process inspection completed
        </div>
        <div style={{ marginBottom: 'var(--space-24)' }}>
          <h4 style={{ marginBottom: 'var(--space-12)' }}>Pre-Inspection Data:</h4>
          <p><strong>Lot Numbers:</strong> {lotNumbers.join(', ')}</p>
          <p><strong>Heat Numbers Mapped:</strong> {Object.entries(heatNumbersMap).map(([lot, heat]) => `${lot} → ${heat}`).join(', ')}</p>
        </div>
        <div style={{ marginBottom: 'var(--space-24)' }}>
          <h4 style={{ marginBottom: 'var(--space-12)' }}>Static Periodic Checks:</h4>
          <p>Shearing Press ≥ 100MT: ✓ Yes</p>
          <p>Forging Press ≥ 150MT: ✓ Yes</p>
          <p>Reheating Furnace Induction Type: ✓ Yes</p>
          <p>Quenching within 20 seconds: ✓ Yes</p>
        </div>
        <div style={{ marginBottom: 'var(--space-24)' }}>
          <h4 style={{ marginBottom: 'var(--space-12)' }}>Oil Tank Counter:</h4>
          <p>Current Count: 45,000 ERCs</p>
          <p>Status: ✓ Normal</p>
        </div>
        <div style={{ marginBottom: 'var(--space-24)' }}>
          <h4 style={{ marginBottom: 'var(--space-12)' }}>Calibration Status:</h4>
          <p>All instruments are calibrated and within valid range</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Final Inspection Results (Auto-Populated)</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Heat No.</th>
                <th>Accepted / Rejected</th>
                <th>Weight of Material (Auto)</th>
                <th>Remarks (Manual Entry, Required)</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(heatNumbersMap).map(heat => (
                <tr key={heat}>
                  <td><strong>{heat}</strong></td>
                  <td><StatusBadge status="Valid" /> Accepted</td>
                  <td>850 kg</td>
                  <td>
                    <input type="text" className="form-control" placeholder="Enter remarks..." />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">IE Final Review</h3>
        </div>
        <FormField label="IE Remarks / Notes" required>
          <textarea className="form-control" rows="4" placeholder="Enter your final remarks..."></textarea>
        </FormField>
        <div style={{ display: 'flex', gap: 'var(--space-16)', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline">Pause Inspection</button>
          <button className="btn btn-secondary" onClick={() => { if (window.confirm('Are you sure you want to reject this process?')) { alert('Process rejected'); } }}>Reject Process</button>
          <button className="btn btn-primary" onClick={() => { alert('Process accepted and inspection completed!'); onBack(); }}>Accept &amp; Complete</button>
        </div>
      </div>
    </div>
  </div>

  );
};

export default ProcessSummaryReportsPage;

