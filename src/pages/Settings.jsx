import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Server,
  Cpu,
  Hospital,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, AI_BASE_URL } from '../services/api';

export const Settings = () => {
  const { user, logout } = useAuth();

  const [backendStatus, setBackendStatus] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [testingBackend, setTestingBackend] = useState(false);
  const [testingAi, setTestingAi] = useState(false);

  // Test backend connection
  const testBackend = async () => {
    try {
      setTestingBackend(true);
      const start = Date.now();
      const res = await fetch(`${API_BASE_URL}/doctors`);
      const latency = Date.now() - start;
      if (res.ok) {
        setBackendStatus({ ok: true, message: `Connected successfully (${latency}ms latency)` });
      } else {
        setBackendStatus({ ok: false, message: `HTTP Error ${res.status}` });
      }
    } catch (err) {
      setBackendStatus({ ok: false, message: `Connection failed: ${err.message}` });
    } finally {
      setTestingBackend(false);
    }
  };

  // Test AI connection
  const testAi = async () => {
    try {
      setTestingAi(true);
      const start = Date.now();
      const res = await fetch(`${AI_BASE_URL}/`);
      const latency = Date.now() - start;
      if (res.ok) {
        const text = await res.text();
        setAiStatus({ ok: true, message: `${text} (${latency}ms latency)` });
      } else {
        setAiStatus({ ok: false, message: `HTTP Error ${res.status}` });
      }
    } catch (err) {
      setAiStatus({ ok: false, message: `Connection failed: ${err.message}` });
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <SettingsIcon color="var(--primary)" /> Profile & System Configuration
          </h1>
          <p className="page-subtitle">
            User credentials, server connectivity diagnostics, facility metadata, and system preferences.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* User Profile Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <User size={18} color="var(--primary)" /> User Account Profile
            </h3>
            <span className="badge badge-primary">{user?.role || 'Admin'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #0284c7, #7c3aed)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
              }}
            >
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.username || 'Staff User'}</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                System Access: <strong>{user?.role || 'Administrator'}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Session: Active authenticated token
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>User ID</span>
              <strong>#{user?.id || '1'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Assigned Role</span>
              <strong>{user?.role || 'Admin'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Clinical Permissions</span>
              <strong style={{ color: '#059669' }}>Full Read & Write</strong>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-outline"
            style={{ width: '100%', marginTop: '1.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
          >
            <LogOut size={16} /> Sign Out of Session
          </button>
        </div>

        {/* API Microservices Diagnostics */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Server size={18} color="var(--secondary)" /> Microservices Connectivity
            </h3>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Endpoints are configured via <code>.env</code> and loaded at build/runtime.
          </p>

          {/* Backend Spring Boot */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Spring Boot Backend</span>
              <button
                onClick={testBackend}
                disabled={testingBackend}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              >
                <RefreshCw size={12} className={testingBackend ? 'animate-spin' : ''} /> Test Ping
              </button>
            </div>
            <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
              {API_BASE_URL}
            </div>
            {backendStatus && (
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.78rem',
                  color: backendStatus.ok ? '#059669' : '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {backendStatus.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {backendStatus.message}
              </div>
            )}
          </div>

          {/* AI Flask Microservice */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Flask AI ML Service</span>
              <button
                onClick={testAi}
                disabled={testingAi}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              >
                <RefreshCw size={12} className={testingAi ? 'animate-spin' : ''} /> Test Ping
              </button>
            </div>
            <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--accent-purple)' }}>
              {AI_BASE_URL}
            </div>
            {aiStatus && (
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.78rem',
                  color: aiStatus.ok ? '#059669' : '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {aiStatus.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {aiStatus.message}
              </div>
            )}
          </div>
        </div>

        {/* Facility Metadata */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Hospital size={18} color="var(--primary)" /> Hospital Facility Details
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Hospital Name</span>
              <strong>Smart Hospital AI Healthcare Center</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Facility License</span>
              <strong>HL-84920-AI</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Emergency Hotline</span>
              <strong style={{ color: 'var(--danger)' }}>+1 (800) 555-EMERG</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Operating Hours</span>
              <strong>24/7 Inpatient & ER</strong>
            </div>
          </div>
        </div>

        {/* System & Architecture Specifications */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Info size={18} color="var(--primary)" /> Software Stack Specifications
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Frontend</span>
              <strong>React 19 + Vite + React Router v7</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Backend Core</span>
              <strong>Spring Boot 3 + Spring Data JPA</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>AI Engine</span>
              <strong>Python Flask + Scikit-Learn TF-IDF</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Database</span>
              <strong>MySQL (`hospital_db`)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
