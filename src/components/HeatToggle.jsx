import './HeatToggle.css';

/**
 * Heat Toggle Component - Allows switching between heats in Raw Material submodules
 * Similar implementation to Visual Defects Checklist heat selector
 */
const HeatToggle = ({ heats = [], activeHeatIndex = 0, onHeatChange }) => {
  // Filter out empty heats (heats with no heatNo)
  const validHeats = heats.filter(heat => heat && (heat.heatNo || heat.heat_no));

  // If no valid heats, show a message instead of returning null
  if (!validHeats || validHeats.length === 0) {
    return (
      <div className="heat-toggle-container" style={{ background: '#fff3cd', borderColor: '#ffc107' }}>
        <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
          ⚠️ No heats available. Please ensure heat data is entered in the Raw Material Dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="heat-toggle-container">
      {validHeats.map((heat, idx) => (
        <button
          key={idx}
          type="button"
          className={`heat-toggle-btn ${idx === activeHeatIndex ? 'active' : ''}`}
          onClick={() => onHeatChange(idx)}
        >
          {`Heat ${heat.heatNo || heat.heat_no || `H${String(idx + 1).padStart(3, '0')}`}`}
        </button>
      ))}
    </div>
  );
};

export default HeatToggle;

