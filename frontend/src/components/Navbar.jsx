import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { checkBackendHealth } from '../services/riskService';

const POLL_INTERVAL_MS = 30_000; // re-check every 30 s

const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 2L4 7V14C4 19.52 8.36 24.74 14 26C19.64 24.74 24 19.52 24 14V7L14 2Z"
      fill="none"
      stroke="#3b82f6"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M10 14l3 3 5-6"
      stroke="#60a5fa"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Navbar = () => {
  const [online, setOnline] = useState(null); // null = checking
  const navigate = useNavigate();

  const checkStatus = useCallback(async () => {
    const result = await checkBackendHealth();
    setOnline(result);
  }, []);

  // Initial check + polling
  useEffect(() => {
    checkStatus();
    const id = setInterval(checkStatus, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [checkStatus]);

  const statusClass  = online === null ? 'status-checking' : online ? 'status-online'  : 'status-offline';
  const dotClass     = online === null ? 'dot-checking'    : online ? 'dot-online'     : 'dot-offline';
  const statusLabel  = online === null ? 'Checking…'       : online ? 'System Online'  : 'System Offline';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo + Title — clicking goes to Dashboard */}
        <div
          className="navbar-brand"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
          aria-label="Go to Dashboard"
        >
          <div className="navbar-logo" aria-hidden="true">
            <ShieldIcon />
          </div>
          <div>
            <h1 className="navbar-title">RiskGuard-AI</h1>
            <p className="navbar-subtitle">AI-Powered Fraud Risk Management</p>
          </div>
        </div>

        {/* Right side */}
        <div className="navbar-right">
          <nav className="nav-links" aria-label="Main navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link-item ${isActive ? 'nav-link-active' : ''}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `nav-link-item ${isActive ? 'nav-link-active' : ''}`
              }
            >
              Reports
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `nav-link-item ${isActive ? 'nav-link-active' : ''}`
              }
            >
              Settings
            </NavLink>
          </nav>

          {/* Live backend status */}
          <div
            className={`system-status ${statusClass}`}
            title={online ? 'FastAPI backend reachable at http://127.0.0.1:8000' : 'Backend unreachable'}
          >
            <span className={`status-dot ${dotClass}`} />
            <span className="status-text">{statusLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
