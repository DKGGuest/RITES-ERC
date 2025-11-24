import React, { useState } from 'react';
import IELandingPage from './pages/IELandingPage';
import InspectionInitiationPage from './pages/InspectionInitiationPage';
import MultiTabInspectionInitiationPage from './pages/MultiTabInspectionInitiationPage';
import RawMaterialDashboard from './pages/RawMaterialDashboard';
import ProcessDashboard from './pages/ProcessDashboard';
import FinalProductDashboard from './pages/FinalProductDashboard';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedCall, setSelectedCall] = useState(null);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [userEmail] = useState('inspector@sarthi.com');

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
    } else if (productType === 'ERC Process' || productType.includes('Process')) {
      setCurrentPage('process');
    } else if (productType === 'Final Product' || productType.includes('Final')) {
      setCurrentPage('final-product');
    }
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
    setSelectedCall(null);
    setSelectedCalls([]);
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

      <div className="app-container">
        <aside className="sidebar">
          <nav>
            <ul className="sidebar-nav">
              <li 
                className={`sidebar-item ${currentPage === 'landing' ? 'active' : ''}`}
                onClick={handleBackToLanding}
              >
                🏠 Landing Page
              </li>
              <li 
                className={`sidebar-item ${currentPage === 'raw-material' ? 'active' : ''}`}
                onClick={() => selectedCall && setCurrentPage('raw-material')}
                style={{ opacity: selectedCall ? 1 : 0.5, cursor: selectedCall ? 'pointer' : 'not-allowed' }}
              >
                📦 Raw Material Inspection
              </li>
              <li 
                className={`sidebar-item ${currentPage === 'process' ? 'active' : ''}`}
                onClick={() => selectedCall && setCurrentPage('process')}
                style={{ opacity: selectedCall ? 1 : 0.5, cursor: selectedCall ? 'pointer' : 'not-allowed' }}
              >
                ⚙️ Process Inspection
              </li>
              <li 
                className={`sidebar-item ${currentPage === 'final-product' ? 'active' : ''}`}
                onClick={() => selectedCall && setCurrentPage('final-product')}
                style={{ opacity: selectedCall ? 1 : 0.5, cursor: selectedCall ? 'pointer' : 'not-allowed' }}
              >
                ✅ Final Product Inspection
              </li>
            </ul>
          </nav>
        </aside>

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
            <RawMaterialDashboard onBack={handleBackToLanding} />
          )}
          {currentPage === 'process' && (
            <ProcessDashboard onBack={handleBackToLanding} />
          )}
          {currentPage === 'final-product' && (
            <FinalProductDashboard onBack={handleBackToLanding} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;