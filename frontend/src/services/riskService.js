import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Submit a transaction for risk assessment.
 * @param {Object} transactionData - The transaction payload (see API spec)
 * @returns {Promise<Object>} - The risk assessment response
 */
export const assessTransactionRisk = async (transactionData) => {
  const response = await apiClient.post('/api/v1/risk/predict', transactionData);
  return response.data;
};

/**
 * Check backend health / availability.
 * @returns {Promise<boolean>}
 */
export const checkBackendHealth = async () => {
  try {
    const res = await apiClient.get('/health', { timeout: 5000 });
    return res.status === 200;
  } catch {
    return false;
  }
};

export default apiClient;
