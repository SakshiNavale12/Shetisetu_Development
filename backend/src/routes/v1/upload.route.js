const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { uploadValidation } = require('../../validations');
const uploadController = require('../../controllers/upload.controller');
const { uploadSingle, uploadMultiple } = require('../../middlewares/upload');
const { uploadLimiter } = require('../../middlewares/rateLimiter');

const router = express.Router();

// Crop survey photo uploads
router.post(
  '/crop-surveys',
  uploadLimiter,
  auth('submitCropSurvey'),
  uploadMultiple('photos', 50),
  validate(uploadValidation.uploadCropSurveyPhotos),
  uploadController.uploadCropSurveyPhotos
);

// Loss report photo uploads
router.post(
  '/loss-reports',
  uploadLimiter,
  auth('submitLossReport'),
  uploadMultiple('photos', 50),
  validate(uploadValidation.uploadLossReportPhotos),
  uploadController.uploadLossReportPhotos
);

// Document uploads
router.post(
  '/documents',
  uploadLimiter,
  auth('viewOwnProfile'),
  uploadSingle('document'),
  validate(uploadValidation.uploadDocuments),
  uploadController.uploadDocuments
);

module.exports = router;
