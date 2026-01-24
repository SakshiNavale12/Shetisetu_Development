const httpStatus = require('http-status');
const { Panchanama, LossReport, Farmer } = require('../models');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notification.service');

/**
 * Create a panchanama
 * @param {ObjectId} officerId - The officer user ID
 * @param {Object} panchanamaBody - The panchanama data
 * @returns {Promise<Panchanama>}
 */
const createPanchanama = async (officerId, panchanamaBody) => {
    // Verify loss report exists
    const lossReport = await LossReport.findById(panchanamaBody.lossReport).populate('farmer');
    if (!lossReport) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Loss report not found');
    }

    // Check if farmer's eKYC is verified
    const farmer = await Farmer.findById(lossReport.farmer._id).populate('user');
    if (!farmer) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Farmer not found');
    }
    if (farmer.ekycStatus !== 'verified') {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            `Cannot create panchanama. Farmer's eKYC status is "${farmer.ekycStatus}". eKYC must be verified first.`
        );
    }

    // Generate case number
    const caseNumber = await Panchanama.generateCaseNumber();

    const panchanama = await Panchanama.create({
        ...panchanamaBody,
        officer: officerId,
        farmer: lossReport.farmer._id,
        caseNumber,
        status: 'draft',
    });

    // Update loss report status
    lossReport.status = 'site_visit_scheduled';
    lossReport.siteVisitDate = panchanamaBody.siteVisit?.scheduledDate;
    await lossReport.save();

    // Notify farmer
    if (farmer && farmer.user) {
        await notificationService.notifyUser(
            farmer.user._id,
            'system',
            'Site Visit Scheduled / साइट भेट नियोजित',
            `A site visit has been scheduled for your loss report on ${panchanamaBody.siteVisit?.scheduledDate?.toLocaleDateString() || 'soon'}.`,
            panchanama._id,
            'Panchanama'
        );
    }

    return panchanama;
};

/**
 * Get panchanama by ID
 * @param {ObjectId} panchanamaId
 * @returns {Promise<Panchanama>}
 */
const getPanchanamaById = async (panchanamaId) => {
    return Panchanama.findById(panchanamaId)
        .populate('lossReport')
        .populate('farmer')
        .populate('officer', 'name email')
        .populate('reviewedBy', 'name');
};

/**
 * Query panchanamas (for officers)
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryPanchanamas = async (filter, options) => {
    const panchanamas = await Panchanama.paginate(filter, {
        ...options,
        populate: 'lossReport farmer officer',
        sortBy: options.sortBy || 'createdAt:desc',
    });
    return panchanamas;
};

/**
 * Get panchanamas by officer
 * @param {ObjectId} officerId
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getPanchanamasByOfficer = async (officerId, filter = {}, options = {}) => {
    return queryPanchanamas({ officer: officerId, ...filter }, options);
};

/**
 * Update panchanama
 * @param {ObjectId} panchanamaId
 * @param {ObjectId} officerId
 * @param {Object} updateBody
 * @returns {Promise<Panchanama>}
 */
const updatePanchanama = async (panchanamaId, officerId, updateBody) => {
    const panchanama = await getPanchanamaById(panchanamaId);
    if (!panchanama) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Panchanama not found');
    }

    if (panchanama.officer._id.toString() !== officerId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You can only update your own panchanamas');
    }

    if (!['draft', 'submitted'].includes(panchanama.status)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update a reviewed panchanama');
    }

    Object.assign(panchanama, updateBody);
    await panchanama.save();
    return panchanama;
};

/**
 * Submit panchanama for review
 * @param {ObjectId} panchanamaId
 * @param {ObjectId} officerId
 * @returns {Promise<Panchanama>}
 */
const submitPanchanama = async (panchanamaId, officerId) => {
    const panchanama = await getPanchanamaById(panchanamaId);
    if (!panchanama) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Panchanama not found');
    }

    if (panchanama.officer._id.toString() !== officerId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You can only submit your own panchanamas');
    }

    if (panchanama.status !== 'draft') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Can only submit draft panchanamas');
    }

    panchanama.status = 'submitted';
    panchanama.submittedAt = new Date();
    panchanama.siteVisit.actualDate = new Date();
    await panchanama.save();

    // Update loss report
    const lossReport = await LossReport.findById(panchanama.lossReport);
    if (lossReport) {
        lossReport.status = 'under_review';
        await lossReport.save();
    }

    return panchanama;
};

/**
 * Review panchanama (for higher authority)
 * @param {ObjectId} panchanamaId
 * @param {ObjectId} reviewerId
 * @param {string} decision - 'approved' or 'rejected'
 * @param {string} remarks
 * @returns {Promise<Panchanama>}
 */
const reviewPanchanama = async (panchanamaId, reviewerId, decision, remarks) => {
    const panchanama = await getPanchanamaById(panchanamaId);
    if (!panchanama) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Panchanama not found');
    }

    if (panchanama.status !== 'submitted') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Can only review submitted panchanamas');
    }

    panchanama.status = decision;
    panchanama.reviewedBy = reviewerId;
    panchanama.reviewedAt = new Date();
    panchanama.reviewRemarks = remarks;
    await panchanama.save();

    // Update loss report based on panchanama decision
    const lossReport = await LossReport.findById(panchanama.lossReport);
    if (lossReport) {
        if (decision === 'approved') {
            lossReport.status = 'approved';
            lossReport.approvedAmount = panchanama.recommendedAmount;
        } else {
            lossReport.status = 'rejected';
        }
        lossReport.verifiedAt = new Date();
        lossReport.verificationRemarks = remarks;
        await lossReport.save();
    }

    // Notify farmer
    const farmer = await Farmer.findById(panchanama.farmer).populate('user');
    if (farmer && farmer.user) {
        const title = decision === 'approved'
            ? 'Claim Approved / दावा मंजूर'
            : 'Claim Rejected / दावा नाकारला';
        const message = decision === 'approved'
            ? `Your loss report has been approved. Compensation amount: ₹${panchanama.recommendedAmount}`
            : `Your loss report has been rejected. Remarks: ${remarks}`;

        await notificationService.notifyUser(
            farmer.user._id,
            'loss_report_verified',
            title,
            message,
            lossReport._id,
            'LossReport'
        );
    }

    return panchanama;
};

/**
 * Get officer dashboard stats
 * @param {ObjectId} officerId
 * @returns {Promise<Object>}
 */
const getOfficerStats = async (officerId) => {
    const stats = await Panchanama.aggregate([
        { $match: { officer: officerId } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const pendingReports = await LossReport.countDocuments({ status: 'submitted' });

    return {
        panchanamas: stats,
        pendingReports,
    };
};

module.exports = {
    createPanchanama,
    getPanchanamaById,
    queryPanchanamas,
    getPanchanamasByOfficer,
    updatePanchanama,
    submitPanchanama,
    reviewPanchanama,
    getOfficerStats,
};
