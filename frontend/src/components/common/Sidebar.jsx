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
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        id="primary-navigation"
        className={`app-sidebar${isMobileOpen ? ' sidebar-open' : ' sidebar-normal'}`}
        aria-label="Main navigation"
      >
        <nav className="sidebar-nav">
          {[
            { id: 'workspace', label: 'Workspace' },
            { id: 'tools', label: 'Tools' }
          ].map(group => (
            <div className="sidebar-nav-group" key={group.id}>
              <div className="sidebar-nav-label">{group.label}</div>
              <div className="sidebar-nav-items">
                {navItems.filter(item => item.group === group.id).map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`sidebar-item${isActive ? ' is-active' : ''}`}
                >
                  <span className="sidebar-item-label">
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="sidebar-item-badge">{item.badge}</span>
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
      `}</style>
    </>
  );
}
