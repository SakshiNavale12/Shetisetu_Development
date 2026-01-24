const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { lossReportService } = require('../services');
const pick = require('../utils/pick');

const createLossReport = catchAsync(async (req, res) => {
    const report = await lossReportService.createLossReport(req.user.id, req.body);
    res.status(httpStatus.CREATED).send(report);
});

const getMyReports = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['lossType', 'status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await lossReportService.getLossReportsByUser(req.user.id, filter, options);
    res.send(result);
});

const getReport = catchAsync(async (req, res) => {
    const report = await lossReportService.getLossReportById(req.params.reportId);
    if (!report) {
        res.status(httpStatus.NOT_FOUND).send({ message: 'Report not found' });
        return;
    }
    res.send(report);
});

const updateReport = catchAsync(async (req, res) => {
    const report = await lossReportService.updateLossReport(req.params.reportId, req.user.id, req.body);
    res.send(report);
});

const deleteReport = catchAsync(async (req, res) => {
    await lossReportService.deleteLossReport(req.params.reportId, req.user.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const queryReports = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['lossType', 'status', 'district', 'taluka']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await lossReportService.queryLossReports(filter, options);
    res.send(result);
});

const updateReportStatus = catchAsync(async (req, res) => {
    const report = await lossReportService.updateLossReportStatus(
        req.params.reportId,
        req.user.id,
        req.body.status,
        {
            verificationRemarks: req.body.remarks,
            siteVisitDate: req.body.siteVisitDate,
            siteVisitNotes: req.body.siteVisitNotes,
            approvedAmount: req.body.approvedAmount,
        }
    );
    res.send(report);
});

const getStats = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['district', 'taluka', 'lossType']);
    const stats = await lossReportService.getLossReportStats(filter);
    res.send(stats);
});

module.exports = {
    createLossReport,
    getMyReports,
    getReport,
    updateReport,
    deleteReport,
    queryReports,
    updateReportStatus,
    getStats,
};
