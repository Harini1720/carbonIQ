import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Zap,
  Leaf,
  Wind,
  Info
} from 'lucide-react';

export default function Campus3DViewer({ onSelectBuilding, selectedBuildingId }) {
  const { allBuildings, activeBuildingRetrofits, scenarioResults } = useCarbon();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(1.4, Math.max(0.75, prev + delta)));
  };

  const resetZoom = () => setZoomLevel(1);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '520px',
        borderRadius: '16px',
        background: 'radial-gradient(ellipse at 50% 30%, #152e25 0%, #0d1e18 60%, #08130f 100%)',
        border: '1px solid var(--border-medium)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* Top Floating Control Bar */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(18, 33, 28, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem'
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 700 }}>
          <Sparkles size={14} />
          Digital Twin Campus (Isometric View)
        </span>
        <span style={{ color: 'var(--text-dim)' }}>|</span>
        <span style={{ color: 'var(--text-muted)' }}>Click building to inspect retrofits</span>
      </div>

      {/* Floating Zoom Controls */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: 'rgba(18, 33, 28, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '6px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <button
          onClick={() => handleZoom(0.1)}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px', borderRadius: '6px' }}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => handleZoom(-0.1)}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px', borderRadius: '6px' }}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={resetZoom}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px', borderRadius: '6px' }}
          title="Reset Zoom"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* SVG Isometric Canvas */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease',
          transform: `scale(${zoomLevel})`
        }}
      >
        <svg
          viewBox="0 0 920 540"
          style={{ width: '100%', maxWidth: '920px', height: 'auto', display: 'block' }}
        >
          <defs>
            {/* Shimmer gradient for solar panels */}
            <linearGradient id="solarShimmerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
            </linearGradient>

            {/* Ground grid pattern */}
            <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="1" />
            </pattern>

            {/* Building Wall Gradients */}
            <linearGradient id="wallGradLeft" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a31" />
              <stop offset="100%" stopColor="#142822" />
            </linearGradient>
            <linearGradient id="wallGradRight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#25483d" />
              <stop offset="100%" stopColor="#1a332b" />
            </linearGradient>
            <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d574a" />
              <stop offset="100%" stopColor="#1e3b32" />
            </linearGradient>

            {/* Highlighted Building Gradient */}
            <linearGradient id="roofHighlight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Tree Leaf Gradients */}
            <radialGradient id="treeGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>
          </defs>

          {/* Isometric Ground Surface Plane */}
          <polygon
            points="460,35 880,245 460,495 40,245"
            fill="#12251e"
            stroke="rgba(52, 211, 153, 0.25)"
            strokeWidth="2"
          />
          <polygon
            points="460,35 880,245 460,495 40,245"
            fill="url(#campusGrid)"
          />

          {/* Walking Paths & Transit Corridors */}
          {/* Main East-West Boulevard */}
          <polygon
            points="180,210 740,210 750,230 170,230"
            fill="#1f3b31"
            opacity="0.8"
          />
          {/* North-South Connector Path */}
          <polygon
            points="450,110 470,110 480,440 440,440"
            fill="#1f3b31"
            opacity="0.8"
          />
          {/* Perimeter Ring Loop Road */}
          <path
            d="M 120,245 Q 460,75 800,245 Q 460,455 120,245 Z"
            fill="none"
            stroke="#1b362c"
            strokeWidth="22"
          />
          <path
            d="M 120,245 Q 460,75 800,245 Q 460,455 120,245 Z"
            fill="none"
            stroke="rgba(52, 211, 153, 0.3)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />

          {/* Animated Energy Conduits / Smart Microgrid Cables */}
          <path
            d="M 110,140 L 260,200 L 430,170 L 600,215 L 750,260"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeDasharray="8 8"
            className="energy-conduit"
            style={{ animation: 'flowConduitDash 2s linear infinite' }}
          />

          {/* Pulsing Grid Energy Junction Nodes */}
          {[
            { cx: 110, cy: 140 },
            { cx: 260, cy: 200 },
            { cx: 430, cy: 170 },
            { cx: 600, cy: 215 },
            { cx: 750, cy: 260 }
          ].map((pt, i) => (
            <circle
              key={i}
              cx={pt.cx}
              cy={pt.cy}
              r="4"
              fill="#34d399"
              className="pulse-node"
              style={{ animation: 'pulseEnergyGlow 2s infinite ease-in-out', animationDelay: `${i * 0.4}s` }}
            />
          ))}

          {/* ============================================================== */}
          {/* FACILITY 1: Micro Wind Turbine (North-West Sector)             */}
          {/* ============================================================== */}
          <g transform="translate(110, 110)">
            {/* Turbine Mast */}
            <polygon points="-3,0 3,0 1.5,-65 -1.5,-65" fill="#e2e8f0" />
            <ellipse cx="0" cy="0" rx="12" ry="6" fill="#1c382f" />
            <circle cx="0" cy="-65" r="5" fill="#f8fafc" />

            {/* Rotating Blades using CSS animation */}
            <g
              className="turbine-blade"
              style={{
                transformOrigin: '0px -65px',
                animation: 'spinSlow 3.8s linear infinite'
              }}
            >
              {/* Blade 1 */}
              <path d="M 0,-65 C 2,-85 3,-100 0,-108 C -3,-100 -2,-85 0,-65 Z" fill="#f1f5f9" />
              {/* Blade 2 (120 deg) */}
              <g transform="rotate(120, 0, -65)">
                <path d="M 0,-65 C 2,-85 3,-100 0,-108 C -3,-100 -2,-85 0,-65 Z" fill="#f1f5f9" />
              </g>
              {/* Blade 3 (240 deg) */}
              <g transform="rotate(240, 0, -65)">
                <path d="M 0,-65 C 2,-85 3,-100 0,-108 C -3,-100 -2,-85 0,-65 Z" fill="#f1f5f9" />
              </g>
            </g>
            <text x="0" y="16" fill="#6ee7b7" fontSize="9" textAnchor="middle" fontWeight="600">
              Wind Turbine 25kW
            </text>
          </g>

          {/* ============================================================== */}
          {/* FACILITY 2: Canopy Solar PV Field (North Sector)               */}
          {/* ============================================================== */}
          <g transform="translate(420, 75)">
            <ellipse cx="40" cy="20" rx="55" ry="24" fill="#163328" stroke="rgba(52, 211, 153, 0.3)" />
            {/* Rows of tilted solar canopy tables */}
            {[-25, -5, 15, 35].map((offY, idx) => (
              <polygon
                key={idx}
                points={`${idx * 12},${offY} ${idx * 12 + 65},${offY - 14} ${idx * 12 + 75},${offY - 6} ${idx * 12 + 10},${offY + 8}`}
                fill="url(#solarShimmerGrad)"
                stroke="#38bdf8"
                strokeWidth="0.8"
                className="solar-shimmer"
                style={{ animation: 'solarPulse 3s infinite ease-in-out', animationDelay: `${idx * 0.5}s` }}
              />
            ))}
            <text x="40" y="38" fill="#38bdf8" fontSize="9" textAnchor="middle" fontWeight="600">
              Solar Field (235 kWp)
            </text>
          </g>

          {/* ============================================================== */}
          {/* FACILITY 3: EV Charging Station & Parked Car                   */}
          {/* ============================================================== */}
          <g transform="translate(130, 310)">
            {/* Parking surface */}
            <polygon points="-20,-10 60,-10 80,25 0,25" fill="#1b362c" stroke="rgba(52, 211, 153, 0.3)" />
            {/* Charger bollards */}
            <rect x="0" y="-18" width="8" height="14" rx="2" fill="#10b981" />
            <circle cx="4" cy="-12" r="2" fill="#a7f3d0" />
            <rect x="25" y="-18" width="8" height="14" rx="2" fill="#10b981" />
            <circle cx="29" cy="-12" r="2" fill="#a7f3d0" />

            {/* Parked EV Car */}
            <g transform="translate(20, -2)">
              <rect x="0" y="0" width="28" height="14" rx="4" fill="#38bdf8" />
              <rect x="5" y="2" width="12" height="6" rx="2" fill="#0369a1" />
              <circle cx="6" cy="14" r="3" fill="#111827" />
              <circle cx="22" cy="14" r="3" fill="#111827" />
            </g>
            <text x="30" y="38" fill="#34d399" fontSize="9" textAnchor="middle" fontWeight="600">
              EV Hub (8 Fast Chargers)
            </text>
          </g>

          {/* ============================================================== */}
          {/* FACILITY 4: Central Waste & Composting Yard                     */}
          {/* ============================================================== */}
          <g transform="translate(730, 240)">
            <ellipse cx="25" cy="15" rx="40" ry="22" fill="#1f3328" stroke="rgba(245, 158, 11, 0.4)" />
            {/* 3 Color-Coded Segregation Bins */}
            <rect x="0" y="0" width="12" height="14" rx="2" fill="#10b981" title="Compost" />
            <rect x="18" y="0" width="12" height="14" rx="2" fill="#0284c7" title="Recyclables" />
            <rect x="36" y="0" width="12" height="14" rx="2" fill="#f59e0b" title="Landfill" />
            <text x="25" y="32" fill="#fcd34d" fontSize="9" textAnchor="middle" fontWeight="600">
              Compost & Waste Yard
            </text>
          </g>

          {/* ============================================================== */}
          {/* MOVING ELEMENT: Electric Transit Shuttle Vehicle                */}
          {/* ============================================================== */}
          <g
            className="ev-moving-shuttle"
            style={{
              animation: 'shuttleCruise 14s infinite linear'
            }}
          >
            {/* Shuttle Body */}
            <rect x="0" y="0" width="34" height="16" rx="5" fill="#10b981" stroke="#34d399" strokeWidth="1" />
            {/* Shuttle Windows */}
            <rect x="4" y="3" width="7" height="6" rx="1" fill="#ecfdf5" opacity="0.8" />
            <rect x="13" y="3" width="7" height="6" rx="1" fill="#ecfdf5" opacity="0.8" />
            <rect x="22" y="3" width="7" height="6" rx="1" fill="#ecfdf5" opacity="0.8" />
            {/* Wheels */}
            <circle cx="8" cy="16" r="3" fill="#1f2937" />
            <circle cx="26" cy="16" r="3" fill="#1f2937" />
            {/* Clean EV Shuttle badge */}
            <text x="17" y="12" fill="#064e3b" fontSize="6" textAnchor="middle" fontWeight="800">
              EV
            </text>
          </g>

          {/* ============================================================== */}
          {/* LANDSCAPED SWAYING TREES (Multiple clusters)                    */}
          {/* ============================================================== */}
          {[
            { x: 190, y: 130, cls: 'swaying-tree', scale: 0.9 },
            { x: 215, y: 120, cls: 'swaying-tree-alt', scale: 1.1 },
            { x: 330, y: 140, cls: 'swaying-tree', scale: 1.0 },
            { x: 500, y: 135, cls: 'swaying-tree-alt', scale: 0.85 },
            { x: 520, y: 125, cls: 'swaying-tree', scale: 1.1 },
            { x: 670, y: 170, cls: 'swaying-tree-alt', scale: 1.0 },
            { x: 710, y: 190, cls: 'swaying-tree', scale: 0.9 },
            { x: 380, y: 250, cls: 'swaying-tree', scale: 0.8 },
            { x: 540, y: 260, cls: 'swaying-tree-alt', scale: 1.0 },
            { x: 170, y: 270, cls: 'swaying-tree', scale: 1.2 }
          ].map((tree, idx) => (
            <g
              key={idx}
              transform={`translate(${tree.x}, ${tree.y}) scale(${tree.scale})`}
              className={tree.cls}
              style={{
                transformOrigin: '0px 0px',
                animation: tree.cls === 'swaying-tree'
                  ? 'swayGently 3.5s infinite ease-in-out'
                  : 'swayGentlyAlt 4.2s infinite ease-in-out',
                animationDelay: `${idx * 0.35}s`
              }}
            >
              {/* Trunk */}
              <line x1="0" y1="0" x2="0" y2="-12" stroke="#452718" strokeWidth="3" strokeLinecap="round" />
              {/* Foliage Canopy */}
              <circle cx="0" cy="-22" r="14" fill="url(#treeGrad)" opacity="0.95" />
              <circle cx="-6" cy="-20" r="10" fill="#10b981" opacity="0.8" />
              <circle cx="6" cy="-24" r="9" fill="#34d399" opacity="0.85" />
            </g>
          ))}

          {/* ============================================================== */}
          {/* CAMPUS BUILDINGS (Isometric 2.5D Blocks)                        */}
          {/* ============================================================== */}
          {allBuildings.map((bldg) => {
            const isSelected = selectedBuildingId === bldg.id;
            const isHovered = hoveredBuilding === bldg.id;
            const pos = bldg.position;
            const hasRetrofit = (activeBuildingRetrofits[bldg.id] || []).length > 0;

            // Geometry offsets for isometric projection
            const bw = pos.width * 0.7;
            const bh = pos.height * 0.55;
            const wallH = bldg.floors * 11; // height based on floors

            const originX = pos.x;
            const originY = pos.y;

            return (
              <g
                key={bldg.id}
                onClick={() => onSelectBuilding && onSelectBuilding(bldg.id)}
                onMouseEnter={() => setHoveredBuilding(bldg.id)}
                onMouseLeave={() => setHoveredBuilding(null)}
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  filter: isSelected
                    ? 'drop-shadow(0 0 14px #10b981)'
                    : isHovered
                    ? 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.6))'
                    : 'none'
                }}
              >
                {/* Building Base Shadow */}
                <polygon
                  points={`${originX},${originY + bh} ${originX + bw},${originY} ${originX + bw * 2},${originY + bh} ${originX + bw},${originY + bh * 2}`}
                  fill="rgba(0, 0, 0, 0.45)"
                  opacity="0.8"
                />

                {/* Left Wall Facade */}
                <polygon
                  points={`${originX},${originY + bh - wallH} ${originX + bw},${originY - wallH} ${originX + bw},${originY} ${originX},${originY + bh}`}
                  fill="url(#wallGradLeft)"
                  stroke="rgba(52, 211, 153, 0.2)"
                  strokeWidth="1"
                />

                {/* Right Wall Facade */}
                <polygon
                  points={`${originX + bw},${originY - wallH} ${originX + bw * 2},${originY + bh - wallH} ${originX + bw * 2},${originY + bh} ${originX + bw},${originY}`}
                  fill="url(#wallGradRight)"
                  stroke="rgba(52, 211, 153, 0.2)"
                  strokeWidth="1"
                />

                {/* Rooftop Plane */}
                <polygon
                  points={`${originX},${originY + bh - wallH} ${originX + bw},${originY - wallH} ${originX + bw * 2},${originY + bh - wallH} ${originX + bw},${originY + bh * 2 - wallH}`}
                  fill={isSelected ? 'url(#roofHighlight)' : 'url(#roofGrad)'}
                  stroke={isSelected ? '#34d399' : 'rgba(52, 211, 153, 0.35)'}
                  strokeWidth={isSelected ? '2.5' : '1.2'}
                />

                {/* Rooftop Solar Panels */}
                {bldg.solarCapacityKwp > 0 && (
                  <polygon
                    points={`${originX + bw * 0.3},${originY + bh * 0.7 - wallH} ${originX + bw},${originY + bh * 0.3 - wallH} ${originX + bw * 1.6},${originY + bh * 0.8 - wallH} ${originX + bw},${originY + bh * 1.3 - wallH}`}
                    fill="url(#solarShimmerGrad)"
                    stroke="#38bdf8"
                    strokeWidth="1"
                    className="solar-shimmer"
                    style={{ animation: 'solarPulse 3s infinite ease-in-out' }}
                  />
                )}

                {/* Windows Illumination Lines */}
                {[1, 2, 3].map((f) => {
                  const fh = (f * wallH) / (bldg.floors + 1);
                  return (
                    <line
                      key={f}
                      x1={originX + bw * 0.2}
                      y1={originY + bh * 0.7 - fh}
                      x2={originX + bw * 0.8}
                      y2={originY + bh * 0.2 - fh}
                      stroke="rgba(254, 240, 138, 0.5)"
                      strokeWidth="2.5"
                      strokeDasharray="4 6"
                    />
                  );
                })}

                {/* Building Status Tag / Badge Floating Above Roof */}
                <g transform={`translate(${originX + bw}, ${originY - wallH - 14})`}>
                  <rect
                    x="-45"
                    y="-12"
                    width="90"
                    height="18"
                    rx="6"
                    fill={isSelected ? '#059669' : '#132822'}
                    stroke={isSelected ? '#34d399' : 'rgba(52, 211, 153, 0.4)'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="1"
                    fill="#ffffff"
                    fontSize="8"
                    textAnchor="middle"
                    fontWeight="700"
                  >
                    {bldg.name.split(':')[0]}
                  </text>

                  {/* Active Retrofit Pill */}
                  {hasRetrofit && (
                    <circle cx="40" cy="-4" r="4" fill="#34d399" stroke="#12251e" strokeWidth="1" />
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Summary Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '14px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(18, 33, 28, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '8px 16px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Rooftop Solar PV Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Clean EV Transit Route</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Organic Compost Hub</span>
          </div>
        </div>

        <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
          Real-time isometric representation
        </div>
      </div>
    </div>
  );
}
