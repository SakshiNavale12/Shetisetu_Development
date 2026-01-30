const axios = require('axios');
const config = require('../config/config');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000/api/v1';

// Create axios client for ML service
const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Check ML service health
 * @returns {Promise<Object>}
 */
const healthCheck = async () => {
  try {
    const response = await mlClient.get('/health');
    return response.data;
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
};

/**
 * Predict crop yield
 * @param {Object} data - Crop survey data
 * @param {string} token - JWT token
 * @returns {Promise<Object>}
 */
const predictYield = async (data, token) => {
  try {
    const response = await mlClient.post('/predict/yield', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw handleMLError(error);
  }
};

/**
 * Assess cultivation risk
 * @param {Object} data - Risk assessment data
 * @param {string} token - JWT token
 * @returns {Promise<Object>}
 */
const assessRisk = async (data, token) => {
  try {
    const response = await mlClient.post('/predict/risk', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw handleMLError(error);
  }
};

/**
 * Predict loss probability
 * @param {Object} data - Loss report data
 * @param {string} token - JWT token
 * @returns {Promise<Object>}
 */
const predictLoss = async (data, token) => {
  try {
    const response = await mlClient.post('/predict/loss', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw handleMLError(error);
  }
};

/**
 * Handle ML service errors
 * @param {Error} error
 * @returns {Error}
 */
const handleMLError = (error) => {
  if (error.response) {
    // ML service returned an error response
    const message = error.response.data?.error || 'ML Service error';
    const err = new Error(message);
    err.statusCode = error.response.status;
    return err;
  }
  if (error.code === 'ECONNREFUSED') {
    const err = new Error('ML Service is unavailable. Please ensure the ML service is running.');
    err.statusCode = 503;
    return err;
  }
  if (error.code === 'ETIMEDOUT') {
    const err = new Error('ML Service request timed out');
    err.statusCode = 504;
    return err;
  }
  return error;
};

module.exports = {
  healthCheck,
  predictYield,
  assessRisk,
  predictLoss,
};
