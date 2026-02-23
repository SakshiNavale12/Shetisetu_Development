const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createLossReport = {
    body: Joi.object().keys({
        landParcel: Joi.object().keys({
            surveyNumber: Joi.string().required(),
            gutNumber: Joi.string(),
            area: Joi.number().required().positive(),
            unit: Joi.string().valid('hectare', 'are', 'guntha', 'acre'),
        }).required(),
        cropSurvey: Joi.string().custom(objectId),
        cropName: Joi.string().required().max(100),
        cropType: Joi.string().valid('cereals', 'pulses', 'oilseeds', 'vegetables', 'fruits', 'sugarcane', 'cotton', 'other'),
        lossType: Joi.string().valid('drought', 'flood', 'hailstorm', 'pest', 'disease', 'unseasonal_rain', 'frost', 'fire', 'other').required(),
        lossDate: Joi.date().required(),
        affectedArea: Joi.number().required().positive(),
        affectedAreaUnit: Joi.string().valid('hectare', 'are', 'guntha', 'acre'),
        damagePercentage: Joi.number().required().min(0).max(100),
        estimatedLoss: Joi.number().min(0),
        photos: Joi.array().items(
            Joi.object().keys({
                url: Joi.string().required(),           // relative path, not a full URI
                type: Joi.string().valid('damage', 'field', 'evidence'),
                caption: Joi.string().allow('').max(200), // allow empty string
                geoLocation: Joi.object().keys({
                    latitude: Joi.number().min(-90).max(90),
                    longitude: Joi.number().min(-180).max(180),
                    accuracy: Joi.number().min(0),
                }).allow(null),
                capturedAt: Joi.date(),               // sent by the uploader
            })
        ),
        fieldLocation: Joi.object().keys({
            latitude: Joi.number().min(-90).max(90),
            longitude: Joi.number().min(-180).max(180),
            accuracy: Joi.number().positive(),
        }),
        description: Joi.string().max(1000),
    }),
};

const updateLossReport = {
    params: Joi.object().keys({
        reportId: Joi.string().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            cropName: Joi.string().max(100),
            affectedArea: Joi.number().positive(),
            damagePercentage: Joi.number().min(0).max(100),
            estimatedLoss: Joi.number().min(0),
            photos: Joi.array().items(
                Joi.object().keys({
                    url: Joi.string().required(),
                    type: Joi.string().valid('damage', 'field', 'evidence'),
                    caption: Joi.string().allow('').max(200),
                    geoLocation: Joi.object().keys({
                        latitude: Joi.number().min(-90).max(90),
                        longitude: Joi.number().min(-180).max(180),
                        accuracy: Joi.number().min(0),
                    }).allow(null),
                    capturedAt: Joi.date(),
                })
            ),
            description: Joi.string().max(1000),
        })
        .min(1),
};

const getReport = {
    params: Joi.object().keys({
        reportId: Joi.string().custom(objectId),
    }),
};

const getMyReports = {
    query: Joi.object().keys({
        lossType: Joi.string(),
        status: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const queryReports = {
    query: Joi.object().keys({
        lossType: Joi.string(),
        status: Joi.string(),
        district: Joi.string(),
        taluka: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const updateReportStatus = {
    params: Joi.object().keys({
        reportId: Joi.string().custom(objectId),
    }),
    body: Joi.object().keys({
        status: Joi.string().valid('under_review', 'site_visit_scheduled', 'verified', 'approved', 'rejected', 'compensation_processed').required(),
        remarks: Joi.string().max(500),
        siteVisitDate: Joi.date(),
        siteVisitNotes: Joi.string().max(500),
        approvedAmount: Joi.number().min(0),
    }),
};

const deleteReport = {
    params: Joi.object().keys({
        reportId: Joi.string().custom(objectId),
    }),
};

module.exports = {
    createLossReport,
    updateLossReport,
    getReport,
    getMyReports,
    queryReports,
    updateReportStatus,
    deleteReport,
};
