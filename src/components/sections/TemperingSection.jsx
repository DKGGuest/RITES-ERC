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

  const updateData = (idx, field, value) => {
    const newData = [...data];
    newData[idx][field] = value;
    onDataChange(newData);
  };

  // Calculate sum of rejected numbers from Final Check Section for each hour
  const getRejectedSum = (hourIndex) => {
    if (!finalCheckData || !finalCheckData[hourIndex]) return 0;
    const rejected = finalCheckData[hourIndex].rejectedNo;
    if (!rejected || !Array.isArray(rejected)) return 0;
    return rejected.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  };

  // Find the first hour where tempering duration was entered (Once/Shift rule)
  // This handles cases where user enters data in the middle of the hour range
  const findFirstHourWithDuration = () => {
    for (let i = 0; i < data.length; i++) {
      if (data[i]?.temperingDuration && data[i].temperingDuration.toString().trim() !== '') {
        return i;
      }
    }
    return -1; // No duration entered yet
  };

  const firstHourWithDuration = findFirstHourWithDuration();
  const isDurationTakenInFirstHour = firstHourWithDuration >= 0;

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
          <table className="tempering-table">
            <thead>
              <tr>
                <th className="tempering-th tempering-th--time">Time Range</th>
                <th className="tempering-th tempering-th--checkbox">No Production</th>
                <th className="tempering-th tempering-th--lot">Lot No.</th>
                <th className="tempering-th tempering-th--temp">Tempering<br/>Temp.</th>
                <th className="tempering-th tempering-th--duration">
                  Tempering<br/>Duration
                  <br /><small className="tempering-th__hint">Once/Shift</small>
                </th>
                <th className="tempering-th tempering-th--remarks">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows(data, showAll).map(({ row, idx }) => {
                // Once/Shift rule: Duration is disabled for hours AFTER the first hour with duration
                const showDurationHint = isDurationTakenInFirstHour && idx !== firstHourWithDuration;
                const rejectedSum = getRejectedSum(idx);

                return (
                  <React.Fragment key={row.hour}>
                    {/* Row 1: Main inputs */}
                    <tr className="tempering-row">
                      <td rowSpan="2" className="tempering-td tempering-td--time">
                        <strong>{hourLabels[idx]}</strong>
                      </td>
                      <td rowSpan="2" className="tempering-td tempering-td--checkbox">
                        <input
                          type="checkbox"
                          checked={row.noProduction}
                          onChange={e => updateData(idx, 'noProduction', e.target.checked)}
                          className="tempering-checkbox"
                        />
                      </td>
                      <td className="tempering-td tempering-td--lot">
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
                      <td className="tempering-td tempering-td--temp">
                        {/* Tempering Temperature: Editable for EVERY hour (no restrictions) */}
                        <input
                          type="number"
                          step="0.1"
                          className="form-control tempering-input"
                          placeholder="°C"
                          value={row.temperingTemperature}
                          onChange={e => updateData(idx, 'temperingTemperature', e.target.value)}
                          disabled={row.noProduction}
                        />
                      </td>
                      <td className="tempering-td tempering-td--duration">
                        {/* Tempering Duration: Once per Shift rule - disabled after first entry */}
                        {showDurationHint ? (
                          <span className="tempering-hint">Taken in {hourLabels[firstHourWithDuration]}</span>
                        ) : (
                          <input
                            type="number"
                            className="form-control tempering-input"
                            placeholder="min"
                            value={row.temperingDuration}
                            onChange={e => updateData(idx, 'temperingDuration', e.target.value)}
                            disabled={row.noProduction}
                          />
                        )}
                      </td>
                      <td rowSpan="2" className="tempering-td tempering-td--remarks">
                        <input
                          type="text"
                          className="form-control tempering-input"
                          value={row.remarks}
                          onChange={e => updateData(idx, 'remarks', e.target.value)}
                        />
                      </td>
                    </tr>
                    {/* Row 2: Rejected No. with sum from Final Check */}
                    <tr className="tempering-row tempering-row--rejected">
                      <td className="tempering-td tempering-td--rejected-label">
                        <span className="tempering-rejected-label">Rejected No.</span>
                      </td>
                      <td colSpan="2" className="tempering-td tempering-td--rejected-sum">
                        <span className="tempering-rejected-sum">{rejectedSum || '-'}</span>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TemperingSection;

