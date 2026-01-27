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
                <th className="final-check-th final-check-th--box-gauge">Box Gauge</th>
                <th className="final-check-th final-check-th--flat-bearing">Flat Bearing Area</th>
                <th className="final-check-th final-check-th--falling-gauge">Falling Gauge</th>
                <th className="final-check-th final-check-th--surface-defect">Surface Defect</th>
                <th className="final-check-th final-check-th--embossing-defect">Embossing Defect</th>
                <th className="final-check-th final-check-th--marking">Marking</th>
                <th className="final-check-th final-check-th--tempering-hardness">Tempering Hardness</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows(data, showAll).map(({ row, idx }) => (
                <React.Fragment key={row.hour}>
                  {/* Row 1: First sample */}
                  <tr className="final-check-row">
                    <td rowSpan="4" className="final-check-td final-check-td--time">
                      <strong>{hourLabels[idx]}</strong>
                    </td>
                    <td rowSpan="4" className="final-check-td final-check-td--checkbox">
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
                        <option value="">Select Lot No.</option>
                        {availableLotNumbers.map(lot => (
                          <option key={lot} value={lot}>{lot}</option>
                        ))}
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--box-gauge-input">
                      <select
                        className="form-control final-check-select"
                        value={row.boxGauge[0] || ''}
                        onChange={e => updateData(idx, 'boxGauge', e.target.value, 0)}
                        disabled={row.noProduction}
                      >
                        <option value="">OK/ Not OK</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--flat-bearing-input">
                      <select
                        className="form-control final-check-select"
                        value={row.flatBearingArea[0] || ''}
                        onChange={e => updateData(idx, 'flatBearingArea', e.target.value, 0)}
                        disabled={row.noProduction}
                      >
                        <option value="">OK/ Not OK</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--falling-gauge-input">
                      <select
                        className="form-control final-check-select"
                        value={row.fallingGauge[0] || ''}
                        onChange={e => updateData(idx, 'fallingGauge', e.target.value, 0)}
                        disabled={row.noProduction}
                      >
                        <option value="">OK/ Not OK</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--surface-defect-input">
                      <select
                        className="form-control final-check-select"
                        value={row.surfaceDefect[0] || ''}
                        onChange={e => updateData(idx, 'surfaceDefect', e.target.value, 0)}
                        disabled={row.noProduction}
                      >
                        <option value="">OK/ Not OK</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--embossing-defect-input">
                      <select
                        className="form-control final-check-select"
                        value={row.embossingDefect[0] || ''}
                        onChange={e => updateData(idx, 'embossingDefect', e.target.value, 0)}
                        disabled={row.noProduction}
                      >
                        <option value="">OK/ Not OK</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--marking-input">
                      <select
                        className="form-control final-check-select"
                        value={row.marking[0] || ''}
                        onChange={e => updateData(idx, 'marking', e.target.value, 0)}
                        disabled={row.noProduction}
                      >
                        <option value="">OK/ Not OK</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--tempering-hardness-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        placeholder="Integer"
                        value={row.temperingHardness[0] || ''}
                        onChange={e => updateData(idx, 'temperingHardness', e.target.value, 0)}
                        disabled={row.noProduction}
                      />
                    </td>
                  </tr>
                  {/* Row 2: Second sample */}
                  <tr className="final-check-row">
                    <td className="final-check-td final-check-td--box-gauge-input">
                      <select
                        className="form-control final-check-select"
                        value={row.boxGauge[1] || ''}
                        onChange={e => updateData(idx, 'boxGauge', e.target.value, 1)}
                        disabled={row.noProduction}
                      >
                        <option value="">OK/ Not OK</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--flat-bearing-input">
                      <select
                        className="form-control final-check-select"
                        value={row.flatBearingArea[1] || ''}
                        onChange={e => updateData(idx, 'flatBearingArea', e.target.value, 1)}
                        disabled={row.noProduction}
                      >
                        <option value="">OK/ Not OK</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--falling-gauge-input">
                      <select
                        className="form-control final-check-select"
                        value={row.fallingGauge[1] || ''}
                        onChange={e => updateData(idx, 'fallingGauge', e.target.value, 1)}
                        disabled={row.noProduction}
                      >
                        <option value="">OK/ Not OK</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--surface-defect-input">
                      <select
                        className="form-control final-check-select"
                        value={row.surfaceDefect[1] || ''}
                        onChange={e => updateData(idx, 'surfaceDefect', e.target.value, 1)}
                        disabled={row.noProduction}
                      >
                        <option value="">OK/ Not OK</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--embossing-defect-input">
                      <select
                        className="form-control final-check-select"
                        value={row.embossingDefect[1] || ''}
                        onChange={e => updateData(idx, 'embossingDefect', e.target.value, 1)}
                        disabled={row.noProduction}
                      >
                        <option value="">OK/ Not OK</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--marking-input">
                      <select
                        className="form-control final-check-select"
                        value={row.marking[1] || ''}
                        onChange={e => updateData(idx, 'marking', e.target.value, 1)}
                        disabled={row.noProduction}
                      >
                        <option value="">OK/ Not OK</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </select>
                    </td>
                    <td className="final-check-td final-check-td--tempering-hardness-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        placeholder="Integer"
                        value={row.temperingHardness[1] || ''}
                        onChange={e => updateData(idx, 'temperingHardness', e.target.value, 1)}
                        disabled={row.noProduction}
                      />
                    </td>
                  </tr>
                  {/* Row 3: Rejected No. - 7 separate inputs */}
                  <tr className="final-check-row final-check-row--rejected">
                    <td className="final-check-td final-check-td--lot">
                      <span className="final-check-rejected-label">Rejected No.</span>
                    </td>
                    <td className="final-check-td final-check-td--rejected-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        placeholder="0"
                        value={row.boxGaugeRejected || ''}
                        onChange={e => updateData(idx, 'boxGaugeRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="final-check-td final-check-td--rejected-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        placeholder="0"
                        value={row.flatBearingAreaRejected || ''}
                        onChange={e => updateData(idx, 'flatBearingAreaRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="final-check-td final-check-td--rejected-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        placeholder="0"
                        value={row.fallingGaugeRejected || ''}
                        onChange={e => updateData(idx, 'fallingGaugeRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="final-check-td final-check-td--rejected-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        placeholder="0"
                        value={row.surfaceDefectRejected || ''}
                        onChange={e => updateData(idx, 'surfaceDefectRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="final-check-td final-check-td--rejected-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        placeholder="0"
                        value={row.embossingDefectRejected || ''}
                        onChange={e => updateData(idx, 'embossingDefectRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="final-check-td final-check-td--rejected-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        placeholder="0"
                        value={row.markingRejected || ''}
                        onChange={e => updateData(idx, 'markingRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </td>
                    <td className="final-check-td final-check-td--rejected-input">
                      <input
                        type="number"
                        className="form-control final-check-input"
                        placeholder="0"
                        value={row.temperingHardnessRejected || ''}
                        onChange={e => updateData(idx, 'temperingHardnessRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </td>
                  </tr>
                  {/* Row 4: Remarks */}
                  <tr className="final-check-row final-check-row--remarks">
                    <td className="final-check-td final-check-td--remarks-label">
                      <span className="final-check-remarks-label">Remarks</span>
                    </td>
                    <td colSpan="8" className="final-check-td final-check-td--remarks-input">
                      <input
                        type="text"
                        className="form-control final-check-input"
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
                        <option value="">Select Lot No.</option>
                        {availableLotNumbers.map(lot => (
                          <option key={lot} value={lot}>{lot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Box Gauge</span>
                    <div className="final-check-mobile-field__value final-check-mobile-field__value--multi">
                      {[0, 1].map(sampleIdx => (
                        <select
                          key={sampleIdx}
                          value={row.boxGauge[sampleIdx] || ''}
                          onChange={e => updateData(idx, 'boxGauge', e.target.value, sampleIdx)}
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
                    <span className="final-check-mobile-field__label">Flat Bearing Area</span>
                    <div className="final-check-mobile-field__value final-check-mobile-field__value--multi">
                      {[0, 1].map(sampleIdx => (
                        <select
                          key={sampleIdx}
                          value={row.flatBearingArea[sampleIdx] || ''}
                          onChange={e => updateData(idx, 'flatBearingArea', e.target.value, sampleIdx)}
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
                    <span className="final-check-mobile-field__label">Falling Gauge</span>
                    <div className="final-check-mobile-field__value final-check-mobile-field__value--multi">
                      {[0, 1].map(sampleIdx => (
                        <select
                          key={sampleIdx}
                          value={row.fallingGauge[sampleIdx] || ''}
                          onChange={e => updateData(idx, 'fallingGauge', e.target.value, sampleIdx)}
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
                    <span className="final-check-mobile-field__label">Surface Defect</span>
                    <div className="final-check-mobile-field__value final-check-mobile-field__value--multi">
                      {[0, 1].map(sampleIdx => (
                        <select
                          key={sampleIdx}
                          value={row.surfaceDefect[sampleIdx] || ''}
                          onChange={e => updateData(idx, 'surfaceDefect', e.target.value, sampleIdx)}
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
                    <span className="final-check-mobile-field__label">Embossing Defect</span>
                    <div className="final-check-mobile-field__value final-check-mobile-field__value--multi">
                      {[0, 1].map(sampleIdx => (
                        <select
                          key={sampleIdx}
                          value={row.embossingDefect[sampleIdx] || ''}
                          onChange={e => updateData(idx, 'embossingDefect', e.target.value, sampleIdx)}
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
                    <span className="final-check-mobile-field__label">Marking</span>
                    <div className="final-check-mobile-field__value final-check-mobile-field__value--multi">
                      {[0, 1].map(sampleIdx => (
                        <select
                          key={sampleIdx}
                          value={row.marking[sampleIdx] || ''}
                          onChange={e => updateData(idx, 'marking', e.target.value, sampleIdx)}
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
                    <span className="final-check-mobile-field__label">Tempering Hardness</span>
                    <div className="final-check-mobile-field__value final-check-mobile-field__value--multi">
                      {[0, 1].map(sampleIdx => (
                        <input
                          key={sampleIdx}
                          type="number"
                          placeholder={`S${sampleIdx + 1}`}
                          value={row.temperingHardness?.[sampleIdx] || ''}
                          onChange={e => updateData(idx, 'temperingHardness', e.target.value, sampleIdx)}
                          disabled={row.noProduction}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Rejected No. (Box Gauge)</span>
                    <div className="final-check-mobile-field__value">
                      <input
                        type="number"
                        placeholder="0"
                        value={row.boxGaugeRejected || ''}
                        onChange={e => updateData(idx, 'boxGaugeRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Rejected No. (Flat Bearing)</span>
                    <div className="final-check-mobile-field__value">
                      <input
                        type="number"
                        placeholder="0"
                        value={row.flatBearingAreaRejected || ''}
                        onChange={e => updateData(idx, 'flatBearingAreaRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Rejected No. (Falling Gauge)</span>
                    <div className="final-check-mobile-field__value">
                      <input
                        type="number"
                        placeholder="0"
                        value={row.fallingGaugeRejected || ''}
                        onChange={e => updateData(idx, 'fallingGaugeRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Rejected No. (Surface Defect)</span>
                    <div className="final-check-mobile-field__value">
                      <input
                        type="number"
                        placeholder="0"
                        value={row.surfaceDefectRejected || ''}
                        onChange={e => updateData(idx, 'surfaceDefectRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Rejected No. (Embossing Defect)</span>
                    <div className="final-check-mobile-field__value">
                      <input
                        type="number"
                        placeholder="0"
                        value={row.embossingDefectRejected || ''}
                        onChange={e => updateData(idx, 'embossingDefectRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Rejected No. (Marking)</span>
                    <div className="final-check-mobile-field__value">
                      <input
                        type="number"
                        placeholder="0"
                        value={row.markingRejected || ''}
                        onChange={e => updateData(idx, 'markingRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
                    </div>
                  </div>
                  <div className="final-check-mobile-field">
                    <span className="final-check-mobile-field__label">Rejected No. (Tempering Hardness)</span>
                    <div className="final-check-mobile-field__value">
                      <input
                        type="number"
                        placeholder="0"
                        value={row.temperingHardnessRejected || ''}
                        onChange={e => updateData(idx, 'temperingHardnessRejected', e.target.value)}
                        disabled={row.noProduction}
                      />
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

