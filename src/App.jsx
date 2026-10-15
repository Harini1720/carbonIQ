import React, { useState } from 'react';
import { CarbonProvider, useCarbon } from './context/CarbonContext';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import DashboardPage from './pages/DashboardPage';
import CalculatorPage from './pages/CalculatorPage';
import CampusTwinPage from './pages/CampusTwinPage';
import SimulatorPage from './pages/SimulatorPage';
import RecommendationsPage from './pages/RecommendationsPage';
import MethodologyPage from './pages/MethodologyPage';
import BuildingDetailModal from './components/campus/BuildingDetailModal';

function MainApp() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inspectedBuildingId, setInspectedBuildingId] = useState(null);

  const { allBuildings } = useCarbon();

  const handleSelectBuilding = (id) => {
    setInspectedBuildingId(id);
  };

  const inspectedBuilding = allBuildings.find(b => b.id === inspectedBuildingId);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Top Header */}
        <Header
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Dynamic Page Views */}
        <main>
          {activePage === 'dashboard' && (
            <DashboardPage
              onNavigate={setActivePage}
              onSelectBuilding={handleSelectBuilding}
            />
          )}

          {activePage === 'calculator' && (
            <CalculatorPage onNavigate={setActivePage} />
          )}

          {activePage === 'twin' && (
            <CampusTwinPage onNavigate={setActivePage} />
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
        </main>
      </div>

      {/* Global Building Inspection Modal (can be opened from Dashboard or anywhere) */}
      {inspectedBuilding && (
        <BuildingDetailModal
          building={inspectedBuilding}
          onClose={() => setInspectedBuildingId(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <CarbonProvider>
      <MainApp />
    </CarbonProvider>
  );
}
