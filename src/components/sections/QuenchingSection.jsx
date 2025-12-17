import React, { useState } from 'react';
import './QuenchingSection.css';

const QuenchingSection = ({
  data,
  onDataChange,
  availableLotNumbers,
  hourLabels,
  visibleRows,
  showAll,
  onToggleShowAll
}) => {
  const [expanded] = useState(true);

  // Check if Duration is taken in first hour (Once/Shift rule)
  const isDurationTakenInFirstHour = data[0]?.quenchingDuration && data[0].quenchingDuration !== '';

  const updateData = (idx, field, value, sampleIndex = null) => {
    const newData = [...data];
    if (sampleIndex !== null && Array.isArray(newData[idx][field])) {
      const fieldArray = [...newData[idx][field]];
      fieldArray[sampleIndex] = value;
      newData[idx][field] = fieldArray;
    } else {
      newData[idx][field] = value;
    }
    onDataChange(newData);
  };

  return (
    <div className="quenching-section">
      <div className="quenching-section__header">
        <div>
          <h3 className="quenching-section__title">Quenching Section - 8 Hour Grid</h3>
          <p className="quenching-section__subtitle">Enter hourly quenching production data</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary quenching-section__toggle"
          onClick={onToggleShowAll}
          title={showAll ? 'Show current hour only' : 'Show all 8 hours'}
        >
          {showAll ? '\u2212' : '+'}
        </button>
      </div>

      {expanded && (
        <div className="quenching-table-wrapper">
          {/* Desktop Table Layout */}
          <table className="quenching-table">
            <thead>
              <tr>
                <th className="quenching-th quenching-th--time">Time Range</th>
                <th className="quenching-th quenching-th--checkbox">No Production</th>
                <th className="quenching-th quenching-th--lot">Lot No.</th>
                <th className="quenching-th quenching-th--temp">Quenching Temp.</th>
                <th className="quenching-th quenching-th--duration">
                  Quenching Duration
                  <br /><small className="quenching-th__hint">Once/Shift</small>
                </th>
                <th className="quenching-th quenching-th--hardness">Quenching Hardness</th>
                <th className="quenching-th quenching-th--remarks">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows(data, showAll).map(({ row, idx }) => {
                // Once/Shift rule: if taken in 1st hour, show hint in other hours
                const showDurationHint = idx > 0 && isDurationTakenInFirstHour;

                return (
                  <React.Fragment key={row.hour}>
                    {/* Row 1: First hardness input */}
                    <tr className="quenching-row">
                      <td rowSpan="3" className="quenching-td quenching-td--time">
                        <strong>{hourLabels[idx]}</strong>
                      </td>
                      <td rowSpan="3" className="quenching-td quenching-td--checkbox">
                        <input
                          type="checkbox"
                          checked={row.noProduction}
                          onChange={e => updateData(idx, 'noProduction', e.target.checked)}
                          className="quenching-checkbox"
                        />
                      </td>
                      <td rowSpan="2" className="quenching-td quenching-td--lot">
                        <select
                          className="form-control quenching-select"
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
                      <td rowSpan="2" className="quenching-td quenching-td--temp-input">
                        <input
                          type="number"
                          className="form-control quenching-input"
                          placeholder="°C"
                          value={row.quenchingTemperature}
                          onChange={e => updateData(idx, 'quenchingTemperature', e.target.value)}
                          disabled={row.noProduction}
                        />
                      </td>
                      <td rowSpan="2" className="quenching-td quenching-td--duration-input">
                        {showDurationHint ? (
                          <span className="quenching-hint">Taken in Hr 1</span>
                        ) : (
                          <input
                            type="number"
                            className="form-control quenching-input"
                            placeholder="min"
                            value={row.quenchingDuration}
                            onChange={e => updateData(idx, 'quenchingDuration', e.target.value)}
                            disabled={row.noProduction}
                          />
                        )}
                      </td>
                      <td className="quenching-td quenching-td--hardness-input">
                        <input
                          type="number"
                          className="form-control quenching-input"
                          placeholder="HRc"
                          value={row.quenchingHardness[0]}
                          onChange={e => updateData(idx, 'quenchingHardness', e.target.value, 0)}
                          disabled={row.noProduction}
                        />
                      </td>
                      <td rowSpan="3" className="quenching-td quenching-td--remarks">
                        <input
                          type="text"
                          className="form-control quenching-input"
                          value={row.remarks}
                          onChange={e => updateData(idx, 'remarks', e.target.value)}
                        />
                      </td>
                    </tr>
                    {/* Row 2: Second hardness input */}
                    <tr className="quenching-row">
                      <td className="quenching-td quenching-td--hardness-input">
                        <input
                          type="number"
                          className="form-control quenching-input"
                          placeholder="HRc"
                          value={row.quenchingHardness[1]}
                          onChange={e => updateData(idx, 'quenchingHardness', e.target.value, 1)}
                          disabled={row.noProduction}
                        />
                      </td>
                    </tr>
                    {/* Row 3: Rejected No. */}
                    <tr className="quenching-row quenching-row--rejected">
                      <td className="quenching-td quenching-td--rejected-label">
                        <span className="quenching-rejected-label">Rejected No.</span>
                      </td>
                      <td className="quenching-td quenching-td--placeholder">-</td>
                      <td className="quenching-td quenching-td--placeholder">-</td>
                      <td className="quenching-td quenching-td--rejected-input">
                        <input
                          type="number"
                          className="form-control quenching-input quenching-input--rejected"
                          value={row.rejectedQty}
                          onChange={e => updateData(idx, 'rejectedQty', e.target.value)}
                          disabled={row.noProduction}
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="quenching-mobile-cards">
            {visibleRows(data, showAll).map(({ row, idx }) => {
              const showDurationHint = idx > 0 && isDurationTakenInFirstHour;
              return (
                <div key={row.hour} className="quenching-mobile-card">
                  <div className="quenching-mobile-card__header">
                    <span className="quenching-mobile-card__time">{hourLabels[idx]}</span>
                    <label className="quenching-mobile-checkbox-label">
                      <input
                        type="checkbox"
                        checked={row.noProduction}
                        onChange={e => updateData(idx, 'noProduction', e.target.checked)}
                        className="quenching-checkbox"
                      />
                      <span>No Prod</span>
                    </label>
                  </div>
                  <div className="quenching-mobile-card__body">
                    <div className="quenching-mobile-field">
                      <span className="quenching-mobile-field__label">Lot No.</span>
                      <div className="quenching-mobile-field__value">
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
                    <div className="quenching-mobile-field">
                      <span className="quenching-mobile-field__label">Quenching Temp.</span>
                      <div className="quenching-mobile-field__value">
                        <input
                          type="number"
                          placeholder="°C"
                          value={row.quenchingTemperature}
                          onChange={e => updateData(idx, 'quenchingTemperature', e.target.value)}
                          disabled={row.noProduction}
                        />
                      </div>
                    </div>
                    <div className="quenching-mobile-field">
                      <span className="quenching-mobile-field__label">Duration</span>
                      <div className="quenching-mobile-field__value">
                        {showDurationHint ? (
                          <span className="quenching-hint">Taken in Hr 1</span>
                        ) : (
                          <input
                            type="number"
                            placeholder="min"
                            value={row.quenchingDuration}
                            onChange={e => updateData(idx, 'quenchingDuration', e.target.value)}
                            disabled={row.noProduction}
                          />
                        )}
                      </div>
                    </div>
                    <div className="quenching-mobile-field">
                      <span className="quenching-mobile-field__label">Hardness</span>
                      <div className="quenching-mobile-field__value quenching-mobile-field__value--multi">
                        {[0, 1].map(sampleIdx => (
                          <input
                            key={sampleIdx}
                            type="number"
                            placeholder={`S${sampleIdx + 1}`}
                            value={row.quenchingHardness[sampleIdx]}
                            onChange={e => updateData(idx, 'quenchingHardness', e.target.value, sampleIdx)}
                            disabled={row.noProduction}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="quenching-mobile-field">
                      <span className="quenching-mobile-field__label">Remarks</span>
                      <div className="quenching-mobile-field__value">
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={e => updateData(idx, 'remarks', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="quenching-mobile-field quenching-mobile-field--rejected">
                      <span className="quenching-mobile-field__label">Rejected No.</span>
                      <div className="quenching-mobile-field__value">
                        <input
                          type="number"
                          value={row.rejectedQty}
                          onChange={e => updateData(idx, 'rejectedQty', e.target.value)}
                          disabled={row.noProduction}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuenchingSection;

