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

  const clearHour = (updated, idx) => {
    const base = updated[idx] || {};
    updated[idx] = {
      ...base,
      lotNo: '',
      forgingTemperature: [],
      forgingStabilisation: [],
      improperForging: [],
      forgingDefect: [],
      embossingDefect: [],
      remarks: '',
      noProduction: true
    };
  };

  const updateData = (idx, field, value, sampleIdx = null) => {
    const newData = [...data];
    if (field === 'noProduction') {
      if (value === true) {
        clearHour(newData, idx);
        onDataChange(newData);
        return;
      }
      newData[idx] = { ...(newData[idx] || {}), noProduction: false };
      onDataChange(newData);
      return;
    }

    if (sampleIdx !== null) {
      if (!Array.isArray(newData[idx][field])) newData[idx][field] = [];
      const arr = [...newData[idx][field]];
      arr[sampleIdx] = value;
      newData[idx][field] = arr;
    } else {
      newData[idx][field] = value;
    }
    onDataChange(newData);
  };

  // Handle master "No Production" checkbox (toggle all 8 hours)
  const handleMasterNoProduction = (checked) => {
    const newData = [...data];
    newData.forEach((row, idx) => {
      row.noProduction = checked;
      if (checked) {
        clearHour(newData, idx);
      }
    });
    onDataChange(newData);
  };

  // Check if all hours are marked as "No Production"
  const allNoProduction = data.every(row => row.noProduction);

  return (
    <div className="forging-section">
      <div className="forging-section__header">
        <div>
          <h3 className="forging-section__title">Forging Section - 8 Hour Grid</h3>
          <p className="forging-section__subtitle">Enter hourly forging production data</p>
        </div>
        <label className="section-master-no-production-label">
          <input
            type="checkbox"
            checked={allNoProduction}
            onChange={(e) => handleMasterNoProduction(e.target.checked)}
            className="section-master-checkbox"
          />
          <span>No Production (All Hours)</span>
        </label>
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
            <tbody>
              {visibleRows(data, showAll).map(({ row, idx }) => (
                <React.Fragment key={`${row.hour}-group`}>
                  {/* Header row for this hour block */}
                  <tr className={`forging-header-row${row.noProduction ? ' no-production' : ''}`}>
                    <th className="forging-th forging-th--time">Time Range</th>
                    <th className="forging-th forging-th--checkbox">No Production</th>
                    <th className="forging-th forging-th--lot">Lot No.</th>
                    <th className="forging-th forging-th--temp">Forging Temp.</th>
                    <th className="forging-th forging-th--stabilisation">Forging Stabilisation Rejection</th>
                    <th className="forging-th forging-th--improper">Improper Forging</th>
                    <th className="forging-th forging-th--defect">Forging Defect (Marks / Notches)</th>
                    <th className="forging-th forging-th--embossing">Embossing Defect</th>
                  </tr>
                  {/* Row 1: First sample */}
                  <tr key={`${row.hour}-r1`} className={`forging-row${row.noProduction ? ' no-production' : ''}`}>
                    <td rowSpan="3" className="forging-td forging-td--time">
                      <strong>{hourLabels[idx]}</strong>
                    </td>
                    <td rowSpan="3" className="forging-td forging-td--checkbox">
                      <input
                        type="checkbox"
                        checked={row.noProduction}
                        onChange={e => updateData(idx, 'noProduction', e.target.checked)}
                        className="forging-checkbox"
                      />
                    </td>
                    <td rowSpan="2" className="forging-td forging-td--lot">
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
                        placeholder="Float"
                        value={row.forgingTemperature[0] || ''}
                        onChange={e => updateData(idx, 'forgingTemperature', e.target.value, 0)}
                        disabled={row.noProduction || !row.lotNo}
                      />
                    </td>
                    <td className="forging-td forging-td--stabilisation-input">
                      <select
                        className="form-control forging-select"
                        value={row.forgingStabilisation[0] || ''}
                        onChange={e => updateData(idx, 'forgingStabilisation', e.target.value, 0)}
                        disabled={row.noProduction || !row.lotNo}
                      >
                        <option value="">Select</option>
                        <option value="OK">OK</option>
                        <option value="NOT OK">NOT OK</option>
                      </select>
                    </td>
                    <td className="forging-td forging-td--improper-input">
                      <select
                        className="form-control forging-select"
                        value={row.improperForging[0] || ''}
                        onChange={e => updateData(idx, 'improperForging', e.target.value, 0)}
                        disabled={row.noProduction || !row.lotNo}
                      >
                        <option value="">Select</option>
                        <option value="OK">OK</option>
                        <option value="NOT OK">NOT OK</option>
                      </select>
                    </td>
                    <td className="forging-td forging-td--defect-input">
                      <select
                        className="form-control forging-select"
                        value={row.forgingDefect[0] || ''}
                        onChange={e => updateData(idx, 'forgingDefect', e.target.value, 0)}
                        disabled={row.noProduction || !row.lotNo}
                      >
                        <option value="">Select</option>
                        <option value="OK">OK</option>
                        <option value="NOT OK">NOT OK</option>
                      </select>
                    </td>
                    <td className="forging-td forging-td--embossing-input">
                      <select
                        className="form-control forging-select"
                        value={row.embossingDefect[0] || ''}
                        onChange={e => updateData(idx, 'embossingDefect', e.target.value, 0)}
                        disabled={row.noProduction || !row.lotNo}
                      >
                        <option value="">Select</option>
                        <option value="OK">OK</option>
                        <option value="NOT OK">NOT OK</option>
                      </select>
                    </td>
                  </tr>
                  {/* Row 2: Second sample */}
                  <tr key={`${row.hour}-r2`} className={`forging-row${row.noProduction ? ' no-production' : ''}`}>
                    <td className="forging-td forging-td--temp-input">
                      <input
                        type="number"
                        className="form-control forging-input"
                        placeholder="Float"
                        value={row.forgingTemperature[1] || ''}
                        onChange={e => updateData(idx, 'forgingTemperature', e.target.value, 1)}
                        disabled={row.noProduction || !row.lotNo}
                      />
                    </td>
                    <td className="forging-td forging-td--stabilisation-input">
                      <select
                        className="form-control forging-select"
                        value={row.forgingStabilisation[1] || ''}
                        onChange={e => updateData(idx, 'forgingStabilisation', e.target.value, 1)}
                        disabled={row.noProduction || !row.lotNo}
                      >
                        <option value="">Select</option>
                        <option value="OK">OK</option>
                        <option value="NOT OK">NOT OK</option>
                      </select>
                    </td>
                    <td className="forging-td forging-td--improper-input">
                      <select
                        className="form-control forging-select"
                        value={row.improperForging[1] || ''}
                        onChange={e => updateData(idx, 'improperForging', e.target.value, 1)}
                        disabled={row.noProduction || !row.lotNo}
                      >
                        <option value="">Select</option>
                        <option value="OK">OK</option>
                        <option value="NOT OK">NOT OK</option>
                      </select>
                    </td>
                    <td className="forging-td forging-td--defect-input">
                      <select
                        className="form-control forging-select"
                        value={row.forgingDefect[1] || ''}
                        onChange={e => updateData(idx, 'forgingDefect', e.target.value, 1)}
                        disabled={row.noProduction || !row.lotNo}
                      >
                        <option value="">Select</option>
                        <option value="OK">OK</option>
                        <option value="NOT OK">NOT OK</option>
                      </select>
                    </td>
                    <td className="forging-td forging-td--embossing-input">
                      <select
                        className="form-control forging-select"
                        value={row.embossingDefect[1] || ''}
                        onChange={e => updateData(idx, 'embossingDefect', e.target.value, 1)}
                        disabled={row.noProduction || !row.lotNo}
                      >
                        <option value="">Select</option>
                        <option value="OK">OK</option>
                        <option value="NOT OK">NOT OK</option>
                      </select>
                    </td>
                  </tr>
                  {/* Row 3: Rejected No. for Forging Defects - 5 separate inputs */}
                  <tr key={`${row.hour}-r3`} className={`forging-row${row.noProduction ? ' no-production' : ''}`}>
                    <td className="forging-td forging-td--rejected-label">
                      <span className="forging-rejected-label">Rejected No.</span>
                    </td>
                    <td className="forging-td forging-td--rejected-input">
                      <input type="number" value={row.forgingTemperatureRejected || ''} onChange={e => updateData(idx, 'forgingTemperatureRejected', e.target.value)} disabled={row.noProduction || !row.lotNo} />
                    </td>
                    <td className="forging-td forging-td--rejected-input">
                      <input type="number" value={row.forgingStabilisationRejected || ''} onChange={e => updateData(idx, 'forgingStabilisationRejected', e.target.value)} disabled={row.noProduction || !row.lotNo} />
                    </td>
                    <td className="forging-td forging-td--rejected-input">
                      <input type="number" value={row.improperForgingRejected || ''} onChange={e => updateData(idx, 'improperForgingRejected', e.target.value)} disabled={row.noProduction || !row.lotNo} />
                    </td>
                    <td className="forging-td forging-td--rejected-input">
                      <input type="number" value={row.forgingDefectRejected || ''} onChange={e => updateData(idx, 'forgingDefectRejected', e.target.value)} disabled={row.noProduction || !row.lotNo} />
                    </td>
                    <td className="forging-td forging-td--rejected-input">
                      <input type="number" value={row.embossingDefectRejected || ''} onChange={e => updateData(idx, 'embossingDefectRejected', e.target.value)} disabled={row.noProduction || !row.lotNo} />
                    </td>
                  </tr>
                  {/* Row 4: Remarks */}

                  <tr key={`${row.hour}-r4`} className={`forging-row${row.noProduction ? ' no-production' : ''}`}>
                    <td className="forging-td forging-td--remarks-label">
                      <span className="forging-remarks-label">Remarks</span>
                    </td>
                    <td colSpan="7" className="forging-td forging-td--remarks-input">
                      <input
                        type="text"
                        className="form-control forging-input"
                        value={row.remarks}
                        onChange={e => updateData(idx, 'remarks', e.target.value)}
                        disabled={row.noProduction || !row.lotNo}
                      />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
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
                        disabled={row.noProduction || !row.lotNo}
                      >
                        <option value="">Select Lot No.</option>
                        {availableLotNumbers.map(lot => (
                          <option key={lot} value={lot}>{lot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {[0, 1].map(sampleIdx => (
                    <div key={sampleIdx}>
                      <div className="forging-mobile-field">
                        <span className="forging-mobile-field__label">Forging Temp. (S{sampleIdx + 1})</span>
                        <div className="forging-mobile-field__value">
                          <input
                            type="number"
                            placeholder="Float"
                            value={row.forgingTemperature[sampleIdx] || ''}
                            onChange={e => updateData(idx, 'forgingTemperature', e.target.value, sampleIdx)}
                            disabled={row.noProduction || !row.lotNo}
                          />
                        </div>
                      </div>
                      <div className="forging-mobile-field">
                        <span className="forging-mobile-field__label">Forging Stabilisation (S{sampleIdx + 1})</span>
                        <div className="forging-mobile-field__value">
                          <select
                            value={row.forgingStabilisation[sampleIdx] || ''}
                            onChange={e => updateData(idx, 'forgingStabilisation', e.target.value, sampleIdx)}
                            disabled={row.noProduction || !row.lotNo}
                          >
                            <option value="">Select</option>
                            <option value="OK">OK</option>
                            <option value="NOT OK">NOT OK</option>
                          </select>
                        </div>
                      </div>
                      <div className="forging-mobile-field">
                        <span className="forging-mobile-field__label">Improper Forging (S{sampleIdx + 1})</span>
                        <div className="forging-mobile-field__value">
                          <select
                            value={row.improperForging[sampleIdx] || ''}
                            onChange={e => updateData(idx, 'improperForging', e.target.value, sampleIdx)}
                            disabled={row.noProduction || !row.lotNo}
                          >
                            <option value="">Select</option>
                            <option value="OK">OK</option>
                            <option value="NOT OK">NOT OK</option>
                          </select>
                        </div>
                      </div>
                      <div className="forging-mobile-field">
                        <span className="forging-mobile-field__label">Forging Defect (S{sampleIdx + 1})</span>
                        <div className="forging-mobile-field__value">
                          <select
                            value={row.forgingDefect[sampleIdx] || ''}
                            onChange={e => updateData(idx, 'forgingDefect', e.target.value, sampleIdx)}
                            disabled={row.noProduction || !row.lotNo}
                          >
                            <option value="">Select</option>
                            <option value="OK">OK</option>
                            <option value="NOT OK">NOT OK</option>
                          </select>
                        </div>
                      </div>
                      <div className="forging-mobile-field">
                        <span className="forging-mobile-field__label">Embossing Defect (S{sampleIdx + 1})</span>
                        <div className="forging-mobile-field__value">
                          <select
                            value={row.embossingDefect[sampleIdx] || ''}
                            onChange={e => updateData(idx, 'embossingDefect', e.target.value, sampleIdx)}
                            disabled={row.noProduction || !row.lotNo}
                          >
                            <option value="">Select</option>
                            <option value="OK">OK</option>
                            <option value="NOT OK">NOT OK</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="forging-mobile-field forging-mobile-field--rejected">
                    <span className="forging-mobile-field__label">Rejected No. for Forging Defects</span>
                    <div className="forging-mobile-field__value">
                      <input
                        type="number"
                        value={row.rejectedQty || ''}
                        onChange={e => updateData(idx, 'rejectedQty', e.target.value)}
                        disabled={row.noProduction || !row.lotNo}
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

