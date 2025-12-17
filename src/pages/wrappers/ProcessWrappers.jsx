import { useNavigate } from 'react-router-dom';
import ProcessDashboard from '../ProcessDashboard';
import ProcessCalibrationDocumentsPage from '../ProcessCalibrationDocumentsPage';
import ProcessStaticPeriodicCheckPage from '../ProcessStaticPeriodicCheckPage';
import ProcessOilTankCounterPage from '../ProcessOilTankCounterPage';
import ProcessParametersGridPage from '../ProcessParametersGridPage';
import ProcessSummaryReportsPage from '../ProcessSummaryReportsPage';
import { useInspection } from '../../context/InspectionContext';
import { ROUTES, PROCESS_SUBMODULE_ROUTES } from '../../routes';

/**
 * Wrapper for ProcessDashboard
 */
export const ProcessDashboardWrapper = () => {
  const navigate = useNavigate();
  const { processSelectedLines, setLandingActiveTab } = useInspection();

  const handleBack = () => {
    setLandingActiveTab('pending');
    navigate(ROUTES.LANDING);
  };

  const handleNavigateToSubModule = (subModule) => {
    const route = PROCESS_SUBMODULE_ROUTES[subModule];
    if (route) {
      navigate(route);
    }
  };

  return (
    <ProcessDashboard
      onBack={handleBack}
      onNavigateToSubModule={handleNavigateToSubModule}
      selectedLines={processSelectedLines}
    />
  );
};

/**
 * Wrapper for ProcessCalibrationDocumentsPage
 */
export const ProcessCalibrationWrapper = () => {
  const navigate = useNavigate();
  const { processSelectedLines } = useInspection();

  const handleBack = () => navigate(ROUTES.PROCESS);
  const handleNavigateSubmodule = (subModule) => {
    const route = PROCESS_SUBMODULE_ROUTES[subModule];
    if (route) navigate(route);
  };

  return (
    <ProcessCalibrationDocumentsPage
      onBack={handleBack}
      selectedLines={processSelectedLines}
      onNavigateSubmodule={handleNavigateSubmodule}
    />
  );
};

/**
 * Wrapper for ProcessStaticPeriodicCheckPage
 */
export const ProcessStaticCheckWrapper = () => {
  const navigate = useNavigate();
  const { processSelectedLines } = useInspection();

  const handleBack = () => navigate(ROUTES.PROCESS);
  const handleNavigateSubmodule = (subModule) => {
    const route = PROCESS_SUBMODULE_ROUTES[subModule];
    if (route) navigate(route);
  };

  return (
    <ProcessStaticPeriodicCheckPage
      onBack={handleBack}
      selectedLines={processSelectedLines}
      onNavigateSubmodule={handleNavigateSubmodule}
    />
  );
};

/**
 * Wrapper for ProcessOilTankCounterPage
 */
export const ProcessOilTankWrapper = () => {
  const navigate = useNavigate();
  const { processSelectedLines } = useInspection();

  const handleBack = () => navigate(ROUTES.PROCESS);
  const handleNavigateSubmodule = (subModule) => {
    const route = PROCESS_SUBMODULE_ROUTES[subModule];
    if (route) navigate(route);
  };

  return (
    <ProcessOilTankCounterPage
      onBack={handleBack}
      selectedLines={processSelectedLines}
      onNavigateSubmodule={handleNavigateSubmodule}
    />
  );
};

/**
 * Wrapper for ProcessParametersGridPage
 */
export const ProcessParametersWrapper = () => {
  const navigate = useNavigate();
  const { processLotNumbers, processShift, processSelectedLines } = useInspection();

  const handleBack = () => navigate(ROUTES.PROCESS);
  const handleNavigateSubmodule = (subModule) => {
    const route = PROCESS_SUBMODULE_ROUTES[subModule];
    if (route) navigate(route);
  };

  return (
    <ProcessParametersGridPage
      onBack={handleBack}
      lotNumbers={processLotNumbers}
      shift={processShift}
      selectedLines={processSelectedLines}
      onNavigateSubmodule={handleNavigateSubmodule}
    />
  );
};

/**
 * Wrapper for ProcessSummaryReportsPage
 */
export const ProcessSummaryWrapper = () => {
  const navigate = useNavigate();
  const { processSelectedLines } = useInspection();

  const handleBack = () => navigate(ROUTES.PROCESS);
  const handleNavigateSubmodule = (subModule) => {
    const route = PROCESS_SUBMODULE_ROUTES[subModule];
    if (route) navigate(route);
  };

  return (
    <ProcessSummaryReportsPage
      onBack={handleBack}
      selectedLines={processSelectedLines}
      onNavigateSubmodule={handleNavigateSubmodule}
    />
  );
};

