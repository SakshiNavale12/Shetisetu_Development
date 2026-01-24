const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { panchanamaService } = require('../services');
const pick = require('../utils/pick');

const createPanchanama = catchAsync(async (req, res) => {
    const panchanama = await panchanamaService.createPanchanama(req.user.id, req.body);
    res.status(httpStatus.CREATED).send(panchanama);
});

const getPanchanamas = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['status', 'farmer']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await panchanamaService.getPanchanamasByOfficer(req.user.id, filter, options);
    res.send(result);
});

const getPanchanama = catchAsync(async (req, res) => {
    const panchanama = await panchanamaService.getPanchanamaById(req.params.panchanamaId);
    if (!panchanama) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Panchanama not found');
    }
    res.send(panchanama);
});

const updatePanchanama = catchAsync(async (req, res) => {
    const panchanama = await panchanamaService.updatePanchanama(req.params.panchanamaId, req.user.id, req.body);
    res.send(panchanama);
});

const submitPanchanama = catchAsync(async (req, res) => {
    const panchanama = await panchanamaService.submitPanchanama(req.params.panchanamaId, req.user.id);
    res.send(panchanama);
});

const reviewPanchanama = catchAsync(async (req, res) => {
    const panchanama = await panchanamaService.reviewPanchanama(
        req.params.panchanamaId,
        req.user.id,
        req.body.decision,
        req.body.remarks
    );
    res.send(panchanama);
});

const getOfficerStats = catchAsync(async (req, res) => {
    const stats = await panchanamaService.getOfficerStats(req.user.id);
    res.send(stats);
});

const getAllPanchanamas = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['status', 'officer', 'farmer']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await panchanamaService.queryPanchanamas(filter, options);
    res.send(result);
});

module.exports = {
    createPanchanama,
    getPanchanamas,
    getPanchanama,
    updatePanchanama,
    submitPanchanama,
    reviewPanchanama,
    getOfficerStats,
    getAllPanchanamas,
};
