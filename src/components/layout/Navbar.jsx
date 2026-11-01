import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Server,
  Cpu,
  LogOut,
  Bell,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, AI_BASE_URL } from '../../services/api';

const routeTitles = {
  '/dashboard': 'Dashboard Overview',
  '/patients': 'Patient Management',
  '/doctors': 'Doctor Directory',
  '/appointments': 'Clinical Appointments',
  '/medical-records': 'Electronic Medical Records',
  '/ai-diagnosis': 'AI Clinical Diagnosis Support',
  '/reports': 'Hospital Analytics & Reports',
  '/settings': 'System Settings & Profile',
};

export const Navbar = ({ onMobileMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [backendOk, setBackendOk] = useState(true);
  const [aiOk, setAiOk] = useState(true);

  // Quick health checks on mount
  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      // Backend check (GET /doctors)
      try {
        const res = await fetch(`${API_BASE_URL}/doctors`, { method: 'GET' });
        if (isMounted) setBackendOk(res.ok);
      } catch {
        if (isMounted) setBackendOk(false);
      }

      // AI Service check (GET /)
      try {
        const resAi = await fetch(`${AI_BASE_URL}/`, { method: 'GET' });
        if (isMounted) setAiOk(resAi.ok);
      } catch {
        if (isMounted) setAiOk(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const currentTitle = routeTitles[location.pathname] || 'Smart Hospital';

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onMobileMenuClick}
          aria-label="Toggle mobile menu"
        >
          <Menu size={22} />
        </button>

        <div className="page-breadcrumb">
          <span>SmartHospitalAI</span>
          <span>/</span>
          <strong>{currentTitle}</strong>
        </div>
      </div>

      <div className="topbar-right">
        {/* Backend Connectivity Status */}
        <div
          className="system-status-indicator"
          title={`Backend API: ${API_BASE_URL} (${backendOk ? 'Online' : 'Offline / Checking'})`}
        >
          <span className={`status-dot ${backendOk ? '' : 'error'}`} />
          <Server size={14} />
          <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>
            Backend {backendOk ? '8081' : 'Off'}
          </span>
        </div>

        {/* AI Service Connectivity Status */}
        <div
          className="system-status-indicator"
          title={`AI Service: ${AI_BASE_URL} (${aiOk ? 'Active' : 'Offline / Checking'})`}
        >
          <span className={`status-dot ${aiOk ? '' : 'error'}`} />
          <Cpu size={14} />
          <span>AI {aiOk ? 'Ready' : 'Off'}</span>
        </div>

        {/* User Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-surface-subtle)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>

          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {user?.username || 'Staff'}
          </span>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="sidebar-toggle-btn"
            title="Sign out"
            style={{ padding: '2px', color: 'var(--danger)' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
