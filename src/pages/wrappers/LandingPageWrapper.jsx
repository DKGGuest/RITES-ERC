import { useNavigate } from 'react-router-dom';
import IELandingPage from '../IELandingPage';
import { useInspection } from '../../context/InspectionContext';
import { ROUTES } from '../../routes';

/**
 * Wrapper for IELandingPage - connects to router and context
 */
const LandingPageWrapper = () => {
  const navigate = useNavigate();
  const { 
    setSelectedCall, 
    setSelectedCalls, 
    landingActiveTab,
    setLandingActiveTab 
  } = useInspection();

  const handleStartInspection = (call) => {
    setSelectedCall(call);
    setSelectedCalls([call]);
    navigate(ROUTES.INITIATION);
  };

  const handleStartMultipleInspections = (calls) => {
    setSelectedCalls(calls);
    setSelectedCall(null);
    navigate(ROUTES.MULTI_INITIATION);
  };

  const handleSetCurrentPage = (page) => {
    if (page === 'ic-rawmaterial') {
      navigate(ROUTES.IC_RAW_MATERIAL);
    } else if (page === 'ic-processmaterial') {
      navigate(ROUTES.IC_PROCESS);
    }
  };

  return (
    <IELandingPage
      onStartInspection={handleStartInspection}
      onStartMultipleInspections={handleStartMultipleInspections}
      setSelectedCall={setSelectedCall}
      setCurrentPage={handleSetCurrentPage}
      initialTab={landingActiveTab}
      onTabChange={setLandingActiveTab}
    />
  );
};

export default LandingPageWrapper;

