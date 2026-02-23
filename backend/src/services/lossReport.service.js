const httpStatus = require('http-status');
const { LossReport, Farmer } = require('../models');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notification.service');

/**
 * Create a loss report
 * @param {ObjectId} userId - The user ID
 * @param {Object} reportBody - The report data
 * @returns {Promise<LossReport>}
 */
const createLossReport = async (userId, reportBody) => {
    // Get farmer profile
    const farmer = await Farmer.findOne({ user: userId });
    if (!farmer) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Please create your farmer profile first');
    }

    // Strip UI-only geoVerification field from each photo before persisting
    const sanitisedPhotos = Array.isArray(reportBody.photos)
        ? reportBody.photos.map(({ geoVerification, ...rest }) => rest)
        : undefined;

    return LossReport.create({
        ...reportBody,
        ...(sanitisedPhotos !== undefined ? { photos: sanitisedPhotos } : {}),
        farmer: farmer._id,
        status: 'submitted',
        dateReported: new Date(),
    });
};

/**
 * Get loss reports by farmer (user ID)
 * @param {ObjectId} userId - The user ID
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getLossReportsByUser = async (userId, filter = {}, options = {}) => {
    const farmer = await Farmer.findOne({ user: userId });
    if (!farmer) {
        return { results: [], page: 1, limit: 10, totalPages: 0, totalResults: 0 };
    }

    const reports = await LossReport.paginate(
        { farmer: farmer._id, ...filter },
        { ...options, populate: 'farmer cropSurvey', sortBy: 'createdAt:desc' }
    );
    return reports;
};

/**
 * Get loss report by ID
 * @param {ObjectId} reportId - The report ID
 * @returns {Promise<LossReport>}
 */
const getLossReportById = async (reportId) => {
    return LossReport.findById(reportId)
        .populate('farmer')
        .populate('cropSurvey')
        .populate('verifiedBy', 'name');
};

/**
 * Update loss report
 * @param {ObjectId} reportId - The report ID
 * @param {ObjectId} userId - The user ID (for authorization)
 * @param {Object} updateBody - The update data
 * @returns {Promise<LossReport>}
 */
const updateLossReport = async (reportId, userId, updateBody) => {
    const report = await getLossReportById(reportId);
    if (!report) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Loss report not found');
    }

    // Check ownership
    const farmer = await Farmer.findOne({ user: userId });
    if (!farmer || report.farmer._id.toString() !== farmer._id.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You can only update your own reports');
    }

    // Can only update if status is draft or submitted
    if (!['draft', 'submitted'].includes(report.status)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update a report under review or processed');
    }

    Object.assign(report, updateBody);
    await report.save();
    return report;
};

/**
 * Delete loss report
 * @param {ObjectId} reportId - The report ID
 * @param {ObjectId} userId - The user ID (for authorization)
 * @returns {Promise<LossReport>}
 */
const deleteLossReport = async (reportId, userId) => {
    const report = await getLossReportById(reportId);
    if (!report) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Loss report not found');
    }

    const farmer = await Farmer.findOne({ user: userId });
    if (!farmer || report.farmer._id.toString() !== farmer._id.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You can only delete your own reports');
    }

    if (!['draft', 'submitted'].includes(report.status)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete a report under review or processed');
    }

    await report.remove();
    return report;
};

/**
 * Query all loss reports (for officers)
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryLossReports = async (filter, options) => {
    const reports = await LossReport.paginate(filter, {
        ...options,
        populate: 'farmer verifiedBy',
        sortBy: options.sortBy || 'createdAt:desc',
    });
    return reports;
};

/**
 * Update loss report status (for officers)
 * @param {ObjectId} reportId - The report ID
 * @param {ObjectId} officerId - The officer user ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional fields to update
 * @returns {Promise<LossReport>}
 */
const updateLossReportStatus = async (reportId, officerId, status, additionalData = {}) => {
    const report = await getLossReportById(reportId);
    if (!report) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Loss report not found');
    }

    report.status = status;

    if (['verified', 'approved', 'rejected'].includes(status)) {
        report.verifiedBy = officerId;
        report.verifiedAt = new Date();
    }

    if (additionalData.verificationRemarks) {
        report.verificationRemarks = additionalData.verificationRemarks;
    }
    if (additionalData.siteVisitDate) {
        report.siteVisitDate = additionalData.siteVisitDate;
    }
    if (additionalData.siteVisitNotes) {
        report.siteVisitNotes = additionalData.siteVisitNotes;
    }
    if (additionalData.approvedAmount !== undefined) {
        report.approvedAmount = additionalData.approvedAmount;
    }

    await report.save();

    // Send notification to farmer
    const farmer = await Farmer.findById(report.farmer).populate('user');
    if (farmer && farmer.user) {
        let title, message, notificationType;

        if (status === 'verified' || status === 'approved') {
            notificationType = 'loss_report_verified';
            title = 'Loss Report Approved / नुकसान अहवाल मंजूर';
            message = `Your loss report has been ${status}. ${additionalData.verificationRemarks || ''}`;
        } else if (status === 'rejected') {
            notificationType = 'loss_report_verified';
            title = 'Loss Report Rejected / नुकसान अहवाल नाकारला';
            message = `Your loss report has been rejected. Remarks: ${additionalData.verificationRemarks || 'No remarks'}`;
        } else if (status === 'site_visit_scheduled') {
            notificationType = 'system';
            title = 'Site Visit Scheduled / साइट भेट नियोजित';
            message = `A site visit has been scheduled for your loss report on ${additionalData.siteVisitDate || 'soon'}.`;
        } else if (status === 'payment_processed') {
            notificationType = 'payment_status';
            title = 'Payment Processed / पेमेंट प्रक्रिया पूर्ण';
            message = `Your compensation of ₹${additionalData.approvedAmount} has been processed.`;
        }

        if (notificationType) {
            await notificationService.notifyUser(
                farmer.user._id,
                notificationType,
                title,
                message,
                report._id,
                'LossReport'
            );
        }
    }

    return report;
};

/**
 * Get loss report statistics
 * @param {Object} filter - Optional filter
 * @returns {Promise<Object>}
 */
const getLossReportStats = async (filter = {}) => {
    const stats = await LossReport.aggregate([
        { $match: filter },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAffectedArea: { $sum: '$affectedArea' },
                totalEstimatedLoss: { $sum: '$estimatedLoss' },
            },
        },
    ]);

    const byLossType = await LossReport.aggregate([
        { $match: filter },
        {
            $group: {
                _id: '$lossType',
                count: { $sum: 1 },
                totalAffectedArea: { $sum: '$affectedArea' },
            },
        },
    ]);

    return { byStatus: stats, byLossType };
};

module.exports = {
    createLossReport,
    getLossReportsByUser,
    getLossReportById,
    updateLossReport,
    deleteLossReport,
    queryLossReports,
    updateLossReportStatus,
    getLossReportStats,
};
