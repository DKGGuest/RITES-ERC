import './FinalSubmoduleNav.css';

/**
 * Final Product Submodule Navigation
 * Allows toggling between submodules without going back to dashboard
 */

const FINAL_SUBMODULES = [
  { id: 'final-calibration-documents', label: 'Calibration', icon: '📋' },
  { id: 'final-visual-dimensional', label: 'Visual', icon: '👁️' },
  { id: 'final-chemical-analysis', label: 'Chemical', icon: '🧪' },
  { id: 'final-hardness-test', label: 'Hardness', icon: '💎' },
  { id: 'final-inclusion-rating', label: 'Inclusion', icon: '🔬' },
  { id: 'final-application-deflection', label: 'Dim & Defl', icon: '📏' },
  { id: 'final-weight-test', label: 'Weight', icon: '⚖️' },
  { id: 'final-toe-load-test', label: 'Toe Load', icon: '🦶' },
  { id: 'final-reports', label: 'Reports', icon: '📊' },
];

const FinalSubmoduleNav = ({ currentSubmodule, onNavigate }) => {
  return (
    <div className="submodule-nav">
      <span className="submodule-nav-label">Switch:</span>
      {FINAL_SUBMODULES.map(sub => (
        <button
          key={sub.id}
          className={`submodule-nav-btn ${currentSubmodule === sub.id ? 'active' : ''}`}
          onClick={() => onNavigate(sub.id)}
          title={sub.label}
        >
          <span className="submodule-nav-icon">{sub.icon}</span>
          <span>{sub.label}</span>
        </button>
      ))}
    </div>
  );
};

export default FinalSubmoduleNav;

