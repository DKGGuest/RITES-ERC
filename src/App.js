import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import IELandingPage from './pages/IELandingPage';
import InspectionInitiationPage from './pages/InspectionInitiationPage';
import MultiTabInspectionInitiationPage from './pages/MultiTabInspectionInitiationPage';
import RawMaterialDashboard from './pages/RawMaterialDashboard';
import ProcessDashboard from './pages/ProcessDashboard';
import FinalProductDashboard from './pages/FinalProductDashboard';
import CalibrationDocumentsPage from './pages/CalibrationDocumentsPage';
import VisualInspectionPage from './pages/VisualInspectionPage';
import RawMaterialDimensionalPage from './pages/RawMaterialDimensionalPage';
import SummaryReportsPage from './pages/SummaryReportsPage';
// Process Material SubModule Pages
import ProcessCalibrationDocumentsPage from './pages/ProcessCalibrationDocumentsPage';
import ProcessStaticPeriodicCheckPage from './pages/ProcessStaticPeriodicCheckPage';
import ProcessOilTankCounterPage from './pages/ProcessOilTankCounterPage';
import ProcessParametersGridPage from './pages/ProcessParametersGridPage';
import ProcessSummaryReportsPage from './pages/ProcessSummaryReportsPage';
// Final Product SubModule Pages
import FinalCalibrationDocumentsPage from './pages/FinalCalibrationDocumentsPage';
import FinalVisualDimensionalPage from './pages/FinalVisualDimensionalPage';
import FinalChemicalAnalysisPage from './pages/FinalChemicalAnalysisPage';
import FinalHardnessTestPage from './pages/FinalHardnessTestPage';
import FinalInclusionRatingPage from './pages/FinalInclusionRatingPage';
import FinalApplicationDeflectionPage from './pages/FinalApplicationDeflectionPage';
import FinalToeLoadTestPage from './pages/FinalToeLoadTestPage';
import FinalWeightTestPage from './pages/FinalWeightTestPage';
import FinalReportsPage from './pages/FinalReportsPage';
import RawMaterialCertificate from './IC/erc/rawmaterial';
import ProcessMaterialCertificate from './IC/erc/ProcessMaterial';
import { isAuthenticated, getStoredUser, logoutUser } from './services/authService';

const App = () => {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedCall, setSelectedCall] = useState(null);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile overlay
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapse
  const [activeInspectionType, setActiveInspectionType] = useState(null); // 'raw-material', 'process', or 'final-product'
	  const [landingActiveTab, setLandingActiveTab] = useState('pending'); // Which tab is active on landing page

  // Check authentication on mount
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getStoredUser();
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  }, []);

  // Handle successful login
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('landing');
    setSelectedCall(null);
    setSelectedCalls([]);
    setActiveInspectionType(null);
  };

  // Shared state for submodule pages
  const [rmHeats, setRmHeats] = useState([{ heatNo: '', weight: '' }]);
  const [rmProductModel, setRmProductModel] = useState('MK-III');


	  // Shift selected in Inspection Initiation (Section B) for Process Parameters
	  const [processShift, setProcessShift] = useState('A');

  // Lines selected in Initiation (Section D) for Process modules
  const [processSelectedLines, setProcessSelectedLines] = useState(['Line-1']);

  // Process Material shared state - lot numbers from main module
  // eslint-disable-next-line no-unused-vars
  const [processLotNumbers, setProcessLotNumbers] = useState(['LOT-001', 'LOT-002', 'LOT-003']);

  useEffect(() => {
    // Scroll to top on page change
    window.scrollTo(0, 0);
    const mainEl = document.querySelector('.main-content');
    if (mainEl) mainEl.scrollTop = 0;
  }, [currentPage]);

  const handleStartInspection = (call) => {
    setSelectedCall(call);
    setSelectedCalls([call]);
    setCurrentPage('initiation');
  };

  const handleStartMultipleInspections = (calls) => {
    setSelectedCalls(calls);
    setSelectedCall(null);
    setCurrentPage('multi-initiation');
  };

  const handleProceedToInspection = (productType) => {
    if (productType === 'Raw Material') {
      setCurrentPage('raw-material');
      setActiveInspectionType('raw-material');
    } else if (productType === 'ERC Process' || productType.includes('Process')) {
      setCurrentPage('process');
      setActiveInspectionType('process');
    } else if (productType === 'Final Product' || productType.includes('Final')) {
      setCurrentPage('final-product');
      setActiveInspectionType('final-product');
    }
  };

	  const handleBackToLanding = () => {
	    setCurrentPage('landing');
	    setSelectedCall(null);
	    setSelectedCalls([]);
	    setActiveInspectionType(null);
	    setLandingActiveTab('pending');
	  };

	  const handleBackToIssuanceIC = () => {
	    setCurrentPage('landing');
	    setSelectedCall(null);
	    setSelectedCalls([]);
	    setActiveInspectionType(null);
	    setLandingActiveTab('certificates');
	  };

  // Navigation to submodule pages
  const handleNavigateToSubModule = (subModule) => {
    setCurrentPage(subModule);
  };

  const handleBackToRawMaterial = () => {
    setCurrentPage('raw-material');
  };

  const handleBackToProcess = () => {
    setCurrentPage('process');
  };

  const handleBackToFinalProduct = () => {
    setCurrentPage('final-product');
  };

  // Show login page if not authenticated
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">SARTHI</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Inspection Engineer Dashboard
          </div>
        </div>
        <div className="header-right">
          <button
            className="btn btn-sm btn-outline hamburger-btn"
            onClick={() => setIsSidebarOpen(open => !open)}
            aria-label="Toggle menu"
            style={{ marginRight: '8px' }}
          >
            ☰
          </button>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {new Date().toLocaleString()}
          </div>
          <div className="user-info">
            <div className="user-avatar">{currentUser?.userName?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div>
              <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
                {currentUser?.userName || 'User'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {currentUser?.roleName || 'Inspector'}
              </div>
            </div>
          </div>
          <button className="btn btn-sm btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}> 
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}> 
          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? '»' : '«'}
          </button>
          <nav>
            <ul className="sidebar-nav">
              <li
                className={`sidebar-item ${currentPage === 'landing' ? 'active' : ''}`}
                onClick={() => { handleBackToLanding(); setIsSidebarOpen(false); }}
                title="Landing Page"
              >
                <span className="sidebar-icon">🏠</span>
                <span className="sidebar-text">Landing Page</span>
              </li>
              {(activeInspectionType === 'raw-material' || activeInspectionType === null) && (
                <li
                  className={`sidebar-item ${currentPage === 'raw-material' ? 'active' : ''}`}
                  onClick={() => { if (activeInspectionType === 'raw-material') { setCurrentPage('raw-material'); setIsSidebarOpen(false); } }}
                  style={{ opacity: activeInspectionType === 'raw-material' ? 1 : 0.5, cursor: activeInspectionType === 'raw-material' ? 'pointer' : 'not-allowed' }}
                  title="Raw Material Inspection"
                >
                  <span className="sidebar-icon">📦</span>
                  <span className="sidebar-text">Raw Material Inspection</span>
                </li>
              )}
              {(activeInspectionType === 'process' || activeInspectionType === null) && (
                <li
                  className={`sidebar-item ${currentPage === 'process' ? 'active' : ''}`}
                  onClick={() => { if (activeInspectionType === 'process') { setCurrentPage('process'); setIsSidebarOpen(false); } }}
                  style={{ opacity: activeInspectionType === 'process' ? 1 : 0.5, cursor: activeInspectionType === 'process' ? 'pointer' : 'not-allowed' }}
                  title="Process Inspection"
                >
                  <span className="sidebar-icon">⚙️</span>
                  <span className="sidebar-text">Process Inspection</span>
                </li>
              )}
              {(activeInspectionType === 'final-product' || activeInspectionType === null) && (
                <li
                  className={`sidebar-item ${currentPage === 'final-product' ? 'active' : ''}`}
                  onClick={() => { if (activeInspectionType === 'final-product') { setCurrentPage('final-product'); setIsSidebarOpen(false); } }}
                  style={{ opacity: activeInspectionType === 'final-product' ? 1 : 0.5, cursor: activeInspectionType === 'final-product' ? 'pointer' : 'not-allowed' }}
                  title="Final Product Inspection"
                >
                  <span className="sidebar-icon">✅</span>
                  <span className="sidebar-text">Final Product Inspection</span>
                </li>
              )}
            </ul>
          </nav>
        </aside>

        {isSidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        <main className="main-content">
	          {currentPage === 'landing' && (
	            <IELandingPage
	              onStartInspection={handleStartInspection}
	              onStartMultipleInspections={handleStartMultipleInspections}
	              setSelectedCall={setSelectedCall}
	              setCurrentPage={setCurrentPage}
	              initialTab={landingActiveTab}
	            />
	          )}
          {currentPage === 'initiation' && selectedCall && (
            <InspectionInitiationPage
              call={selectedCall}
              onProceed={handleProceedToInspection}
              onBack={handleBackToLanding}
              onShiftChange={setProcessShift}
              onSelectedLinesChange={setProcessSelectedLines}
            />
          )}
          {currentPage === 'multi-initiation' && selectedCalls.length > 0 && (
            <MultiTabInspectionInitiationPage
              calls={selectedCalls}
              onProceed={handleProceedToInspection}
              onBack={handleBackToLanding}
            />
          )}
          {currentPage === 'raw-material' && (
            <RawMaterialDashboard
              onBack={handleBackToLanding}
              onNavigateToSubModule={handleNavigateToSubModule}
              onHeatsChange={setRmHeats}
              onProductModelChange={setRmProductModel}
            />
          )}
          {currentPage === 'process' && (
            <ProcessDashboard
              onBack={handleBackToLanding}
              onNavigateToSubModule={handleNavigateToSubModule}
              selectedLines={processSelectedLines}
            />
          )}
          {currentPage === 'final-product' && (
            <FinalProductDashboard
              onBack={handleBackToLanding}
              onNavigateToSubModule={handleNavigateToSubModule}
            />
          )}

          {/* Sub Module Pages - Completely Separate Pages */}
          {currentPage === 'calibration-documents' && (
            <CalibrationDocumentsPage
              onBack={handleBackToRawMaterial}
              heats={rmHeats}
            />
          )}
          {currentPage === 'visual-inspection' && (
            <VisualInspectionPage
              onBack={handleBackToRawMaterial}
              heats={rmHeats}
            />
          )}
          {currentPage === 'dimensional-check' && (
            <RawMaterialDimensionalPage
              onBack={handleBackToRawMaterial}
              heats={rmHeats}
              productModel={rmProductModel}
            />
          )}
          {currentPage === 'summary-reports' && (
            <SummaryReportsPage
              onBack={handleBackToRawMaterial}
            />
          )}

          {/* Process Material Sub Module Pages */}
          {currentPage === 'process-calibration-documents' && (
            <ProcessCalibrationDocumentsPage onBack={handleBackToProcess} selectedLines={processSelectedLines} />
          )}
          {currentPage === 'process-static-periodic-check' && (
            <ProcessStaticPeriodicCheckPage onBack={handleBackToProcess} selectedLines={processSelectedLines} />
          )}
          {currentPage === 'process-oil-tank-counter' && (
            <ProcessOilTankCounterPage onBack={handleBackToProcess} selectedLines={processSelectedLines} />
          )}
          {currentPage === 'process-parameters-grid' && (
            <ProcessParametersGridPage
              onBack={handleBackToProcess}
              lotNumbers={processLotNumbers}
              shift={processShift}
              selectedLines={processSelectedLines}
            />
          )}
          {currentPage === 'process-summary-reports' && (
            <ProcessSummaryReportsPage onBack={handleBackToProcess} selectedLines={processSelectedLines} />
          )}

          {/* Final Product Sub Module Pages */}
          {currentPage === 'final-calibration-documents' && (
            <FinalCalibrationDocumentsPage onBack={handleBackToFinalProduct} onNavigateSubmodule={setCurrentPage} />
          )}
          {currentPage === 'final-visual-dimensional' && (
            <FinalVisualDimensionalPage onBack={handleBackToFinalProduct} onNavigateSubmodule={setCurrentPage} />
          )}
          {currentPage === 'final-chemical-analysis' && (
            <FinalChemicalAnalysisPage onBack={handleBackToFinalProduct} onNavigateSubmodule={setCurrentPage} />
          )}
          {currentPage === 'final-hardness-test' && (
            <FinalHardnessTestPage onBack={handleBackToFinalProduct} onNavigateSubmodule={setCurrentPage} />
          )}
          {currentPage === 'final-inclusion-rating' && (
            <FinalInclusionRatingPage onBack={handleBackToFinalProduct} onNavigateSubmodule={setCurrentPage} />
          )}
          {currentPage === 'final-application-deflection' && (
            <FinalApplicationDeflectionPage onBack={handleBackToFinalProduct} onNavigateSubmodule={setCurrentPage} />
          )}
          {currentPage === 'final-toe-load-test' && (
            <FinalToeLoadTestPage onBack={handleBackToFinalProduct} onNavigateSubmodule={setCurrentPage} />
          )}
          {currentPage === 'final-weight-test' && (
            <FinalWeightTestPage onBack={handleBackToFinalProduct} onNavigateSubmodule={setCurrentPage} />
          )}
          {currentPage === 'final-reports' && (
            <FinalReportsPage onBack={handleBackToFinalProduct} onNavigateSubmodule={setCurrentPage} />
          )}
	          {currentPage === 'ic-rawmaterial' && selectedCall && (
	            <RawMaterialCertificate call={selectedCall} onBack={handleBackToIssuanceIC} />
	          )}
	          {currentPage === 'ic-processmaterial' && selectedCall && (
	            <ProcessMaterialCertificate call={selectedCall} onBack={handleBackToIssuanceIC} />
	          )}
        </main>
      </div>
    </div>
  );
};

export default App;