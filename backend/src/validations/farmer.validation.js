const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createFarmer = {
    body: Joi.object().keys({
        fullName: Joi.string().required().min(2).max(100),
        fatherName: Joi.string().max(100),
        dateOfBirth: Joi.date().max('now'),
        gender: Joi.string().valid('male', 'female', 'other'),
        division: Joi.string().max(100),
        district: Joi.string().required().max(100),
        taluka: Joi.string().required().max(100),
        village: Joi.string().required().max(100),
        bankName: Joi.string().max(100),
        accountNumber: Joi.string().pattern(/^\d{9,18}$/),
        ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
        accountHolderName: Joi.string().max(100),
        landParcels: Joi.array().items(
            Joi.object().keys({
                surveyNumber: Joi.string().required(),
                gutNumber: Joi.string(),
                area: Joi.number().required().min(0),
                unit: Joi.string().valid('hectare', 'are', 'guntha', 'acre'),
                ownershipType: Joi.string().valid('owned', 'leased', 'shared'),
            })
        ),
    }),
};

const updateFarmer = {
    body: Joi.object()
        .keys({
            fullName: Joi.string().min(2).max(100),
            fatherName: Joi.string().max(100),
            dateOfBirth: Joi.date().max('now'),
            gender: Joi.string().valid('male', 'female', 'other'),
            division: Joi.string().max(100),
            district: Joi.string().max(100),
            taluka: Joi.string().max(100),
            village: Joi.string().max(100),
            bankName: Joi.string().max(100),
            accountNumber: Joi.string().pattern(/^\d{9,18}$/),
            ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
            accountHolderName: Joi.string().max(100),
        })
        .min(1),
};

const getFarmer = {
    params: Joi.object().keys({
        farmerId: Joi.string().custom(objectId),
    }),
};

const queryFarmers = {
    query: Joi.object().keys({
        district: Joi.string(),
        taluka: Joi.string(),
        village: Joi.string(),
        documentsVerified: Joi.boolean(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const addLandParcel = {
    body: Joi.object().keys({
        surveyNumber: Joi.string().required(),
        gutNumber: Joi.string(),
        area: Joi.number().required().min(0),
        unit: Joi.string().valid('hectare', 'are', 'guntha', 'acre'),
        ownershipType: Joi.string().valid('owned', 'leased', 'shared'),
        leaseDocument: Joi.string().uri(),
    }),
};

const updateLandParcel = {
    params: Joi.object().keys({
        parcelId: Joi.string().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            surveyNumber: Joi.string(),
            gutNumber: Joi.string(),
            area: Joi.number().min(0),
            unit: Joi.string().valid('hectare', 'are', 'guntha', 'acre'),
            ownershipType: Joi.string().valid('owned', 'leased', 'shared'),
            leaseDocument: Joi.string().uri(),
        })
        .min(1),
};

const deleteLandParcel = {
    params: Joi.object().keys({
        parcelId: Joi.string().custom(objectId),
    }),
};

const updateEkyc = {
    params: Joi.object().keys({
        farmerId: Joi.string().custom(objectId),
    }),
    body: Joi.object().keys({
        status: Joi.string().valid('verified', 'rejected').required(),
        remarks: Joi.string().max(500),
    }),
};

module.exports = {
    createFarmer,
    updateFarmer,
    getFarmer,
    queryFarmers,
    addLandParcel,
    updateLandParcel,
    deleteLandParcel,
    updateEkyc,
};
