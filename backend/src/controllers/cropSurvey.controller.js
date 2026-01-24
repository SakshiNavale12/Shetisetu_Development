const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { cropSurveyService } = require('../services');
const pick = require('../utils/pick');

const createCropSurvey = catchAsync(async (req, res) => {
    const survey = await cropSurveyService.createCropSurvey(req.user.id, req.body);
    res.status(httpStatus.CREATED).send(survey);
});

const getMySurveys = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['season', 'year', 'status', 'cropType']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await cropSurveyService.getCropSurveysByUser(req.user.id, filter, options);
    res.send(result);
});

const getSurvey = catchAsync(async (req, res) => {
    const survey = await cropSurveyService.getCropSurveyById(req.params.surveyId);
    if (!survey) {
        res.status(httpStatus.NOT_FOUND).send({ message: 'Survey not found' });
        return;
    }
    res.send(survey);
});

const updateSurvey = catchAsync(async (req, res) => {
    const survey = await cropSurveyService.updateCropSurvey(req.params.surveyId, req.user.id, req.body);
    res.send(survey);
});

const deleteSurvey = catchAsync(async (req, res) => {
    await cropSurveyService.deleteCropSurvey(req.params.surveyId, req.user.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const querySurveys = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['season', 'year', 'status', 'cropType', 'district', 'taluka']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await cropSurveyService.queryCropSurveys(filter, options);
    res.send(result);
});

const verifySurvey = catchAsync(async (req, res) => {
    const survey = await cropSurveyService.verifyCropSurvey(
        req.params.surveyId,
        req.user.id,
        req.body.status,
        req.body.remarks
    );
    res.send(survey);
});

const addPhotosToSurvey = catchAsync(async (req, res) => {
    const survey = await cropSurveyService.addPhotos(
        req.params.surveyId,
        req.user.id,
        req.body.photos
    );
    res.send(survey);
});

module.exports = {
    createCropSurvey,
    getMySurveys,
    getSurvey,
    updateSurvey,
    deleteSurvey,
    querySurveys,
    verifySurvey,
    addPhotosToSurvey,
};
