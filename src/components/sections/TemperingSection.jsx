import React, { useState } from 'react';
import './TemperingSection.css';

const TemperingSection = ({
  data,
  onDataChange,
  availableLotNumbers,
  hourLabels,
  visibleRows,
  showAll,
  onToggleShowAll,
  finalCheckData
}) => {
  const [expanded] = useState(true);

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

  // Calculate Total Rejection at Tempering Section
  // = rejection of Tempering Temp + rejection of Tempering Duration + sum of all hours of temperingHardnessRejected from Final Check
  const getTotalRejection = (hourIndex) => {
    let totalRejection = 0;

    const tempData = data[hourIndex];

    // Add rejection of Tempering Temp
    if (tempData && tempData.temperingTemperatureRejected) {
      totalRejection += parseInt(tempData.temperingTemperatureRejected) || 0;
    }

    // Add rejection of Tempering Duration
    if (tempData && tempData.temperingDurationRejected) {
      totalRejection += parseInt(tempData.temperingDurationRejected) || 0;
    }

    // Add sum of all hours of temperingHardnessRejected from Final Check
    if (finalCheckData && Array.isArray(finalCheckData)) {
      finalCheckData.forEach(row => {
        if (row && row.temperingHardnessRejected) {
          totalRejection += parseInt(row.temperingHardnessRejected) || 0;
        }
      });
    }

    return totalRejection;
  };

  return (
    <div className="tempering-section">
      <div className="tempering-section__header">
        <div>
          <h3 className="tempering-section__title">Tempering Section</h3>
          <p className="tempering-section__subtitle">Enter hourly tempering production data</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary tempering-section__toggle"
          onClick={onToggleShowAll}
          title={showAll ? 'Show current hour only' : 'Show all 8 hours'}
        >
          {showAll ? '\u2212' : '+'}
        </button>
      </div>

      {expanded && (
        <div className="tempering-table-wrapper">
          {/* Desktop Table Layout */}
          <table className="tempering-table">
            <tbody>
              {visibleRows(data, showAll).map(({ row, idx }) => {
                const totalRejection = getTotalRejection(idx);

                return (
                  <React.Fragment key={row.hour}>
                    {/* Header row for this hour block */}
                    <tr className={`tempering-header-row${row.noProduction ? ' no-production' : ''}`}>
                      <th className="tempering-th tempering-th--time">Time Range</th>
                      <th className="tempering-th tempering-th--checkbox">No Production</th>
                      <th className="tempering-th tempering-th--lot">Lot No.</th>
                      <th className="tempering-th tempering-th--temp">Tempering Temp.</th>
                      <th className="tempering-th tempering-th--duration">Tempering Duration</th>
                      <th className="tempering-th tempering-th--total-rejection">Total Rejection at Tempering Section</th>
                    </tr>
                    {/* Row 1: First sample */}
                    <tr className={`tempering-row${row.noProduction ? ' no-production' : ''}`}>
                      <td rowSpan="4" className="tempering-td tempering-td--time">
                        <strong>{hourLabels[idx]}</strong>
                      </td>
                      <td rowSpan="4" className="tempering-td tempering-td--checkbox">
                        <input
                          type="checkbox"
                          checked={row.noProduction}
                          onChange={e => updateData(idx, 'noProduction', e.target.checked)}
                          className="tempering-checkbox"
                        />
                      </td>
                      <td rowSpan="2" className="tempering-td tempering-td--lot">
                        <select
                          className="form-control tempering-select"
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
                      <td className="tempering-td tempering-td--temp-input">
                        <input
                          type="number"
                          step="0.1"
                          className="form-control tempering-input"
                          placeholder="°C"
                          value={row.temperingTemperature[0] || ''}
                          onChange={e => updateData(idx, 'temperingTemperature', e.target.value, 0)}
                          disabled={row.noProduction}
                        />
                      </td>
                      <td className="tempering-td tempering-td--duration-input">
                        <input
                          type="number"
                          step="0.1"
                          className="form-control tempering-input"
                          placeholder="min"
                          value={row.temperingDuration[0] || ''}
                          onChange={e => updateData(idx, 'temperingDuration', e.target.value, 0)}
                          disabled={row.noProduction}
                        />
                      </td>
                      <td rowSpan="3" className="tempering-td tempering-td--total-rejection">
                        <span className="tempering-total-rejection">{totalRejection}</span>
                      </td>
                    </tr>
                    {/* Row 2: Second sample */}
                    <tr className={`tempering-row${row.noProduction ? ' no-production' : ''}`}>
                      <td className="tempering-td tempering-td--temp-input">
                        <input
                          type="number"
                          step="0.1"
                          className="form-control tempering-input"
                          placeholder="°C"
                          value={row.temperingTemperature[1] || ''}
                          onChange={e => updateData(idx, 'temperingTemperature', e.target.value, 1)}
                          disabled={row.noProduction}
                        />
                      </td>
                      <td className="tempering-td tempering-td--duration-input">
                        <input
                          type="number"
                          step="0.1"
                          className="form-control tempering-input"
                          placeholder="min"
                          value={row.temperingDuration[1] || ''}
                          onChange={e => updateData(idx, 'temperingDuration', e.target.value, 1)}
                          disabled={row.noProduction}
                        />
                      </td>
                    </tr>
                    {/* Row 3: Rejected No. for Tempering Temp and Duration */}
                    <tr className={`tempering-row tempering-row--rejected${row.noProduction ? ' no-production' : ''}`}>
                      <td className="tempering-td tempering-td--rejected-label">
                        <span className="tempering-rejected-label">Rejected No.</span>
                      </td>
                      <td className="tempering-td tempering-td--rejected-input">
                        <input
                          type="number"
                          className="form-control tempering-input"
                          placeholder="0"
                          value={row.temperingTemperatureRejected || ''}
                          onChange={e => updateData(idx, 'temperingTemperatureRejected', e.target.value)}
                          disabled={row.noProduction}
                        />
                      </td>
                      <td className="tempering-td tempering-td--rejected-input">
                        <input
                          type="number"
                          className="form-control tempering-input"
                          placeholder="0"
                          value={row.temperingDurationRejected || ''}
                          onChange={e => updateData(idx, 'temperingDurationRejected', e.target.value)}
                          disabled={row.noProduction}
                        />
                      </td>
                    </tr>
                    {/* Row 4: Remarks */}
                    <tr className={`tempering-row tempering-row--remarks${row.noProduction ? ' no-production' : ''}`}>
                      <td className="tempering-td tempering-td--remarks-label">
                        <span className="tempering-remarks-label">Remarks</span>
                      </td>
                      <td colSpan="3" className="tempering-td tempering-td--remarks-input">
                        <input
                          type="text"
                          className="form-control tempering-input"
                          value={row.remarks}
                          onChange={e => updateData(idx, 'remarks', e.target.value)}
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="tempering-mobile-cards">
            {visibleRows(data, showAll).map(({ row, idx }) => {
              const totalRejection = getTotalRejection(idx);

              return (
                <div key={row.hour} className={`tempering-mobile-card${row.noProduction ? ' no-production' : ''}`}>
                  <div className="tempering-mobile-card__header">
                    <span className="tempering-mobile-card__time">{hourLabels[idx]}</span>
                    <label className="tempering-mobile-checkbox-label">
                      <input
                        type="checkbox"
                        checked={row.noProduction}
                        onChange={e => updateData(idx, 'noProduction', e.target.checked)}
                        className="tempering-checkbox"
                      />
                      <span>No Prod</span>
                    </label>
                  </div>
                  <div className="tempering-mobile-card__body">
                    <div className="tempering-mobile-field">
                      <span className="tempering-mobile-field__label">Lot No.</span>
                      <div className="tempering-mobile-field__value">
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
                    <div className="tempering-mobile-field">
                      <span className="tempering-mobile-field__label">Tempering Temp.</span>
                      <div className="tempering-mobile-field__value tempering-mobile-field__value--multi">
                        {[0, 1].map(sampleIdx => (
                          <input
                            key={sampleIdx}
                            type="number"
                            step="0.1"
                            placeholder={`S${sampleIdx + 1}`}
                            value={row.temperingTemperature[sampleIdx] || ''}
                            onChange={e => updateData(idx, 'temperingTemperature', e.target.value, sampleIdx)}
                            disabled={row.noProduction}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="tempering-mobile-field">
                      <span className="tempering-mobile-field__label">Tempering Duration</span>
                      <div className="tempering-mobile-field__value tempering-mobile-field__value--multi">
                        {[0, 1].map(sampleIdx => (
                          <input
                            key={sampleIdx}
                            type="number"
                            step="0.1"
                            placeholder={`S${sampleIdx + 1}`}
                            value={row.temperingDuration[sampleIdx] || ''}
                            onChange={e => updateData(idx, 'temperingDuration', e.target.value, sampleIdx)}
                            disabled={row.noProduction}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="tempering-mobile-field">
                      <span className="tempering-mobile-field__label">Rejected No. (Temp)</span>
                      <div className="tempering-mobile-field__value">
                        <input
                          type="number"
                          placeholder="0"
                          value={row.temperingTemperatureRejected || ''}
                          onChange={e => updateData(idx, 'temperingTemperatureRejected', e.target.value)}
                          disabled={row.noProduction}
                        />
                      </div>
                    </div>
                    <div className="tempering-mobile-field">
                      <span className="tempering-mobile-field__label">Rejected No. (Duration)</span>
                      <div className="tempering-mobile-field__value">
                        <input
                          type="number"
                          placeholder="0"
                          value={row.temperingDurationRejected || ''}
                          onChange={e => updateData(idx, 'temperingDurationRejected', e.target.value)}
                          disabled={row.noProduction}
                        />
                      </div>
                    </div>
                    <div className="tempering-mobile-field">
                      <span className="tempering-mobile-field__label">Total Rejection</span>
                      <div className="tempering-mobile-field__value">
                        <span className="tempering-total-rejection">{totalRejection}</span>
                      </div>
                    </div>
                    <div className="tempering-mobile-field">
                      <span className="tempering-mobile-field__label">Remarks</span>
                      <div className="tempering-mobile-field__value">
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={e => updateData(idx, 'remarks', e.target.value)}
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

export default TemperingSection;

