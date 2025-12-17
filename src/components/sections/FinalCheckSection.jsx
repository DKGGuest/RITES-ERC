import React, { useState } from 'react';
import './FinalCheckSection.css';

const FinalCheckSection = ({
  data,
  onDataChange,
  availableLotNumbers,
  hourLabels,
  visibleRows,
  showAll,
  onToggleShowAll
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

  return (
    <div className="final-check-section">
      <div className="final-check-section__header">
        <div>
          <h3 className="final-check-section__title">Final Check Section</h3>
          <p className="final-check-section__subtitle">Enter hourly final check data</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary final-check-section__toggle"
          onClick={onToggleShowAll}
          title={showAll ? 'Show current hour only' : 'Show all 8 hours'}
        >
          {showAll ? '\u2212' : '+'}
        </button>
      </div>

      {expanded && (
        <div className="final-check-table-wrapper">
          {/* Desktop Table Layout */}
          <table className="final-check-table">
            <thead>
              <tr>
                <th className="final-check-th final-check-th--time">Time Range</th>
                <th className="final-check-th final-check-th--checkbox">No Production</th>
                <th className="final-check-th final-check-th--lot">Lot No.</th>
                <th className="final-check-th final-check-th--visual">Visual Check</th>
                <th className="final-check-th final-check-th--dimension">Dimension Check</th>
                <th className="final-check-th final-check-th--hardness">Hardness Check</th>
                <th className="final-check-th final-check-th--remarks">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows(data, showAll).map(({ row, idx }) => (
                <React.Fragment key={row.hour}>
                  {/* Row 1: First set of checks */}
                  <tr className="final-check-row">
                    <td rowSpan="3" className="final-check-td final-check-td--time">
                      <strong>{hourLabels[idx]}</strong>
                    </td>
                    <td rowSpan="3" className="final-check-td final-check-td--checkbox">
                      <input
                        type="checkbox"
                        checked={row.noProduction}
                        onChange={e => updateData(idx, 'noProduction', e.target.checked)}
                        className="final-check-checkbox"
                      />
                    </td>
                    <td rowSpan="2" className="final-check-td final-check-td--lot">
                      <select
                        className="form-control final-check-select"
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
                    <td className="final-check-td final-check-td--visual-input">
                      <select
                        className="form-control final-check-select"
                        value={row.visualCheck[0]}
                        onChange={e => updateData(idx, 'visualCheck', e.target.value, 0)}
                        disabled={row.noProduction}
                      >
                        {/* <option value="">OK/ Not OK</option> */}
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--dimension-input">
                      <select
                        className="form-control final-check-select"
                        value={row.dimensionCheck[0]}
                        onChange={e => updateData(idx, 'dimensionCheck', e.target.value, 0)}
                        disabled={row.noProduction}
                      >
                        {/* <option value="">OK/ Not OK</option> */}
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--hardness-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        value={row.hardnessCheck?.[0] || ''}
                        onChange={e => updateData(idx, 'hardnessCheck', e.target.value, 0)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td rowSpan="3" className="final-check-td final-check-td--remarks">
                      <input
                        type="text"
                        className="form-control final-check-input"
                        value={row.remarks}
                        onChange={e => updateData(idx, 'remarks', e.target.value)}
                      />
                    </td>
                  </tr>
                  {/* Row 2: Second set of checks */}
                  <tr className="final-check-row">
                    <td className="final-check-td final-check-td--visual-input">
                      <select
                        className="form-control final-check-select"
                        value={row.visualCheck[1]}
                        onChange={e => updateData(idx, 'visualCheck', e.target.value, 1)}
                        disabled={row.noProduction}
                      >
                        {/* <option value="">OK/ Not OK</option> */}
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--dimension-input">
                      <select
                        className="form-control final-check-select"
                        value={row.dimensionCheck[1]}
                        onChange={e => updateData(idx, 'dimensionCheck', e.target.value, 1)}
                        disabled={row.noProduction}
                      >
                        {/* <option value="">OK/ Not OK</option> */}
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--hardness-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        value={row.hardnessCheck?.[1] || ''}
                        onChange={e => updateData(idx, 'hardnessCheck', e.target.value, 1)}
                        disabled={row.noProduction}
                      />
                    </td>
                  </tr>
                  {/* Row 3: Rejected No. */}
                  <tr className="final-check-row final-check-row--rejected">
                    <td className="final-check-td final-check-td--rejected-label">
                      <span className="final-check-rejected-label">Rejected No.</span>
                    </td>
                    <td className="final-check-td final-check-td--rejected-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        value={row.rejectedNo?.[0] || ''}
                        onChange={e => updateData(idx, 'rejectedNo', e.target.value, 0)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="final-check-td final-check-td--rejected-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        value={row.rejectedNo?.[1] || ''}
                        onChange={e => updateData(idx, 'rejectedNo', e.target.value, 1)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="final-check-td final-check-td--rejected-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        value={row.rejectedNo?.[2] || ''}
                        onChange={e => updateData(idx, 'rejectedNo', e.target.value, 2)}
                        disabled={row.noProduction}
                      />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="final-check-mobile-cards">
            {visibleRows(data, showAll).map(({ row, idx }) => (
              <div key={row.hour} className="final-check-mobile-card">
                <div className="final-check-mobile-card__header">
                  <span className="final-check-mobile-card__time">{hourLabels[idx]}</span>
                  <label className="final-check-mobile-checkbox-label">
                    <input
                      type="checkbox"
                      checked={row.noProduction}
                      onChange={e => updateData(idx, 'noProduction', e.target.checked)}
                      className="final-check-checkbox"
                    />
                    <span>No Prod</span>
                  </label>
                </div>
                <div className="final-check-mobile-card__body">
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Lot No.</span>
                    <div className="final-check-mobile-field__value">
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
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Visual Check</span>
                    <div className="final-check-mobile-field__value final-check-mobile-field__value--multi">
                      {[0, 1].map(sampleIdx => (
                        <select
                          key={sampleIdx}
                          value={row.visualCheck[sampleIdx]}
                          onChange={e => updateData(idx, 'visualCheck', e.target.value, sampleIdx)}
                          disabled={row.noProduction}
                        >
                          <option value="">S{sampleIdx + 1}</option>
                          <option value="OK">OK</option>
                          <option value="Not OK">Not OK</option>
                        </select>
                      ))}
                    </div>
                  </div>
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Dimension Check</span>
                    <div className="final-check-mobile-field__value final-check-mobile-field__value--multi">
                      {[0, 1].map(sampleIdx => (
                        <select
                          key={sampleIdx}
                          value={row.dimensionCheck[sampleIdx]}
                          onChange={e => updateData(idx, 'dimensionCheck', e.target.value, sampleIdx)}
                          disabled={row.noProduction}
                        >
                          <option value="">S{sampleIdx + 1}</option>
                          <option value="OK">OK</option>
                          <option value="Not OK">Not OK</option>
                        </select>
                      ))}
                    </div>
                  </div>
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Hardness Check</span>
                    <div className="final-check-mobile-field__value final-check-mobile-field__value--multi">
                      {[0, 1].map(sampleIdx => (
                        <input
                          key={sampleIdx}
                          type="number"
                          placeholder={`S${sampleIdx + 1}`}
                          value={row.hardnessCheck?.[sampleIdx] || ''}
                          onChange={e => updateData(idx, 'hardnessCheck', e.target.value, sampleIdx)}
                          disabled={row.noProduction}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Rejected No.</span>
                    <div className="final-check-mobile-field__value final-check-mobile-field__value--multi">
                      {[0, 1, 2].map(sampleIdx => (
                        <input
                          key={sampleIdx}
                          type="number"
                          placeholder={`R${sampleIdx + 1}`}
                          value={row.rejectedNo?.[sampleIdx] || ''}
                          onChange={e => updateData(idx, 'rejectedNo', e.target.value, sampleIdx)}
                          disabled={row.noProduction}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Remarks</span>
                    <div className="final-check-mobile-field__value">
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

export default FinalCheckSection;

