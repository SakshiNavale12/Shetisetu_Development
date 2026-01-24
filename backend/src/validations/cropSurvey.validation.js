const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCropSurvey = {
    body: Joi.object().keys({
        landParcel: Joi.object().keys({
            surveyNumber: Joi.string().required(),
            gutNumber: Joi.string(),
            area: Joi.number().required().positive(),
            unit: Joi.string().valid('hectare', 'are', 'guntha', 'acre'),
        }).required(),
        season: Joi.string().valid('kharif', 'rabi', 'perennial', 'summer').required(),
        year: Joi.number().integer().min(2020).max(2030),
        cropName: Joi.string().required().max(100),
        cropNameLocal: Joi.string().max(100),
        cropType: Joi.string().valid('cereals', 'pulses', 'oilseeds', 'vegetables', 'fruits', 'sugarcane', 'cotton', 'other').required(),
        variety: Joi.string().max(100),
        seedType: Joi.string().valid('certified', 'truthful', 'farm_saved', 'hybrid'),
        cultivatedArea: Joi.number().required().positive(),
        cultivatedAreaUnit: Joi.string().valid('hectare', 'are', 'guntha', 'acre'),
        sowingDate: Joi.date().required(),
        expectedHarvestDate: Joi.date(),
        irrigationType: Joi.string().valid('rainfed', 'canal', 'well', 'borewell', 'drip', 'sprinkler', 'mixed').required(),
        photos: Joi.array().items(
            Joi.object().keys({
                url: Joi.string().required(),
                type: Joi.string().valid('crop', 'field', 'sowing', 'growth'),
                caption: Joi.string().max(200).allow(''),
                geoLocation: Joi.object().keys({
                    latitude: Joi.number().min(-90).max(90),
                    longitude: Joi.number().min(-180).max(180),
                    accuracy: Joi.number().positive(),
                }),
                capturedAt: Joi.date(),
            })
        ),
        fieldLocation: Joi.object().keys({
            latitude: Joi.number().min(-90).max(90),
            longitude: Joi.number().min(-180).max(180),
            accuracy: Joi.number().positive(),
        }),
        remarks: Joi.string().max(500),
    }),
};

const updateCropSurvey = {
    params: Joi.object().keys({
        surveyId: Joi.string().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            cropName: Joi.string().max(100),
            cropNameLocal: Joi.string().max(100),
            variety: Joi.string().max(100),
            cultivatedArea: Joi.number().positive(),
            expectedHarvestDate: Joi.date(),
            photos: Joi.array().items(
                Joi.object().keys({
                    url: Joi.string().required(),
                    type: Joi.string().valid('crop', 'field', 'sowing', 'growth'),
                    caption: Joi.string().max(200).allow(''),
                    geoLocation: Joi.object().keys({
                        latitude: Joi.number().min(-90).max(90),
                        longitude: Joi.number().min(-180).max(180),
                        accuracy: Joi.number().positive(),
                    }),
                    capturedAt: Joi.date(),
                })
            ),
            remarks: Joi.string().max(500),
        })
        .min(1),
};

const getSurvey = {
    params: Joi.object().keys({
        surveyId: Joi.string().custom(objectId),
    }),
};

const getMySurveys = {
    query: Joi.object().keys({
        season: Joi.string().valid('kharif', 'rabi', 'perennial', 'summer'),
        year: Joi.number().integer(),
        status: Joi.string().valid('draft', 'submitted', 'verified', 'rejected'),
        cropType: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const querySurveys = {
    query: Joi.object().keys({
        season: Joi.string(),
        year: Joi.number().integer(),
        status: Joi.string(),
        cropType: Joi.string(),
        district: Joi.string(),
        taluka: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const verifySurvey = {
    params: Joi.object().keys({
        surveyId: Joi.string().custom(objectId),
    }),
    body: Joi.object().keys({
        status: Joi.string().valid('verified', 'rejected').required(),
        remarks: Joi.string().max(500),
    }),
};

const deleteSurvey = {
    params: Joi.object().keys({
        surveyId: Joi.string().custom(objectId),
    }),
};

const addPhotos = {
    params: Joi.object().keys({
        surveyId: Joi.string().custom(objectId),
    }),
    body: Joi.object().keys({
        photos: Joi.array().items(
            Joi.object().keys({
                url: Joi.string().required(),
                type: Joi.string().valid('crop', 'field', 'sowing', 'growth'),
                caption: Joi.string().max(200).allow(''),
                geoLocation: Joi.object().keys({
                    latitude: Joi.number().min(-90).max(90),
                    longitude: Joi.number().min(-180).max(180),
                    accuracy: Joi.number().positive(),
                }),
                capturedAt: Joi.date(),
            })
        ).required().min(1),
    }),
};

module.exports = {
    createCropSurvey,
    updateCropSurvey,
    getSurvey,
    getMySurveys,
    querySurveys,
    verifySurvey,
    deleteSurvey,
    addPhotos,
};
