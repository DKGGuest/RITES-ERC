import './HeatToggle.css';

/**
 * Heat Toggle Component - Allows switching between heats in Raw Material submodules
 * Similar implementation to Visual Defects Checklist heat selector
 */
const HeatToggle = ({ heats = [], activeHeatIndex = 0, onHeatChange }) => {
  if (!heats || heats.length === 0) {
    return null;
  }

  return (
    <div className="heat-toggle-container">
      {heats.map((heat, idx) => (
        <button
          key={idx}
          type="button"
          className={`heat-toggle-btn ${idx === activeHeatIndex ? 'active' : ''}`}
          onClick={() => onHeatChange(idx)}
        >
          {`Heat ${heat.heatNo || `H${String(idx + 1).padStart(3, '0')}`}`}
        </button>
      ))}
    </div>
  );
};

export default HeatToggle;

