const Joi = require('joi');

const uploadCropSurveyPhotos = {
  body: Joi.object().keys({
    gpsData: Joi.string().optional(), // JSON string of {latitude, longitude, accuracy}
    // Dynamic fields for each photo
    type_0: Joi.string().valid('crop', 'field', 'sowing', 'growth').optional(),
    caption_0: Joi.string().max(200).optional(),
    type_1: Joi.string().valid('crop', 'field', 'sowing', 'growth').optional(),
    caption_1: Joi.string().max(200).optional(),
    type_2: Joi.string().valid('crop', 'field', 'sowing', 'growth').optional(),
    caption_2: Joi.string().max(200).optional(),
    type_3: Joi.string().valid('crop', 'field', 'sowing', 'growth').optional(),
    caption_3: Joi.string().max(200).optional(),
    type_4: Joi.string().valid('crop', 'field', 'sowing', 'growth').optional(),
    caption_4: Joi.string().max(200).optional(),
  }).unknown(true), // Allow additional type_* and caption_* fields
};

const uploadLossReportPhotos = {
  body: Joi.object().keys({
    reportId: Joi.string().optional(),
    gpsData: Joi.string().optional(),
    type_0: Joi.string().valid('damage', 'field', 'evidence').optional(),
    caption_0: Joi.string().max(200).optional(),
    type_1: Joi.string().valid('damage', 'field', 'evidence').optional(),
    caption_1: Joi.string().max(200).optional(),
    type_2: Joi.string().valid('damage', 'field', 'evidence').optional(),
    caption_2: Joi.string().max(200).optional(),
    type_3: Joi.string().valid('damage', 'field', 'evidence').optional(),
    caption_3: Joi.string().max(200).optional(),
    type_4: Joi.string().valid('damage', 'field', 'evidence').optional(),
    caption_4: Joi.string().max(200).optional(),
  }).unknown(true),
};

const uploadDocuments = {
  body: Joi.object().keys({
    documentType: Joi.string().valid('aadhaar', 'pan', '7-12', '8-A', 'lease', 'passbook').required(),
  }),
};

module.exports = {
  uploadCropSurveyPhotos,
  uploadLossReportPhotos,
  uploadDocuments,
};
