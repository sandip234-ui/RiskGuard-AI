import React from 'react';
import { formatFactorName } from '../utils/formatters';

const FactorItem = ({ name, type }) => {
  const isRisk = type === 'risk';
  return (
    <li className={`factor-item ${isRisk ? 'factor-risk' : 'factor-protective'}`}>
      <span className={`factor-icon ${isRisk ? 'factor-icon-risk' : 'factor-icon-safe'}`} aria-hidden="true">
        {isRisk ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </span>
      <span className="factor-name">{formatFactorName(name)}</span>
      <span className="factor-raw-name">{name}</span>
    </li>
  );
};

const EmptyFactors = ({ label }) => (
  <li className="factor-empty">
    <span className="factor-empty-icon" aria-hidden="true">—</span>
    <span>No {label.toLowerCase()} detected</span>
  </li>
);

/**
 * Displays the SHAP key_risk_factors list.
 */
export const RiskFactors = ({ factors = [] }) => (
  <div className="card factors-card">
    <div className="card-header">
      <div className="card-header-icon factor-header-risk">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div>
        <h3 className="card-title">Risk Factors</h3>
        <p className="card-subtitle">SHAP features increasing fraud likelihood</p>
      </div>
    </div>
    <ul className="factor-list">
      {factors.length > 0
        ? factors.map((f, i) => <FactorItem key={`${f}-${i}`} name={f} type="risk" />)
        : <EmptyFactors label="Risk Factors" />}
    </ul>
  </div>
);

/**
 * Displays the SHAP protective_factors list.
 */
export const ProtectiveFactors = ({ factors = [] }) => (
  <div className="card factors-card">
    <div className="card-header">
      <div className="card-header-icon factor-header-safe">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      </div>
      <div>
        <h3 className="card-title">Protective Factors</h3>
        <p className="card-subtitle">SHAP features reducing fraud likelihood</p>
      </div>
    </div>
    <ul className="factor-list">
      {factors.length > 0
        ? factors.map((f, i) => <FactorItem key={`${f}-${i}`} name={f} type="protective" />)
        : <EmptyFactors label="Protective Factors" />}
    </ul>
  </div>
);
