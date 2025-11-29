import React, { useState, useEffect } from 'react';
import IELandingPage from './pages/IELandingPage';
import InspectionInitiationPage from './pages/InspectionInitiationPage';
import MultiTabInspectionInitiationPage from './pages/MultiTabInspectionInitiationPage';
import RawMaterialDashboard from './pages/RawMaterialDashboard';
import ProcessDashboard from './pages/ProcessDashboard';
import FinalProductDashboard from './pages/FinalProductDashboard';
import CalibrationDocumentsPage from './pages/CalibrationDocumentsPage';
import VisualMaterialTestingPage from './pages/VisualMaterialTestingPage';
import SummaryReportsPage from './pages/SummaryReportsPage';
// Process Material SubModule Pages
import ProcessCalibrationDocumentsPage from './pages/ProcessCalibrationDocumentsPage';
import ProcessStaticPeriodicCheckPage from './pages/ProcessStaticPeriodicCheckPage';
import ProcessOilTankCounterPage from './pages/ProcessOilTankCounterPage';
import ProcessParametersGridPage from './pages/ProcessParametersGridPage';
import ProcessSummaryReportsPage from './pages/ProcessSummaryReportsPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedCall, setSelectedCall] = useState(null);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [userEmail] = useState('inspector@sarthi.com');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile overlay
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapse

  // Track which inspection type is currently active (to show only that option in nav)
  const [activeInspectionType, setActiveInspectionType] = useState(null); // 'raw-material', 'process', or 'final-product'

  // Shared state for submodule pages
  const [rmHeats, setRmHeats] = useState([{ heatNo: '', weight: '' }]);
  const [rmProductModel, setRmProductModel] = useState('MK-III');

  // Process Material shared state - lot numbers from main module
  const [processLotNumbers, setProcessLotNumbers] = useState(['LOT-001', 'LOT-002', 'LOT-003']);

  useEffect(() => {
    // Ensure page scrolls to top when switching pages
    try {
      window.scrollTo(0, 0);
      const mainEl = document.querySelector('.main-content');
      if (mainEl) mainEl.scrollTop = 0;
    } catch (e) {
      // ignore in non-browser environments
    }
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
    setActiveInspectionType(null); // Reset active inspection type when returning to landing
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
            {new Date('2025-11-14T17:00:00').toLocaleString()}
          </div>
          <div className="user-info">
            <div className="user-avatar">IE</div>
            <div>
              <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>Inspector Engineer</div>
              <div>{userEmail}</div>
            </div>
          </div>
          <button className="btn btn-sm btn-outline">Logout</button>
        </div>
      </header>

      <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Desktop collapse toggle button */}
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
              {/* Only show Raw Material if it's the active inspection type or no type selected yet */}
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
              {/* Only show Process Inspection if it's the active inspection type or no type selected yet */}
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
              {/* Only show Final Product if it's the active inspection type or no type selected yet */}
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

        {/* Mobile overlay when sidebar is open */}
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
            />
          )}
          {currentPage === 'initiation' && selectedCall && (
            <InspectionInitiationPage
              call={selectedCall}
              onProceed={handleProceedToInspection}
              onBack={handleBackToLanding}
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
            />
          )}
          {currentPage === 'final-product' && (
            <FinalProductDashboard onBack={handleBackToLanding} />
          )}

          {/* Sub Module Pages - Completely Separate Pages */}
          {currentPage === 'calibration-documents' && (
            <CalibrationDocumentsPage
              onBack={handleBackToRawMaterial}
              heats={rmHeats}
            />
          )}
          {currentPage === 'visual-material-testing' && (
            <VisualMaterialTestingPage
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
            <ProcessCalibrationDocumentsPage onBack={handleBackToProcess} />
          )}
          {currentPage === 'process-static-periodic-check' && (
            <ProcessStaticPeriodicCheckPage onBack={handleBackToProcess} />
          )}
          {currentPage === 'process-oil-tank-counter' && (
            <ProcessOilTankCounterPage onBack={handleBackToProcess} />
          )}
          {currentPage === 'process-parameters-grid' && (
            <ProcessParametersGridPage
              onBack={handleBackToProcess}
              lotNumbers={processLotNumbers}
            />
          )}
          {currentPage === 'process-summary-reports' && (
            <ProcessSummaryReportsPage onBack={handleBackToProcess} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;