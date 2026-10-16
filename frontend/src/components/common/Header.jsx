import React, { useEffect, useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { useAuth } from '../../context/AuthContext';
import {
  Download,
  Menu,
  X,
  FileText,
  Leaf,
  Building2,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Header({ onMobileMenuToggle, isMobileMenuOpen, onNavigate }) {
  const { user, status: authStatus, signOut } = useAuth();
  const {
    reportingPeriod,
    inputs,
    currentGridFactor,
    currentTransportMode,
    electricityEmissions,
    transportEmissions,
    wasteEmissions,
    totalFootprint,
    scenarioResults,
    hasCompleteFootprint,
  } = useCarbon();

  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [openMenu, setOpenMenu] = useState('');
  const [profileError, setProfileError] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installMessage, setInstallMessage] = useState('');

  useEffect(() => {
    const handleInstallAvailable = event => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setInstallMessage('CarbonVision is installed on this device.');
    };
    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallAvailable);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallMessage(choice.outcome === 'accepted' ? 'CarbonVision is being installed.' : 'Installation was dismissed.');
      setInstallPrompt(null);
    } catch (error) {
      setInstallMessage(`Could not start installation: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    setProfileError('');
    try {
      await signOut();
      setOpenMenu('');
    } catch (error) {
      setProfileError(error.message);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const routes = [
      ['dashboard', ['dashboard']],
      ['organizations', ['organisations', 'organizations', 'organisation', 'organization']],
      ['buildings', ['buildings', 'building']],
      ['image-impact', ['sustainability studio', 'studio', 'image']],
      ['analytics', ['analytics']],
      ['recommendations', ['recommendations', 'recommendation']],
      ['action-tracker', ['action tracker', 'actions']],
      ['calculator', ['carbon data', 'calculations', 'calculator']],
      ['simulator', ['scenario simulator', 'simulator', 'scenario']],
      ['settings', ['settings', 'methodology']]
    ];
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchMessage('Type a workspace area to find it.');
      return;
    }
    const result = routes.find(([, labels]) => labels.some(label => label.includes(query)));
    if (!result) {
      setSearchMessage('No matching workspace area.');
      return;
    }
    onNavigate(result[0]);
    setSearchQuery('');
    setSearchMessage('');
  };

  const triggerExport = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#10b981', '#34d399', '#14b8a6']
    });
    window.print();
  };

  const exportCSV = () => {
    const rows = [
      ['CarbonIQ — Carbon Footprint Audit Report'],
      ['Generated Date', new Date().toISOString().split('T')[0]],
      ['Input Source', 'User-entered activity data'],
      ['Reporting Period', reportingPeriod],
      [],
      ['Emission Category', 'Scope', 'Activity Quantity', 'Unit', 'Emission Factor', 'Emissions (kg CO2e)', 'Emissions (tCO2e)'],
      ['Electricity (Net Grid)', 'Scope 2', inputs.electricityKwh, 'kWh/mo', `${currentGridFactor} kg/kWh`, electricityEmissions.netEmissions.toFixed(1), (electricityEmissions.netEmissions / 1000).toFixed(2)],
      ['Onsite Solar Offset', 'Scope 2', electricityEmissions.solarKwh.toFixed(0), 'kWh/mo', '0.0 kg/kWh (Avoided)', (-electricityEmissions.avoidedBySolar).toFixed(1), (-electricityEmissions.avoidedBySolar / 1000).toFixed(2)],
      ['Commuter Transportation', 'Scope 3', Math.round(transportEmissions.vehicleKmTraveled), 'vehicle-km/mo', `${currentTransportMode.factorPerKm} kg/km`, transportEmissions.emissionsKg.toFixed(1), (transportEmissions.emissionsKg / 1000).toFixed(2)],
      ['Solid Waste (Landfill)', 'Scope 3', inputs.wasteBreakdown.landfill || 0, 'kg/mo', '0.587 kg/kg', ((inputs.wasteBreakdown.landfill || 0) * 0.587).toFixed(1), (((inputs.wasteBreakdown.landfill || 0) * 0.587) / 1000).toFixed(2)],
      ['Solid Waste (Recycled)', 'Scope 3', inputs.wasteBreakdown.recycled || 0, 'kg/mo', '0.021 kg/kg', ((inputs.wasteBreakdown.recycled || 0) * 0.021).toFixed(1), (((inputs.wasteBreakdown.recycled || 0) * 0.021) / 1000).toFixed(2)],
      ['Solid Waste (Composted)', 'Scope 3', inputs.wasteBreakdown.composted || 0, 'kg/mo', '0.010 kg/kg', ((inputs.wasteBreakdown.composted || 0) * 0.010).toFixed(1), (((inputs.wasteBreakdown.composted || 0) * 0.010) / 1000).toFixed(2)],
      [],
      ['Summary Metrics', 'Value (kg CO2e)', 'Value (tCO2e)', 'Percentage'],
      ['Total Baseline Footprint', totalFootprint.totalKg.toFixed(1), totalFootprint.totalTonnes.toFixed(2), '100%'],
      ['Projected Decarbonized', scenarioResults.projectedTotalKg.toFixed(1), scenarioResults.projectedTotalTonnes.toFixed(2), `${(100 - scenarioResults.percentageReduction).toFixed(1)}%`],
      ['Avoided Emissions Delta', `-${scenarioResults.avoidedTotalKg.toFixed(1)}`, `-${scenarioResults.avoidedTotalTonnes.toFixed(2)}`, `-${scenarioResults.percentageReduction.toFixed(1)}%`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CarbonIQ_Audit_${reportingPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const payload = {
      platform: 'CarbonIQ',
      exportDate: new Date().toISOString(),
      period: reportingPeriod,
      inputs: inputs,
      footprint: totalFootprint,
      scenarioProjections: scenarioResults
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CarbonIQ_Dataset.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header
        className="app-topbar"
      >
        <div className="topbar-brand">
          <button
            onClick={onMobileMenuToggle}
            className="btn btn-secondary btn-sm topbar-menu-button"
            id="mobile-nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={isMobileMenuOpen}
            aria-controls="primary-navigation"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="topbar-brand-icon"><Leaf size={20} /></div>
          <div>
            <strong className="topbar-brand-name">
              CarbonVision<span className="topbar-brand-accent"> AI</span>
            </strong>
            <span className="topbar-tagline">Smarter buildings. Lower carbon.</span>
          </div>
        </div>

        {/* Right Section: Theme Switcher, Period Toggle & Export */}
        <div className="topbar-controls">
          <form className="topbar-search" onSubmit={handleSearch} role="search">
            <Search size={15} />
            <input
              aria-label="Search workspace"
              placeholder="Search workspace..."
              value={searchQuery}
              onChange={event => {
                setSearchQuery(event.target.value);
                setSearchMessage('');
              }}
            />
            {searchMessage && <span className="topbar-search-message" role="status">{searchMessage}</span>}
          </form>

          {/* Export Report Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="btn btn-secondary btn-sm topbar-export"
            disabled={!hasCompleteFootprint}
            title={hasCompleteFootprint ? 'Export user-entered emissions data' : 'Complete the calculator fields before exporting an emissions report'}
          >
            <Download size={15} />
            <span style={{ display: 'inline' }}>Export Report</span>
          </button>

          <div className="topbar-menu-anchor">
            <button className="topbar-icon-button" onClick={() => setOpenMenu(openMenu === 'notifications' ? '' : 'notifications')} aria-label="Notifications" aria-expanded={openMenu === 'notifications'}>
              <Bell size={17} />
            </button>
            {openMenu === 'notifications' && (
              <div className="topbar-popover">
                <strong>Notifications</strong>
                <p>No notifications yet. Connected services can add updates here.</p>
              </div>
            )}
          </div>

          <div className="topbar-menu-anchor">
            <button className="topbar-profile-button" onClick={() => setOpenMenu(openMenu === 'profile' ? '' : 'profile')} aria-expanded={openMenu === 'profile'}>
              <span className="topbar-avatar"><Building2 size={15} /></span>
              <span className="topbar-profile-label">{user ? user.name : authStatus === 'unavailable' ? 'Service unavailable' : 'Local workspace'}</span>
              <ChevronDown size={14} />
            </button>
            {openMenu === 'profile' && (
              <div className="topbar-popover">
                <strong>{user ? user.email : 'Browser workspace'}</strong>
                {profileError && <p className="workspace-error" role="alert">{profileError}</p>}
                {installPrompt ? (
                  <button className="topbar-popover-action" onClick={handleInstall}>
                    <Download size={14} /> Install CarbonVision app
                  </button>
                ) : installMessage ? (
                  <p role="status">{installMessage}</p>
                ) : (
                  <p>To install, use your browser’s Install app or Add to Home Screen option.</p>
                )}
                {user ? (
                  <button className="topbar-popover-action" onClick={handleSignOut}>Sign out</button>
                ) : (
                  <>
                    <p>{authStatus === 'unavailable' ? 'Account service is currently unavailable.' : 'Sign in to access private organisation workspaces.'}</p>
                    <button className="topbar-popover-action" onClick={() => { setOpenMenu(''); onNavigate('organizations'); }}>
                      Sign in to organisations
                    </button>
                    <button
                      className="topbar-popover-action"
                      onClick={() => {
                        setOpenMenu('');
                        setShowExportModal(true);
                      }}
                      disabled={!hasCompleteFootprint}
                      title={hasCompleteFootprint ? 'Export user-entered emissions data' : 'Complete the calculator fields before exporting'}
                    >
                      <Download size={14} /> Export report
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Export Report Modal */}
      {showExportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#13241e',
              border: '1px solid var(--border-bright)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText color="#34d399" size={20} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                  Carbon Intelligence Executive Summary
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Snapshot generated for hackathon review and sustainability committee presentations.
            </p>

            <div
              style={{
                background: 'rgba(16, 28, 24, 0.8)',
                padding: '16px',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Baseline Footprint:</span>
                <strong>{totalFootprint.totalKg.toLocaleString()} kg CO₂e ({totalFootprint.totalTonnes.toFixed(2)} t)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Projected Decarbonized:</span>
                <strong style={{ color: '#34d399' }}>
                  {scenarioResults.projectedTotalKg.toLocaleString()} kg CO₂e ({scenarioResults.projectedTotalTonnes.toFixed(2)} t)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Avoided Emissions:</span>
                <strong style={{ color: '#10b981' }}>
                  -{scenarioResults.avoidedTotalKg.toLocaleString()} kg CO₂e (-{scenarioResults.percentageReduction.toFixed(1)}%)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Reporting Period:</span>
                <span style={{ textTransform: 'capitalize' }}>{reportingPeriod}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={exportCSV}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', gap: '4px' }}
                  title="Download metered breakdown in CSV format"
                >
                  <Download size={13} />
                  Export CSV
                </button>
                <button
                  onClick={exportJSON}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', gap: '4px' }}
                  title="Download full JSON dataset"
                >
                  <Download size={13} />
                  Export JSON
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
                <button
                  onClick={triggerExport}
                  className="btn btn-primary btn-sm"
                >
                  <Download size={14} />
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Style for mobile nav toggle */}
      <style>{`
        @media (max-width: 900px) {
          #mobile-nav-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
}
