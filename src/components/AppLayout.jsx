import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, logoutUser } from '../services/authService';
import { useInspection } from '../context/InspectionContext';
import { ROUTES } from '../routes';

/**
 * AppLayout - Main layout component with header and sidebar
 * Wraps all authenticated pages
 */
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeInspectionType, clearInspectionData, setLandingActiveTab } = useInspection();

  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    const mainEl = document.querySelector('.main-content');
    if (mainEl) mainEl.scrollTop = 0;
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    clearInspectionData();
    navigate(ROUTES.LOGIN);
  };

  const handleNavigateToLanding = () => {
    setLandingActiveTab('pending');
    setIsSidebarOpen(false);
    navigate(ROUTES.LANDING);
  };

  const handleNavigateToRawMaterial = () => {
    if (activeInspectionType === 'raw-material') {
      setIsSidebarOpen(false);
      navigate(ROUTES.RAW_MATERIAL);
    }
  };

  const handleNavigateToProcess = () => {
    if (activeInspectionType === 'process') {
      setIsSidebarOpen(false);
      navigate(ROUTES.PROCESS);
    }
  };

  const handleNavigateToFinalProduct = () => {
    if (activeInspectionType === 'final-product') {
      setIsSidebarOpen(false);
      navigate(ROUTES.FINAL_PRODUCT);
    }
  };

  const isActivePage = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

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
                className={`sidebar-item ${isActivePage(ROUTES.LANDING) ? 'active' : ''}`}
                onClick={handleNavigateToLanding}
                title="Landing Page"
              >
                <span className="sidebar-icon">🏠</span>
                <span className="sidebar-text">Landing Page</span>
              </li>
              {(activeInspectionType === 'raw-material' || activeInspectionType === null) && (
                <li
                  className={`sidebar-item ${isActivePage(ROUTES.RAW_MATERIAL) ? 'active' : ''}`}
                  onClick={handleNavigateToRawMaterial}
                  style={{ opacity: activeInspectionType === 'raw-material' ? 1 : 0.5, cursor: activeInspectionType === 'raw-material' ? 'pointer' : 'not-allowed' }}
                  title="Raw Material Inspection"
                >
                  <span className="sidebar-icon">📦</span>
                  <span className="sidebar-text">Raw Material Inspection</span>
                </li>
              )}
              {(activeInspectionType === 'process' || activeInspectionType === null) && (
                <li
                  className={`sidebar-item ${isActivePage(ROUTES.PROCESS) ? 'active' : ''}`}
                  onClick={handleNavigateToProcess}
                  style={{ opacity: activeInspectionType === 'process' ? 1 : 0.5, cursor: activeInspectionType === 'process' ? 'pointer' : 'not-allowed' }}
                  title="Process Inspection"
                >
                  <span className="sidebar-icon">⚙️</span>
                  <span className="sidebar-text">Process Inspection</span>
                </li>
              )}
              {(activeInspectionType === 'final-product' || activeInspectionType === null) && (
                <li
                  className={`sidebar-item ${isActivePage(ROUTES.FINAL_PRODUCT) ? 'active' : ''}`}
                  onClick={handleNavigateToFinalProduct}
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
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
        )}

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

