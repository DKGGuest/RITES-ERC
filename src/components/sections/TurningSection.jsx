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
            <thead>
              <tr>
                <th className="turning-th turning-th--time">Time Range</th>
                <th className="turning-th turning-th--checkbox">No Production</th>
                <th className="turning-th turning-th--lot">Lot No.</th>
                <th className="turning-th turning-th--length">Turning Length</th>
                <th className="turning-th turning-th--dia">Turned Bar Dia</th>
                <th className="turning-th turning-th--remarks">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows(data, showAll).map(({ row, idx }) => (
                <>
                  {/* Row 1: First input row */}
                  <tr key={`${row.hour}-r1`} className="turning-row">
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
                        <option value="">Dropdown</option>
                        {availableLotNumbers.map(lot => (
                          <option key={lot} value={lot}>{lot}</option>
                        ))}
                      </select>
                    </td>
                    <td className="turning-td turning-td--length-input">
                      <input
                        type="text"
                        className="form-control turning-length-input"
                        value={row.straightLength[0] || ''}
                        onChange={e => updateData(idx, 'straightLength', e.target.value, 0)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="turning-td turning-td--dia-input">
                      <input
                        type="text"
                        className="form-control turning-dia-input"
                        value={row.dia[0] || ''}
                        onChange={e => updateData(idx, 'dia', e.target.value, 0)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td rowSpan="4" className="turning-td turning-td--remarks">
                      <input
                        type="text"
                        className="form-control turning-input"
                        value={row.remarks}
                        onChange={e => updateData(idx, 'remarks', e.target.value)}
                      />
                    </td>
                  </tr>
                  {/* Row 2: Second input row */}
                  <tr key={`${row.hour}-r2`} className="turning-row">
                    <td className="turning-td turning-td--length-input">
                      <input
                        type="text"
                        className="form-control turning-length-input"
                        value={row.straightLength[1] || ''}
                        onChange={e => updateData(idx, 'straightLength', e.target.value, 1)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="turning-td turning-td--dia-input">
                      <input
                        type="text"
                        className="form-control turning-dia-input"
                        value={row.dia[1] || ''}
                        onChange={e => updateData(idx, 'dia', e.target.value, 1)}
                        disabled={row.noProduction}
                      />
                    </td>
                  </tr>
                  {/* Row 3: Third input row */}
                  <tr key={`${row.hour}-r3`} className="turning-row">
                    <td className="turning-td turning-td--length-input">
                      <input
                        type="text"
                        className="form-control turning-length-input"
                        value={row.straightLength[2] || ''}
                        onChange={e => updateData(idx, 'straightLength', e.target.value, 2)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="turning-td turning-td--dia-input">
                      <input
                        type="text"
                        className="form-control turning-dia-input"
                        value={row.dia[2] || ''}
                        onChange={e => updateData(idx, 'dia', e.target.value, 2)}
                        disabled={row.noProduction}
                      />
                    </td>
                  </tr>
                  {/* Row 4: Rejected No. row */}
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
                  </tr>
                </>
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
                        <option value="">Dropdown</option>
                        {availableLotNumbers.map(lot => (
                          <option key={lot} value={lot}>{lot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Turning Length (S1)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="text"
                        value={row.straightLength[0] || ''}
                        onChange={e => updateData(idx, 'straightLength', e.target.value, 0)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Turning Length (S2)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="text"
                        value={row.straightLength[1] || ''}
                        onChange={e => updateData(idx, 'straightLength', e.target.value, 1)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Turning Length (S3)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="text"
                        value={row.straightLength[2] || ''}
                        onChange={e => updateData(idx, 'straightLength', e.target.value, 2)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Turned Bar Dia (S1)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="text"
                        value={row.dia[0] || ''}
                        onChange={e => updateData(idx, 'dia', e.target.value, 0)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Turned Bar Dia (S2)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="text"
                        value={row.dia[1] || ''}
                        onChange={e => updateData(idx, 'dia', e.target.value, 1)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="turning-mobile-field">
                    <span className="turning-mobile-field__label">Turned Bar Dia (S3)</span>
                    <div className="turning-mobile-field__value">
                      <input
                        type="text"
                        value={row.dia[2] || ''}
                        onChange={e => updateData(idx, 'dia', e.target.value, 2)}
                        disabled={row.noProduction}
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

