const { LossReport, Panchanama, User } = require('../models');

/**
 * Get district-wise loss statistics
 * @returns {Promise<Array>}
 */
const getDistrictStats = async () => {
    return LossReport.aggregate([
        {
            $lookup: {
                from: 'farmers',
                localField: 'farmer',
                foreignField: '_id',
                as: 'farmerData'
            }
        },
        { $unwind: '$farmerData' },
        {
            $group: {
                _id: '$farmerData.location.district',
                totalReports: { $sum: 1 },
                totalArea: { $sum: '$affectedArea' },
                pending: {
                    $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] }
                },
                approved: {
                    $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                },
                totalCompensation: { $sum: '$approvedAmount' }
            }
        },
        { $sort: { totalReports: -1 } }
    ]);
};

/**
 * Get compensation disbursement trends (monthly)
 * @returns {Promise<Array>}
 */
const getCompensationTrends = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return LossReport.aggregate([
        {
            $match: {
                status: 'approved',
                createdAt: { $gte: sixMonthsAgo }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                amount: { $sum: '$approvedAmount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
};

/**
 * Get officer performance metrics
 * @returns {Promise<Array>}
 */
const getOfficerPerformance = async () => {
    return Panchanama.aggregate([
        { $match: { status: { $ne: 'draft' } } },
        {
            $group: {
                _id: '$officer',
                totalInspections: { $sum: 1 },
                avgProcessingTime: {
                    $avg: { $subtract: ['$createdAt', '$submittedAt'] }
                },
                approvedRate: {
                    $avg: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'officerDetails'
            }
        },
        { $unwind: '$officerDetails' },
        {
            $project: {
                name: '$officerDetails.name',
                totalInspections: 1,
                approvedRate: { $multiply: ['$approvedRate', 100] }
            }
        }
    ]);
};

/**
 * Get overview counts for authority dashboard
 * @returns {Promise<Object>}
 */
const getDashboardOverview = async () => {
    const [farmers, reports, panchanamas, approvedAmount] = await Promise.all([
        User.countDocuments({ role: 'farmer' }),
        LossReport.countDocuments(),
        Panchanama.countDocuments({ status: { $ne: 'draft' } }),
        LossReport.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$approvedAmount' } } }
        ])
    ]);

    return {
        farmers,
        totalLossReports: reports,
        completedInspections: panchanamas,
        totalDisbursed: approvedAmount[0]?.total || 0
    };
};

module.exports = {
    getDistrictStats,
    getCompensationTrends,
    getOfficerPerformance,
    getDashboardOverview
};
