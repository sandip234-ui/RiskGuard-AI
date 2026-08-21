import React, { useState, useCallback } from 'react';
import TransactionForm from '../components/TransactionForm';
import RiskScoreCard from '../components/RiskScoreCard';
import { RiskFactors, ProtectiveFactors } from '../components/RiskFactors';
import ModelReasoning from '../components/ModelReasoning';
import TransactionSummary from '../components/TransactionSummary';
import { LoadingState, ErrorState } from '../components/States';
import { assessTransactionRisk } from '../services/riskService';
import { appendAnalysis } from '../services/historyService';


const STATUS = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

/**
 * Parses a friendly error message from an Axios error.
 */
const parseError = (err) => {
  if (!err.response) {
    return 'Unable to connect to RiskGuard-AI backend. Please ensure the FastAPI server is running at http://127.0.0.1:8000.';
  }
  const { status, data } = err.response;
  if (status === 422) {
    const detail = data?.detail;
    if (Array.isArray(detail)) {
      return `Validation Error: ${detail.map((d) => `${d.loc?.join('.')} — ${d.msg}`).join('; ')}`;
    }
    return 'Validation Error: The submitted data failed API validation. Check all field values.';
  }
  if (status === 500) {
    return 'Server Error: The RiskGuard-AI backend returned an internal error. Check the backend logs.';
  }
  return `API Error (${status}): ${data?.detail || data?.message || 'An unexpected error occurred.'}`;
};

const Dashboard = () => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [result, setResult] = useState(null);
  const [submittedTransaction, setSubmittedTransaction] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAnalyze = useCallback(async (payload) => {
    if (status === STATUS.LOADING) return; // prevent duplicate requests

    setStatus(STATUS.LOADING);
    setResult(null);
    setErrorMessage('');
    setSubmittedTransaction(payload);

    try {
      const data = await assessTransactionRisk(payload);
      setResult(data);
      setStatus(STATUS.SUCCESS);
      // Persist to history
      appendAnalysis(payload, data);

      // Scroll to results after a brief render delay
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (err) {
      console.error('RiskGuard API Error:', err);
      setErrorMessage(parseError(err));
      setStatus(STATUS.ERROR);
    }
  }, [status]);

  const handleRetry = useCallback(() => {
    if (submittedTransaction) {
      handleAnalyze(submittedTransaction);
    } else {
      setStatus(STATUS.IDLE);
    }
  }, [submittedTransaction, handleAnalyze]);

  return (
    <main className="dashboard">
      {/* Form Section */}
      <section className="dashboard-form-section" aria-label="Transaction input">
        <TransactionForm
          onSubmit={handleAnalyze}
          isLoading={status === STATUS.LOADING}
        />
      </section>

      {/* Results Section */}
      <section
        id="results-section"
        className="dashboard-results-section"
        aria-label="Risk analysis results"
        aria-live="polite"
      >
        {status === STATUS.IDLE && (
          <div className="idle-placeholder">
            <div className="idle-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 className="idle-title">No Analysis Yet</h3>
            <p className="idle-body">
              Fill in the transaction details on the left and click{' '}
              <strong>Analyze Transaction</strong> to run the XGBoost risk model.
            </p>
          </div>
        )}

        {status === STATUS.LOADING && <LoadingState />}

        {status === STATUS.ERROR && (
          <ErrorState message={errorMessage} onRetry={handleRetry} />
        )}

        {status === STATUS.SUCCESS && result && (
          <div className="results-stack">
            {/* Primary risk card */}
            <RiskScoreCard result={result} />

            {/* SHAP factors side by side */}
            <div className="factors-row">
              <RiskFactors factors={result.key_risk_factors} />
              <ProtectiveFactors factors={result.protective_factors} />
            </div>

            {/* Model reasoning */}
            <ModelReasoning reasoning={result.reasoning} aiExplanation={result.ai_explanation} />

            {/* Transaction summary */}
            <TransactionSummary transaction={submittedTransaction} />
          </div>
        )}
      </section>
    </main>
  );
};

export default Dashboard;
