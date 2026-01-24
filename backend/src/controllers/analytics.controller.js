const catchAsync = require('../utils/catchAsync');
const { analyticsService } = require('../services');

const getDistrictStats = catchAsync(async (req, res) => {
    const stats = await analyticsService.getDistrictStats();
    res.send(stats);
});

const getCompensationTrends = catchAsync(async (req, res) => {
    const trends = await analyticsService.getCompensationTrends();
    res.send(trends);
});

const getOfficerPerformance = catchAsync(async (req, res) => {
    const performance = await analyticsService.getOfficerPerformance();
    res.send(performance);
});

const getDashboardOverview = catchAsync(async (req, res) => {
    const overview = await analyticsService.getDashboardOverview();
    res.send(overview);
});

module.exports = {
    getDistrictStats,
    getCompensationTrends,
    getOfficerPerformance,
    getDashboardOverview
};
