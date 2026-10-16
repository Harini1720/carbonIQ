import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  Building2,
  Sliders,
  Sparkles,
  BarChart3,
  ClipboardList,
  Settings,
  Users,
  Leaf
} from 'lucide-react';

export default function Sidebar({ activePage, onNavigate, isMobileOpen, onCloseMobile }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      group: 'workspace',
      badge: null
    },
    {
      id: 'organizations',
      label: 'Organisations',
      icon: Users,
      group: 'workspace',
      badge: null
    },
    {
      id: 'buildings',
      label: 'Buildings',
      icon: Building2,
      group: 'workspace',
      badge: null
    },
    {
      id: 'image-impact',
      label: 'Sustainability Studio',
      icon: Leaf,
      group: 'workspace',
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      group: 'workspace',
      badge: null
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: Sparkles,
      group: 'workspace',
      badge: null
    },
    {
      id: 'action-tracker',
      label: 'Action Tracker',
      icon: ClipboardList,
      group: 'workspace',
      badge: null
    },
    {
      id: 'calculator',
      label: 'Carbon Data & Calculations',
      icon: Calculator,
      group: 'tools',
      badge: null
    },
    {
      id: 'simulator',
      label: 'Scenario Simulator',
      icon: Sliders,
      group: 'tools',
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings & Methodology',
      icon: Settings,
      group: 'tools',
      badge: null
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
          height: 'calc(100vh - var(--header-height))',
          background: 'var(--shell-sidebar)',
          borderRight: '1px solid var(--shell-border)',
          position: 'fixed',
          top: 'var(--header-height)',
          left: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: isMobileOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.25s ease'
        }}
        className={isMobileOpen ? 'sidebar-open' : 'sidebar-normal'}
      >
        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {[
            { id: 'workspace', label: 'Workspace' },
            { id: 'tools', label: 'Tools' }
          ].map((group) => (
            <div key={group.id} style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#78928e', textTransform: 'uppercase', padding: '0 12px 9px 12px', letterSpacing: '0.08em' }}>
                {group.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {navItems.filter(item => item.group === group.id).map((item) => {
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
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'var(--shell-active-bg)' : 'transparent',
                    color: isActive ? 'var(--shell-active-text)' : 'var(--shell-item-text)',
                    fontWeight: isActive ? 800 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left'
                  }}
                  className="sidebar-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon
                      size={18}
                      color={isActive ? 'var(--shell-active-text)' : 'var(--shell-icon)'}
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
                        background: isActive ? 'var(--shell-active-bg)' : 'rgba(255, 255, 255, 0.07)',
                        color: isActive ? 'var(--shell-active-text)' : '#9bbab6',
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
            </div>
          ))}
        </nav>

        <div className="sidebar-branding-panel">
          <span className="sidebar-branding-icon"><Leaf size={16} /></span>
          <strong>Building a greener future</strong>
          <span>Measure what matters. Improve with evidence.</span>
        </div>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          .sidebar-normal {
            transform: translateX(-100%);
          }
        }
        .sidebar-item:hover {
          background: var(--shell-hover) !important;
          color: #f1fbf8 !important;
        }
      `}</style>
    </>
  );
}
