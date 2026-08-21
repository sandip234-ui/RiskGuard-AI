import React from 'react';

export const LoadingState = () => (
  <div className="state-container" role="status" aria-live="polite">
    <div className="loading-spinner-large" aria-hidden="true" />
    <h3 className="state-title">Analyzing Transaction</h3>
    <p className="state-body">
      Running XGBoost model and computing SHAP explanations…
    </p>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="state-container error-state" role="alert">
    <div className="error-icon" aria-hidden="true">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <h3 className="state-title error-title">Analysis Failed</h3>
    <p className="state-body error-body">
      {message || 'Unable to connect to RiskGuard-AI backend. Please ensure the server is running on port 8000.'}
    </p>
    {onRetry && (
      <button className="btn-retry" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);
