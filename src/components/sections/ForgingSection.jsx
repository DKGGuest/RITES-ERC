import React, { useState } from 'react';
import './ForgingSection.css';

const ForgingSection = ({
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
    <div className="forging-section">
      <div className="forging-section__header">
        <div>
          <h3 className="forging-section__title">Forging Section - 8 Hour Grid</h3>
          <p className="forging-section__subtitle">Enter hourly forging production data</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary forging-section__toggle"
          onClick={onToggleShowAll}
          title={showAll ? 'Show current hour only' : 'Show all 8 hours'}
        >
          {showAll ? '\u2212' : '+'}
        </button>
      </div>

      {expanded && (
        <div className="forging-table-wrapper">
          {/* Desktop Table Layout */}
          <table className="forging-table">
            <thead>
              <tr>
                <th className="forging-th forging-th--time">Time Range</th>
                <th className="forging-th forging-th--checkbox">No Production</th>
                <th className="forging-th forging-th--lot">Lot No.</th>
                <th className="forging-th forging-th--temp">Forging Temp.</th>
                <th className="forging-th forging-th--remarks">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows(data, showAll).map(({ row, idx }) => (
                <React.Fragment key={row.hour}>
                  {/* Row 1: Dropdown and Forging Temp */}
                  <tr className="forging-row">
                    <td rowSpan="2" className="forging-td forging-td--time">
                      <strong>{hourLabels[idx]}</strong>
                    </td>
                    <td rowSpan="2" className="forging-td forging-td--checkbox">
                      <input
                        type="checkbox"
                        checked={row.noProduction}
                        onChange={e => updateData(idx, 'noProduction', e.target.checked)}
                        className="forging-checkbox"
                      />
                    </td>
                    <td className="forging-td forging-td--lot">
                      <select
                        className="form-control forging-select"
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
                    <td className="forging-td forging-td--temp-input">
                      <input
                        type="number"
                        className="form-control forging-input"
                        placeholder="°C"
                        value={row.forgingTemperature[0] || ''}
                        onChange={e => updateData(idx, 'forgingTemperature', e.target.value, 0)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td rowSpan="2" className="forging-td forging-td--remarks">
                      <input
                        type="text"
                        className="form-control forging-input"
                        value={row.remarks}
                        onChange={e => updateData(idx, 'remarks', e.target.value)}
                      />
                    </td>
                  </tr>
                  {/* Row 2: Rejected No. */}
                  <tr className="forging-row forging-row--rejected">
                    <td className="forging-td forging-td--rejected-label">
                      <span className="forging-rejected-label">Rejected No.</span>
                    </td>
                    <td className="forging-td forging-td--rejected-input">
                      <input
                        type="number"
                        className="form-control forging-input forging-input--rejected"
                        value={row.rejectedQty}
                        onChange={e => updateData(idx, 'rejectedQty', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Mobile Card Layout - will be added next */}
          <div className="forging-mobile-cards">
            {visibleRows(data, showAll).map(({ row, idx }) => (
              <div key={row.hour} className="forging-mobile-card">
                <div className="forging-mobile-card__header">
                  <span className="forging-mobile-card__time">{hourLabels[idx]}</span>
                  <input
                    type="checkbox"
                    checked={row.noProduction}
                    onChange={e => updateData(idx, 'noProduction', e.target.checked)}
                    className="forging-checkbox"
                  />
                </div>
                <div className="forging-mobile-card__body">
                  <div className="forging-mobile-field">
                    <span className="forging-mobile-field__label">Lot No.</span>
                    <div className="forging-mobile-field__value">
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
                  <div className="forging-mobile-field">
                    <span className="forging-mobile-field__label">Forging Temp.</span>
                    <div className="forging-mobile-field__value">
                      <input
                        type="number"
                        placeholder="°C"
                        value={row.forgingTemperature[0] || ''}
                        onChange={e => updateData(idx, 'forgingTemperature', e.target.value, 0)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="forging-mobile-field">
                    <span className="forging-mobile-field__label">Remarks</span>
                    <div className="forging-mobile-field__value">
                      <input
                        type="text"
                        value={row.remarks}
                        onChange={e => updateData(idx, 'remarks', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="forging-mobile-field forging-mobile-field--rejected">
                    <span className="forging-mobile-field__label">Rejected No.</span>
                    <div className="forging-mobile-field__value">
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgingSection;

