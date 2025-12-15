import CalibrationSubModule from '../components/CalibrationSubModule';
import './CalibrationDocumentsPage.css';

const CalibrationDocumentsPage = ({ onBack, heats }) => {
  return (
    <div className="calibration-page-container">
      <div className="calibration-page-header">
        <h1 className="calibration-page-title">📄 Calibration & Documents</h1>
        <button className="calibration-back-btn" onClick={onBack}>
          ← Back to Sub Module Session
        </button>
      </div>

      <CalibrationSubModule
        preInspectionHeats={heats}
        onSave={(data) => {
          console.log('Calibration data saved:', data);
        }}
      />
    </div>
  );
};

export default CalibrationDocumentsPage;

