import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  Compass,
  Sliders,
  Sparkles,
  BookOpen,
  Leaf,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { useCarbon } from '../../context/CarbonContext';

export default function Sidebar({ activePage, onNavigate, isMobileOpen, onCloseMobile }) {
  const { scenarioResults } = useCarbon();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'calculator',
      label: 'Emissions Calculator',
      icon: Calculator,
      badge: 'Live Math'
    },
    {
      id: 'twin',
      label: 'Campus Digital Twin',
      icon: Compass,
      badge: '3D Sim'
    },
    {
      id: 'simulator',
      label: 'Scenario Simulator',
      icon: Sliders,
      badge: 'Interactive'
    },
    {
      id: 'recommendations',
      label: 'AI Recommendations',
      icon: Sparkles,
      badge: 'Rule Engine'
    },
    {
      id: 'methodology',
      label: 'About & Methodology',
      icon: BookOpen,
      badge: 'Citations'
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 49
          }}
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: isMobileOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.25s ease'
        }}
        className={isMobileOpen ? 'sidebar-open' : 'sidebar-normal'}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '22px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Leaf size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                Carbon<span style={{ color: '#34d399' }}>IQ</span>
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#6ee7b7',
                  fontWeight: 700
                }}
              >
                PS05
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
              Carbon Footprint Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', padding: '0 12px 10px 12px' }}>
            Platform Modules
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'rgba(16, 185, 129, 0.16)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left'
                  }}
                  className="sidebar-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon
                      size={18}
                      color={isActive ? '#34d399' : '#6ee7b7aa'}
                      style={{ transition: 'color 0.15s ease' }}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isActive ? 'rgba(52, 211, 153, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        color: isActive ? '#a7f3d0' : 'var(--text-muted)',
                        fontWeight: 600
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Sustainability Target Progress Card */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div
            style={{
              background: 'rgba(16, 28, 24, 0.7)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={13} color="#34d399" />
                Decarbonization Delta
              </span>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>
                -{scenarioResults.percentageReduction.toFixed(1)}%
              </span>
            </div>
            {/* Progress Track */}
            <div
              style={{
                width: '100%',
                height: '6px',
                background: '#101c18',
                borderRadius: '99px',
                overflow: 'hidden',
                marginBottom: '6px'
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, scenarioResults.percentageReduction * 2)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                  borderRadius: '99px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              <span>Target: 50% by 2030</span>
              <span>{scenarioResults.avoidedTotalTonnes.toFixed(1)} t saved</span>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          .sidebar-normal {
            transform: translateX(-100%);
          }
        }
        .sidebar-item:hover {
          background: rgba(16, 185, 129, 0.08) !important;
          color: #fff !important;
        }
      `}</style>
    </>
  );
}
