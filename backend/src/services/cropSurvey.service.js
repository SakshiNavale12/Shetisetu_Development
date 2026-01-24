const httpStatus = require('http-status');
const { CropSurvey, Farmer } = require('../models');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notification.service');

/**
 * Create a crop survey
 * @param {ObjectId} userId - The user ID
 * @param {Object} surveyBody - The survey data
 * @returns {Promise<CropSurvey>}
 */
const createCropSurvey = async (userId, surveyBody) => {
    // Get farmer profile
    const farmer = await Farmer.findOne({ user: userId });
    if (!farmer) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Please create your farmer profile first');
    }

    // Check for duplicate survey
    const year = surveyBody.year || new Date().getFullYear();
    if (await CropSurvey.hasDuplicateSurvey(farmer._id, surveyBody.landParcel.surveyNumber, surveyBody.season, year)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'A survey already exists for this land parcel in the same season');
    }

    return CropSurvey.create({
        ...surveyBody,
        farmer: farmer._id,
        year,
        status: 'submitted',
    });
};

/**
 * Get crop surveys by farmer (user ID)
 * @param {ObjectId} userId - The user ID
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getCropSurveysByUser = async (userId, filter = {}, options = {}) => {
    const farmer = await Farmer.findOne({ user: userId });
    if (!farmer) {
        return { results: [], page: 1, limit: 10, totalPages: 0, totalResults: 0 };
    }

    const surveys = await CropSurvey.paginate(
        { farmer: farmer._id, ...filter },
        { ...options, populate: 'farmer' }
    );
    return surveys;
};

/**
 * Get crop survey by ID
 * @param {ObjectId} surveyId - The survey ID
 * @returns {Promise<CropSurvey>}
 */
const getCropSurveyById = async (surveyId) => {
    return CropSurvey.findById(surveyId).populate('farmer').populate('verifiedBy', 'name');
};

/**
 * Update crop survey
 * @param {ObjectId} surveyId - The survey ID
 * @param {ObjectId} userId - The user ID (for authorization)
 * @param {Object} updateBody - The update data
 * @returns {Promise<CropSurvey>}
 */
const updateCropSurvey = async (surveyId, userId, updateBody) => {
    const survey = await getCropSurveyById(surveyId);
    if (!survey) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Survey not found');
    }

    // Check ownership
    const farmer = await Farmer.findOne({ user: userId });
    if (!farmer || survey.farmer._id.toString() !== farmer._id.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You can only update your own surveys');
    }

    // Can only update if status is draft or submitted
    if (!['draft', 'submitted'].includes(survey.status)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update a verified or rejected survey');
    }

    Object.assign(survey, updateBody);
    await survey.save();
    return survey;
};

/**
 * Delete crop survey
 * @param {ObjectId} surveyId - The survey ID
 * @param {ObjectId} userId - The user ID (for authorization)
 * @returns {Promise<CropSurvey>}
 */
const deleteCropSurvey = async (surveyId, userId) => {
    const survey = await getCropSurveyById(surveyId);
    if (!survey) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Survey not found');
    }

    const farmer = await Farmer.findOne({ user: userId });
    if (!farmer || survey.farmer._id.toString() !== farmer._id.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You can only delete your own surveys');
    }

    if (survey.status === 'verified') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete a verified survey');
    }

    await survey.remove();
    return survey;
};

/**
 * Query all crop surveys (for officers)
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryCropSurveys = async (filter, options) => {
    const surveys = await CropSurvey.paginate(filter, {
        ...options,
        populate: 'farmer verifiedBy',
    });
    return surveys;
};

/**
 * Verify crop survey (for officers)
 * @param {ObjectId} surveyId - The survey ID
 * @param {ObjectId} officerId - The officer user ID
 * @param {string} status - 'verified' or 'rejected'
 * @param {string} remarks - Verification remarks
 * @returns {Promise<CropSurvey>}
 */
const verifyCropSurvey = async (surveyId, officerId, status, remarks) => {
    const survey = await getCropSurveyById(surveyId);
    if (!survey) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Survey not found');
    }

    if (survey.status !== 'submitted') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Only submitted surveys can be verified');
    }

    survey.status = status;
    survey.verifiedBy = officerId;
    survey.verifiedAt = new Date();
    survey.verificationRemarks = remarks;
    await survey.save();

    // Send notification to farmer
    const farmer = await Farmer.findById(survey.farmer).populate('user');
    if (farmer && farmer.user) {
        const notificationType = status === 'verified' ? 'crop_survey_verified' : 'crop_survey_verified';
        const title = status === 'verified'
            ? 'Crop Survey Verified / पीक सर्वेक्षण सत्यापित'
            : 'Crop Survey Rejected / पीक सर्वेक्षण नाकारले';
        const message = status === 'verified'
            ? `Your crop survey for ${survey.cropType} has been verified by the officer.`
            : `Your crop survey for ${survey.cropType} has been rejected. Remarks: ${remarks}`;

        await notificationService.notifyUser(
            farmer.user._id,
            notificationType,
            title,
            message,
            survey._id,
            'CropSurvey'
        );
    }

    return survey;
};

/**
 * Add photos to existing crop survey (for periodic updates)
 * @param {ObjectId} surveyId - The survey ID
 * @param {ObjectId} userId - The user ID (for authorization)
 * @param {Array} photos - Array of photo objects to add
 * @returns {Promise<CropSurvey>}
 */
const addPhotos = async (surveyId, userId, photos) => {
    const survey = await getCropSurveyById(surveyId);
    if (!survey) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Survey not found');
    }

    // Check ownership
    const farmer = await Farmer.findOne({ user: userId });
    if (!farmer || survey.farmer._id.toString() !== farmer._id.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You can only add photos to your own surveys');
    }

    // Append new photos to existing photos array
    survey.photos = [...survey.photos, ...photos];
    await survey.save();

    return survey;
};

module.exports = {
    createCropSurvey,
    getCropSurveysByUser,
    getCropSurveyById,
    updateCropSurvey,
    deleteCropSurvey,
    queryCropSurveys,
    verifyCropSurvey,
    addPhotos,
};
