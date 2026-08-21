import React, { useState, useEffect, useCallback } from 'react';
import { loadHistory, clearHistory, computeStats } from '../services/historyService';
import { getRiskStyling, fmt2, fmtPct } from '../utils/formatters';

/* ── helpers ── */
const formatTimestamp = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
};

const formatCategory = (cat) =>
  (cat || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/* ── stat card ── */
const StatCard = ({ label, value, accent }) => (
  <div className="report-stat-card">
    <span className="report-stat-value" style={accent ? { color: accent } : {}}>
      {value}
    </span>
    <span className="report-stat-label">{label}</span>
  </div>
);

/* ── risk pill ── */
const RiskPill = ({ level }) => {
  const style = getRiskStyling(level);
  return (
    <span className={`risk-badge ${style.badge}`} style={{ fontSize: '0.68rem', padding: '2px 10px' }}>
      {level || '—'}
    </span>
  );
};

/* ── empty state ── */
const EmptyReports = () => (
  <div className="report-empty">
    <div className="report-empty-icon" aria-hidden="true">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    </div>
    <h3 className="report-empty-title">No Analysis History</h3>
    <p className="report-empty-body">
      Run a transaction analysis on the Dashboard to see results here.
      <br />
      All successful analyses are stored locally in your browser.
    </p>
  </div>
);

/* ── main page ── */
const Reports = () => {
  const [history, setHistory] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);

  const refresh = useCallback(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    refresh();
    // Sync across tabs
    const handler = (e) => {
      if (e.key === 'riskguard_analysis_history') refresh();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refresh]);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearHistory();
    setHistory([]);
    setConfirmClear(false);
  };

  const stats = computeStats(history);

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Analysis Reports</h2>
          <p className="page-subtitle">
            Historical fraud-risk analyses — stored locally in your browser
          </p>
        </div>
        {history.length > 0 && (
          <button
            className={`btn-clear ${confirmClear ? 'btn-clear-confirm' : ''}`}
            onClick={handleClear}
            onBlur={() => setConfirmClear(false)}
          >
            {confirmClear ? '⚠ Confirm Clear' : 'Clear History'}
          </button>
        )}
      </div>

      {/* Stats row */}
      {history.length > 0 && (
        <div className="report-stats-row">
          <StatCard label="Total Analyses" value={stats.total} />
          <StatCard label="Low Risk"    value={stats.low}    accent="var(--low-color)"    />
          <StatCard label="Medium Risk" value={stats.medium} accent="var(--medium-color)" />
          <StatCard label="High Risk"   value={stats.high}   accent="var(--high-color)"   />
          <StatCard label="Fraud Predictions" value={stats.fraud} accent="var(--high-color)" />
        </div>
      )}

      {/* Table or empty state */}
      {history.length === 0 ? (
        <EmptyReports />
      ) : (
        <div className="card report-table-card">
          <div className="report-table-header">
            <div className="card-header-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <div>
              <h3 className="card-title">Recent Analyses</h3>
              <p className="card-subtitle">{history.length} record{history.length !== 1 ? 's' : ''} · newest first</p>
            </div>
          </div>

          <div className="report-table-wrap">
            <table className="report-table" aria-label="Analysis history">
              <thead>
                <tr>
                  <th>Date / Time</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Risk Level</th>
                  <th>Risk Score</th>
                  <th>Fraud Prob.</th>
                  <th>Decision</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((rec) => {
                  const style = getRiskStyling(rec.risk_level);
                  return (
                    <tr key={rec.id} className="report-table-row">
                      <td className="report-td-time">
                        {formatTimestamp(rec.timestamp)}
                      </td>
                      <td className="report-td-mono">
                        ₹{fmt2(rec.transaction?.amount)}
                      </td>
                      <td>{formatCategory(rec.transaction?.category)}</td>
                      <td>
                        <RiskPill level={rec.risk_level} />
                      </td>
                      <td className={`report-td-mono ${style.accent}`}>
                        {fmt2(rec.risk_score)}
                      </td>
                      <td className={`report-td-mono ${style.accent}`}>
                        {fmtPct(rec.fraud_probability)}
                      </td>
                      <td>
                        <span className={`report-decision ${rec.ml_decision === 'FRAUD' ? 'decision-fraud' : 'decision-legit'}`}>
                          {rec.ml_decision || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`report-action action-${(rec.recommended_action || '').toLowerCase()}`}>
                          {rec.recommended_action || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
