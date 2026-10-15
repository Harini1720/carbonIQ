import React, { useState } from 'react';
import { useCarbon } from '../context/CarbonContext';
import Campus3DViewer from '../components/campus/Campus3DViewer';
import BuildingDetailModal from '../components/campus/BuildingDetailModal';
import CampusLegend from '../components/campus/CampusLegend';
import BuildingComparison from '../components/campus/BuildingComparison';
import InfoNotice from '../components/common/InfoNotice';
import {
  Compass,
  Building2,
  Sparkles,
  Sliders,
  Scale,
  Zap,
  Info
} from 'lucide-react';

export default function CampusTwinPage({ onNavigate }) {
  const {
    allBuildings,
    selectedBuildingId,
    setSelectedBuildingId,
    activePreset
  } = useCarbon();

  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  const activeBuilding = allBuildings.find(b => b.id === selectedBuildingId) || allBuildings[0];

  const handleSelectBuilding = (id) => {
    setSelectedBuildingId(id);
    setInspectModalOpen(true);
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-header-title">
              Interactive Sustainable Campus Digital Twin
            </h1>
            <span className="badge badge-green">
              Physical Twin v2.4
            </span>
          </div>
          <p className="page-header-subtitle">
            Simulated 3D spatial mapping of energy distribution, rooftop solar irradiance, electric transit corridors, and decentralized resource recovery across {activePreset.name}.
          </p>
        </div>

        <button
          onClick={() => onNavigate('simulator')}
          className="btn btn-primary btn-sm"
          style={{ gap: '6px' }}
        >
          <Sliders size={15} />
          <span>Launch Scenario Simulator</span>
        </button>
      </div>

      <InfoNotice
        title="Digital Twin Operational Notice:"
        message="Data points are calibrated engineering models designed to demonstrate spatial decarbonization. Future releases support MQTT/BACnet IoT gateway integration."
      />

      {/* Buildings Quick-Select Ribbon */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '14px' }}>
        {allBuildings.map((b) => {
          const isSelected = selectedBuildingId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => handleSelectBuilding(b.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 28, 24, 0.7)',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Building2 size={14} color={isSelected ? '#34d399' : 'var(--text-dim)'} />
              <span>{b.name.split(':')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main 3D Campus Viewer */}
      <Campus3DViewer
        onSelectBuilding={handleSelectBuilding}
        selectedBuildingId={selectedBuildingId}
      />

      {/* Building Details Modal */}
      {inspectModalOpen && (
        <BuildingDetailModal
          building={activeBuilding}
          onClose={() => setInspectModalOpen(false)}
        />
      )}

      {/* Campus Map Legend */}
      <CampusLegend />

      {/* Cross-Building Comparative Matrix */}
      <BuildingComparison />
    </div>
  );
}
