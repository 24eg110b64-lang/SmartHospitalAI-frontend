import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Hospital,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, toggleCollapse, mobileOpen, closeMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/doctors', label: 'Doctors', icon: Stethoscope },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/medical-records', label: 'Medical Records', icon: FileText },
    { to: '/ai-diagnosis', label: 'AI Diagnosis', icon: Sparkles, badge: 'AI' },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={closeMobile} />}

      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <NavLink to="/dashboard" className="sidebar-brand" onClick={closeMobile}>
              <div className="brand-icon-wrapper">
                <Hospital size={22} />
              </div>
              <div>
                <span style={{ color: '#38bdf8' }}>Smart</span>Hospital
                <span style={{ fontSize: '0.75rem', marginLeft: '4px', opacity: 0.8, color: '#a78bfa' }}>AI</span>
              </div>
            </NavLink>
          )}

          {isCollapsed && (
            <div className="brand-icon-wrapper" style={{ margin: '0 auto' }}>
              <Hospital size={22} />
            </div>
          )}

          <button
            onClick={toggleCollapse}
            className="sidebar-toggle-btn"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">
            {!isCollapsed ? 'Clinical & Admin' : '•'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <div className="nav-item-icon">
                  <Icon size={20} />
                </div>
                {!isCollapsed && (
                  <span className="nav-item-text">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="sidebar-footer">
          {!isCollapsed ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
              }}
            >
              <div className="user-profile-widget" style={{ flex: 1 }}>
                <div className="user-avatar-circle">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info-text">
                  <div className="user-name">{user?.username || 'Staff'}</div>
                  <div className="user-role-tag">{user?.role || 'Clinician'}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="sidebar-toggle-btn"
                title="Logout"
                style={{ color: '#f87171' }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="sidebar-toggle-btn"
              title="Logout"
              style={{ margin: '0 auto', color: '#f87171' }}
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
