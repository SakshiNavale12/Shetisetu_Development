const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 upload requests per 15 minutes
  message: 'Too many upload requests, please try again later',
  skipSuccessfulRequests: false,
});

module.exports = {
  authLimiter,
  uploadLimiter,
};
