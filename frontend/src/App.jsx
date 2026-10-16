import React, { useState } from 'react';
import { CarbonProvider, useCarbon } from './context/CarbonContext';
import { AuthProvider } from './context/AuthContext';
import { OrganizationSelectionProvider } from './context/OrganizationSelectionContext';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import DashboardPage from './pages/DashboardPage';
import CalculatorPage from './pages/CalculatorPage';
import SimulatorPage from './pages/SimulatorPage';
import RecommendationsPage from './pages/RecommendationsPage';
import MethodologyPage from './pages/MethodologyPage';
import ImageImpactPage from './pages/ImageImpactPage';
import WorkspacePages from './pages/WorkspacePages';

function MainApp() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <div className="app-container">
      <Header
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        onNavigate={setActivePage}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Dynamic Page Views */}
        <main>
          {activePage === 'dashboard' && (
            <DashboardPage
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'calculator' && (
            <CalculatorPage onNavigate={setActivePage} />
          )}

          {activePage === 'simulator' && (
            <SimulatorPage onNavigate={setActivePage} />
          )}

          {activePage === 'recommendations' && (
            <RecommendationsPage onNavigate={setActivePage} />
          )}

          {activePage === 'methodology' && (
            <MethodologyPage />
          )}

          {['organizations', 'buildings', 'analytics', 'action-tracker', 'settings'].includes(activePage) && (
            <WorkspacePages page={activePage} onNavigate={setActivePage} />
          )}

          {activePage === 'image-impact' && (
            <ImageImpactPage />
          )}
        </main>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <CarbonProvider>
      <AuthProvider>
        <OrganizationSelectionProvider>
          <MainApp />
        </OrganizationSelectionProvider>
      </AuthProvider>
    </CarbonProvider>
  );
}
