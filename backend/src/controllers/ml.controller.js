const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { mlService } = require('../services');
const ApiError = require('../utils/ApiError');

/**
 * Get ML service health status
 */
const healthCheck = catchAsync(async (req, res) => {
  const result = await mlService.healthCheck();
  res.send(result);
});

/**
 * Predict crop yield
 */
const predictYield = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const result = await mlService.predictYield(req.body, token);

  if (!result.success) {
    throw new ApiError(httpStatus.BAD_REQUEST, result.error);
  }

  res.send(result);
});

/**
 * Assess cultivation risk
 */
const assessRisk = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const result = await mlService.assessRisk(req.body, token);

  if (!result.success) {
    throw new ApiError(httpStatus.BAD_REQUEST, result.error);
  }

  res.send(result);
});

/**
 * Predict loss probability
 */
const predictLoss = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const result = await mlService.predictLoss(req.body, token);

  if (!result.success) {
    throw new ApiError(httpStatus.BAD_REQUEST, result.error);
  }

  res.send(result);
});

module.exports = {
  healthCheck,
  predictYield,
  assessRisk,
  predictLoss,
};
