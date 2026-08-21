import React, { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth } from '../services/riskService';

const InfoRow = ({ label, value, mono = false, accent }) => (
  <div className="settings-row">
    <span className="settings-label">{label}</span>
    <span
      className={`settings-value ${mono ? 'settings-mono' : ''}`}
      style={accent ? { color: accent } : {}}
    >
      {value}
    </span>
  </div>
);

const SectionCard = ({ icon, title, subtitle, children }) => (
  <div className="card settings-card">
    <div className="card-header">
      <div className="card-header-icon">{icon}</div>
      <div>
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
    </div>
    <div className="settings-body">{children}</div>
  </div>
);

const Settings = () => {
  const [backendStatus, setBackendStatus] = useState('idle'); // idle | checking | online | offline
  const [lastChecked, setLastChecked] = useState(null);

  const runCheck = useCallback(async () => {
    setBackendStatus('checking');
    const ok = await checkBackendHealth();
    setBackendStatus(ok ? 'online' : 'offline');
    setLastChecked(new Date());
  }, []);

  // Check on mount
  useEffect(() => {
    runCheck();
  }, [runCheck]);

  const statusMap = {
    idle:     { label: 'Not checked',    color: 'var(--text-muted)',   dot: 'dot-checking' },
    checking: { label: 'Checking…',      color: 'var(--text-secondary)', dot: 'dot-checking' },
    online:   { label: 'Online ✓',       color: 'var(--low-color)',    dot: 'dot-online'   },
    offline:  { label: 'Offline ✗',      color: 'var(--high-color)',   dot: 'dot-offline'  },
  };
  const st = statusMap[backendStatus];

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">System configuration and model information</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* ML Model */}
        <SectionCard
          title="ML Model"
          subtitle="Core prediction engine"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          }
        >
          <InfoRow label="Algorithm"          value="XGBoost (Gradient Boosted Trees)" />
          <InfoRow label="Task"               value="Binary Classification (Fraud / Legit)" />
          <InfoRow label="Explainability"     value="SHAP (SHapley Additive exPlanations)" />
          <InfoRow label="Risk Levels"        value="LOW · MEDIUM · HIGH" />
          <InfoRow label="Threshold (Low)"    value="0 – 30" mono />
          <InfoRow label="Threshold (Medium)" value="30 – 70" mono />
          <InfoRow label="Threshold (High)"   value="70 – 100" mono />
        </SectionCard>

        {/* Backend connection */}
        <SectionCard
          title="Backend Connection"
          subtitle="FastAPI server status"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          }
        >
          <InfoRow label="Framework"      value="FastAPI" />
          <InfoRow label="Base URL"       value="http://127.0.0.1:8000" mono />
          <InfoRow label="Predict"        value="POST /api/v1/risk/predict" mono />
          <InfoRow label="Health check"   value="GET /health" mono />
          <InfoRow label="API Docs"       value="http://127.0.0.1:8000/docs" mono />

          {/* Status indicator */}
          <div className="settings-status-row">
            <div className="settings-status-info">
              <span className={`status-dot ${st.dot}`} />
              <span className="settings-value" style={{ color: st.color }}>
                {st.label}
              </span>
              {lastChecked && (
                <span className="settings-checked-at">
                  Last checked {lastChecked.toLocaleTimeString()}
                </span>
              )}
            </div>
            <button
              className="btn-check-connection"
              onClick={runCheck}
              disabled={backendStatus === 'checking'}
            >
              {backendStatus === 'checking' ? (
                <>
                  <span className="btn-spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                  Checking…
                </>
              ) : (
                'Check Connection'
              )}
            </button>
          </div>
        </SectionCard>

        {/* AI Integration */}
        <SectionCard
          title="AI Integration"
          subtitle="Local AI reasoning for XGBoost decisions"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          }
        >
          <InfoRow label="LLM Engine"      value="Ollama" />
          <InfoRow label="Model"           value="Gemma 3:4B" />
          <InfoRow
            label="Status"
            value="Active — Integrated"
            accent="var(--low-color)"
          />
          <div className="settings-future-note" style={{ borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.02)', color: 'var(--text-secondary)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--low-color)' }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>
              Local Gemma 3:4B explains XGBoost + SHAP results. Final fraud decision remains governed solely by the XGBoost model.
            </span>
          </div>
        </SectionCard>

        {/* Data & Privacy */}
        <SectionCard
          title="Data & Privacy"
          subtitle="How your data is handled"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          }
        >
          <InfoRow label="Analysis history" value="localStorage (browser only)" />
          <InfoRow label="Data sent to server" value="Transaction fields only (no PII)" />
          <InfoRow label="Server storage" value="None — stateless API" />
          <InfoRow label="History key"    value="riskguard_analysis_history" mono />
        </SectionCard>
      </div>
    </div>
  );
};

export default Settings;
