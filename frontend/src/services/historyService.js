/**
 * historyService.js
 * Manages analysis history in localStorage.
 * Key: riskguard_analysis_history
 * Value: JSON array of AnalysisRecord objects.
 */

const STORAGE_KEY = 'riskguard_analysis_history';
const MAX_RECORDS = 200; // cap to avoid unbounded growth

/**
 * @typedef {Object} AnalysisRecord
 * @property {string}  id                  - Unique record ID
 * @property {string}  timestamp           - ISO 8601 timestamp
 * @property {Object}  transaction         - The submitted transaction payload
 * @property {number}  risk_score
 * @property {number}  fraud_probability
 * @property {string}  risk_level          - LOW | MEDIUM | HIGH
 * @property {string}  ml_decision         - LEGITIMATE | FRAUD
 * @property {string}  recommended_action  - ALLOW | REVIEW | BLOCK
 */

/**
 * Load the full history array from localStorage.
 * Returns [] on any parse error.
 * @returns {AnalysisRecord[]}
 */
export const loadHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Persist the history array to localStorage.
 * @param {AnalysisRecord[]} history
 */
const saveHistory = (history) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('RiskGuard: failed to persist history', e);
  }
};

/**
 * Append a new successful analysis to history.
 * @param {Object} transaction  - The submitted transaction payload
 * @param {Object} result       - The API response object
 * @returns {AnalysisRecord}    - The newly created record
 */
export const appendAnalysis = (transaction, result) => {
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    transaction,
    risk_score:          result.risk_score,
    fraud_probability:   result.fraud_probability,
    risk_level:          result.risk_level,
    ml_decision:         result.ml_decision,
    recommended_action:  result.recommended_action ?? result.action,
  };

  const current = loadHistory();
  const updated = [record, ...current].slice(0, MAX_RECORDS); // newest first
  saveHistory(updated);
  return record;
};

/**
 * Clear all history from localStorage.
 */
export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
};

/**
 * Compute summary statistics from a history array.
 * @param {AnalysisRecord[]} history
 */
export const computeStats = (history) => {
  const total = history.length;
  const low    = history.filter((r) => r.risk_level?.toUpperCase() === 'LOW').length;
  const medium = history.filter((r) => r.risk_level?.toUpperCase() === 'MEDIUM').length;
  const high   = history.filter((r) => r.risk_level?.toUpperCase() === 'HIGH').length;
  const fraud  = history.filter((r) => r.ml_decision?.toUpperCase() === 'FRAUD').length;

  return { total, low, medium, high, fraud };
};
