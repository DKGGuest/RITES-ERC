import { useNavigate } from 'react-router-dom';
import InspectionInitiationPage from '../InspectionInitiationPage';
import { useInspection } from '../../context/InspectionContext';
import { ROUTES } from '../../routes';

/**
 * Wrapper for InspectionInitiationPage - connects to router and context
 */
const InitiationPageWrapper = () => {
  const navigate = useNavigate();
  const { 
    selectedCall,
    setActiveInspectionType,
    setProcessShift,
    setProcessSelectedLines,
    setLandingActiveTab
  } = useInspection();

  const handleProceed = (productType) => {
    if (productType === 'Raw Material') {
      setActiveInspectionType('raw-material');
      navigate(ROUTES.RAW_MATERIAL);
    } else if (productType === 'ERC Process' || productType.includes('Process')) {
      setActiveInspectionType('process');
      navigate(ROUTES.PROCESS);
    } else if (productType === 'Final Product' || productType.includes('Final')) {
      setActiveInspectionType('final-product');
      navigate(ROUTES.FINAL_PRODUCT);
    }
  };

  const handleBack = () => {
    setLandingActiveTab('pending');
    navigate(ROUTES.LANDING);
  };

  // If no call is selected, redirect to landing
  if (!selectedCall) {
    navigate(ROUTES.LANDING);
    return null;
  }

  return (
    <InspectionInitiationPage
      call={selectedCall}
      onProceed={handleProceed}
      onBack={handleBack}
      onShiftChange={setProcessShift}
      onSelectedLinesChange={setProcessSelectedLines}
    />
  );
};

export default InitiationPageWrapper;

