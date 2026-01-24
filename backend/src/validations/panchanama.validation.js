const Joi = require('joi');

const createPanchanama = {
    body: Joi.object().keys({
        lossReport: Joi.string().required(),
        siteVisit: Joi.object().keys({
            scheduledDate: Joi.date().required(),
            actualDate: Joi.date().allow('', null),
            startTime: Joi.string().allow('', null),
            endTime: Joi.string().allow('', null),
            gpsCoordinates: Joi.object().keys({
                latitude: Joi.number().allow(null),
                longitude: Joi.number().allow(null),
            }).allow(null),
        }).required(),
        landDetails: Joi.object().keys({
            surveyNumber: Joi.string().allow('', null),
            gutNumber: Joi.string().allow('', null),
            area: Joi.number().allow('', null),
            areaUnit: Joi.string().valid('hectare', 'acre', 'guntha'),
        }),
        cropDetails: Joi.object().keys({
            cropType: Joi.string().allow('', null),
            variety: Joi.string().allow('', null),
            sowingDate: Joi.date().allow('', null),
            expectedYield: Joi.number().allow('', null),
            actualCondition: Joi.string().allow('', null),
        }),
        damageAssessment: Joi.object().keys({
            causeOfDamage: Joi.string().valid('drought', 'flood', 'pest', 'disease', 'hailstorm', 'unseasonal_rain', 'fire', 'other'),
            damagePercentage: Joi.number().min(0).max(100),
            affectedArea: Joi.number(),
            severityLevel: Joi.string().valid('mild', 'moderate', 'severe', 'total'),
            detailedObservation: Joi.string().allow('', null),
        }),
        officerRemarks: Joi.string().allow('', null),
        recommendation: Joi.string().valid('approve', 'partial_approve', 'reject', 'further_investigation'),
        recommendedAmount: Joi.number().allow('', null),
    }),
};

const updatePanchanama = {
    params: Joi.object().keys({
        panchanamaId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        siteVisit: Joi.object().keys({
            actualDate: Joi.date(),
            startTime: Joi.string(),
            endTime: Joi.string(),
            gpsCoordinates: Joi.object().keys({
                latitude: Joi.number(),
                longitude: Joi.number(),
            }),
        }),
        damageAssessment: Joi.object().keys({
            causeOfDamage: Joi.string().valid('drought', 'flood', 'pest', 'disease', 'hailstorm', 'unseasonal_rain', 'fire', 'other'),
            damagePercentage: Joi.number().min(0).max(100),
            affectedArea: Joi.number(),
            severityLevel: Joi.string().valid('mild', 'moderate', 'severe', 'total'),
            detailedObservation: Joi.string(),
        }),
        photos: Joi.array().items(
            Joi.object().keys({
                url: Joi.string(),
                caption: Joi.string(),
                gpsCoordinates: Joi.object().keys({
                    latitude: Joi.number(),
                    longitude: Joi.number(),
                }),
                capturedAt: Joi.date(),
            })
        ),
        witnesses: Joi.array().items(
            Joi.object().keys({
                name: Joi.string(),
                designation: Joi.string(),
                contact: Joi.string(),
            })
        ),
        officerRemarks: Joi.string(),
        recommendation: Joi.string().valid('approve', 'partial_approve', 'reject', 'further_investigation'),
        recommendedAmount: Joi.number(),
        officerSignature: Joi.string(),
        farmerSignature: Joi.string(),
    }),
};

const submitPanchanama = {
    params: Joi.object().keys({
        panchanamaId: Joi.string().required(),
    }),
};

const reviewPanchanama = {
    params: Joi.object().keys({
        panchanamaId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        decision: Joi.string().valid('approved', 'rejected').required(),
        remarks: Joi.string().required(),
    }),
};

const getPanchanamas = {
    query: Joi.object().keys({
        status: Joi.string().valid('draft', 'submitted', 'reviewed', 'approved', 'rejected'),
        farmer: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

module.exports = {
    createPanchanama,
    updatePanchanama,
    submitPanchanama,
    reviewPanchanama,
    getPanchanamas,
};
