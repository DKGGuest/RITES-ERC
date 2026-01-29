import React, { useState } from 'react';
import './TurningSection.css';

const TurningSection = ({
  data,
  onDataChange,
  availableLotNumbers,
  hourLabels,
  visibleRows,
  showAll,
  onToggleShowAll
}) => {
  const [expanded] = useState(true);

  const updateData = (idx, field, value, sampleIdx = null) => {
    const newData = [...data];
    if (sampleIdx !== null && Array.isArray(newData[idx][field])) {
      const arr = [...newData[idx][field]];
      arr[sampleIdx] = value;
      newData[idx][field] = arr;
    } else {
      newData[idx][field] = value;
    }
    onDataChange(newData);
  };

  return (
    <div className="turning-section">
      <div className="turning-section__header">
        <div>
          <h3 className="turning-section__title">Turning Section - 8 Hour Grid</h3>
          <p className="turning-section__subtitle">Enter hourly turning production data</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary turning-section__toggle"
          onClick={onToggleShowAll}
          title={showAll ? 'Show current hour only' : 'Show all 8 hours'}
        >
          {showAll ? '\u2212' : '+'}
        </button>
      </div>

      {expanded && (
        <div className="turning-table-wrapper">
          {/* Desktop Table Layout */}
          <table className="turning-table">
            <tbody>
              {visibleRows(data, showAll).map(({ row, idx }) => (
                <React.Fragment key={`${row.hour}-group`}>
                  {/* Header row for this hour block */}
                  <tr className="turning-header-row">
                    <th className="turning-th turning-th--time">Time Range</th>
                    <th className="turning-th turning-th--checkbox">No Production</th>
                    <th className="turning-th turning-th--lot">Lot No.</th>
                    <th className="turning-th turning-th--parallel">Parallel Length</th>
                    <th className="turning-th turning-th--full">Full Turning Length</th>
                    <th className="turning-th turning-th--dia">Turning Dia</th>
                  </tr>
                  {/* Row 1: First sample */}
                  <tr className="turning-row">
                    <td rowSpan="4" className="turning-td turning-td--time">
                      <strong>{hourLabels[idx]}</strong>
                    </td>
                    <td rowSpan="4" className="turning-td turning-td--checkbox">
                      <input
                        type="checkbox"
                        checked={row.noProduction}
                        onChange={e => updateData(idx, 'noProduction', e.target.checked)}
                        className="turning-checkbox"
                      />
                    </td>
                    <td rowSpan="3" className="turning-td turning-td--lot">
                      <select
                        className="form-control turning-select"
                        value={row.lotNo}
                        onChange={e => updateData(idx, 'lotNo', e.target.value)}
                        disabled={row.noProduction}
                      >
                        <option value="">Select Lot No.</option>
                        {availableLotNumbers.map(lot => (
                          <option key={lot} value={lot}>{lot}</option>
                        ))}
                      </select>
                    </td>
                    <td className="turning-td turning-td--parallel-input">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control turning-parallel-input"
                        value={row.parallelLength[0] || ''}
                        onChange={e => updateData(idx, 'parallelLength', e.target.value, 0)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </td>
                    <td className="turning-td turning-td--full-input">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control turning-full-input"
                        value={row.fullTurningLength[0] || ''}
                        onChange={e => updateData(idx, 'fullTurningLength', e.target.value, 0)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </td>
                    <td className="turning-td turning-td--dia-input">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control turning-dia-input"
                        value={row.turningDia[0] || ''}
                        onChange={e => updateData(idx, 'turningDia', e.target.value, 0)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </td>
                  </tr>
                  {/* Row 2: Second sample */}
                  <tr key={`${row.hour}-r2`} className="turning-row">
                    <td className="turning-td turning-td--parallel-input">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control turning-parallel-input"
                        value={row.parallelLength[1] || ''}
                        onChange={e => updateData(idx, 'parallelLength', e.target.value, 1)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </td>
                    <td className="turning-td turning-td--full-input">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control turning-full-input"
                        value={row.fullTurningLength[1] || ''}
                        onChange={e => updateData(idx, 'fullTurningLength', e.target.value, 1)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </td>
                    <td className="turning-td turning-td--dia-input">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control turning-dia-input"
                        value={row.turningDia[1] || ''}
                        onChange={e => updateData(idx, 'turningDia', e.target.value, 1)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </td>
                  </tr>
                  {/* Row 3: Third sample */}
                  <tr key={`${row.hour}-r3`} className="turning-row">
                    <td className="turning-td turning-td--parallel-input">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control turning-parallel-input"
                        value={row.parallelLength[2] || ''}
                        onChange={e => updateData(idx, 'parallelLength', e.target.value, 2)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </td>
                    <td className="turning-td turning-td--full-input">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control turning-full-input"
                        value={row.fullTurningLength[2] || ''}
                        onChange={e => updateData(idx, 'fullTurningLength', e.target.value, 2)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </td>
                    <td className="turning-td turning-td--dia-input">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control turning-dia-input"
                        value={row.turningDia[2] || ''}
                        onChange={e => updateData(idx, 'turningDia', e.target.value, 2)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </td>
                  </tr>
                  {/* Row 4: Rejected No. */}
                  <tr key={`${row.hour}-r4`} className="turning-row turning-row--rejected">
                    <td className="turning-td turning-td--rejected-label">
                      <span className="turning-rejected-label">Rejected No.</span>
                    </td>
                    <td className="turning-td turning-td--rejected-input">
                      <input
                        type="number"
                        className="form-control turning-input turning-input--rejected"
                        value={row.rejectedQty[0] || ''}
                        onChange={e => updateData(idx, 'rejectedQty', e.target.value, 0)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="turning-td turning-td--rejected-input">
                      <input
                        type="number"
                        className="form-control turning-input turning-input--rejected"
                        value={row.rejectedQty[1] || ''}
                        onChange={e => updateData(idx, 'rejectedQty', e.target.value, 1)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="turning-td turning-td--rejected-input">
                      <input
                        type="number"
                        className="form-control turning-input turning-input--rejected"
                        value={row.rejectedQty[2] || ''}
                        onChange={e => updateData(idx, 'rejectedQty', e.target.value, 2)}
                        disabled={row.noProduction}
                      />
                    </td>
                  </tr>
                  {/* Row 5: Remarks */}
                  <tr key={`${row.hour}-r5`} className="turning-row turning-row--remarks">
                    <td className="turning-td turning-td--remarks-label">
                      <span className="turning-remarks-label">Remarks</span>
                    </td>
                    <td colSpan="5" className="turning-td turning-td--remarks-input">
                      <input
                        type="text"
                        className="form-control turning-input"
                        value={row.remarks}
                        onChange={e => updateData(idx, 'remarks', e.target.value)}
                      />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="turning-mobile-cards">
            {visibleRows(data, showAll).map(({ row, idx }) => (
              <div key={row.hour} className="turning-mobile-card">
                <div className="turning-mobile-card__header">
                  <span className="turning-mobile-card__time">{hourLabels[idx]}</span>
                  <input
                    type="checkbox"
                    checked={row.noProduction}
                    onChange={e => updateData(idx, 'noProduction', e.target.checked)}
                    className="turning-checkbox"
                  />
                </div>
                <div className="turning-mobile-card__body">
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Lot No.</span>
                    <div className="turning-mobile-field__value">
                      <select
                        value={row.lotNo}
                        onChange={e => updateData(idx, 'lotNo', e.target.value)}
                        disabled={row.noProduction}
                      >
                        <option value="">Select Lot No.</option>
                        {availableLotNumbers.map(lot => (
                          <option key={lot} value={lot}>{lot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Parallel Length (S1)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="number"
                        step="0.01"
                        value={row.parallelLength[0] || ''}
                        onChange={e => updateData(idx, 'parallelLength', e.target.value, 0)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Parallel Length (S2)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="number"
                        step="0.01"
                        value={row.parallelLength[1] || ''}
                        onChange={e => updateData(idx, 'parallelLength', e.target.value, 1)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Parallel Length (S3)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="number"
                        step="0.01"
                        value={row.parallelLength[2] || ''}
                        onChange={e => updateData(idx, 'parallelLength', e.target.value, 2)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Full Turning Length (S1)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="number"
                        step="0.01"
                        value={row.fullTurningLength[0] || ''}
                        onChange={e => updateData(idx, 'fullTurningLength', e.target.value, 0)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Full Turning Length (S2)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="number"
                        step="0.01"
                        value={row.fullTurningLength[1] || ''}
                        onChange={e => updateData(idx, 'fullTurningLength', e.target.value, 1)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Full Turning Length (S3)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="number"
                        step="0.01"
                        value={row.fullTurningLength[2] || ''}
                        onChange={e => updateData(idx, 'fullTurningLength', e.target.value, 2)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Turning Dia (S1)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="number"
                        step="0.01"
                        value={row.turningDia[0] || ''}
                        onChange={e => updateData(idx, 'turningDia', e.target.value, 0)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Turning Dia (S2)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="number"
                        step="0.01"
                        value={row.turningDia[1] || ''}
                        onChange={e => updateData(idx, 'turningDia', e.target.value, 1)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Turning Dia (S3)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="number"
                        step="0.01"
                        value={row.turningDia[2] || ''}
                        onChange={e => updateData(idx, 'turningDia', e.target.value, 2)}
                        disabled={row.noProduction}
                        placeholder="float"
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Remarks</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="text"
                        value={row.remarks}
                        onChange={e => updateData(idx, 'remarks', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field turning-mobile-field--rejected">
                    <span className="turning-mobile-field__label">Rejected No. 1</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="number"
                        value={row.rejectedQty[0] || ''}
                        onChange={e => updateData(idx, 'rejectedQty', e.target.value, 0)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field turning-mobile-field--rejected">
                    <span className="turning-mobile-field__label">Rejected No. 2</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="number"
                        value={row.rejectedQty[1] || ''}
                        onChange={e => updateData(idx, 'rejectedQty', e.target.value, 1)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field turning-mobile-field--rejected">
                    <span className="turning-mobile-field__label">Rejected No. 3</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="number"
                        value={row.rejectedQty[2] || ''}
                        onChange={e => updateData(idx, 'rejectedQty', e.target.value, 2)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TurningSection;

