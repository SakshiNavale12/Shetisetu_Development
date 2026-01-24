const httpStatus = require('http-status');
const { Farmer, User } = require('../models');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notification.service');

/**
 * Create a farmer profile
 * @param {ObjectId} userId - The user ID
 * @param {Object} farmerBody - The farmer profile data
 * @returns {Promise<Farmer>}
 */
const createFarmer = async (userId, farmerBody) => {
    if (await Farmer.hasProfile(userId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Farmer profile already exists');
    }
    return Farmer.create({ ...farmerBody, user: userId });
};

/**
 * Get farmer by user ID
 * @param {ObjectId} userId - The user ID
 * @returns {Promise<Farmer>}
 */
const getFarmerByUserId = async (userId) => {
    return Farmer.findOne({ user: userId }).populate('user', 'name email mobile role language');
};

/**
 * Get farmer by ID
 * @param {ObjectId} farmerId - The farmer ID
 * @returns {Promise<Farmer>}
 */
const getFarmerById = async (farmerId) => {
    return Farmer.findById(farmerId).populate('user', 'name email mobile role language');
};

/**
 * Update farmer by user ID
 * @param {ObjectId} userId - The user ID
 * @param {Object} updateBody - The update data
 * @returns {Promise<Farmer>}
 */
const updateFarmerByUserId = async (userId, updateBody) => {
    const farmer = await getFarmerByUserId(userId);
    if (!farmer) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Farmer profile not found');
    }
    Object.assign(farmer, updateBody);

    // Check profile completeness
    farmer.isProfileComplete = checkProfileComplete(farmer);

    await farmer.save();
    return farmer;
};

/**
 * Add land parcel to farmer
 * @param {ObjectId} userId - The user ID
 * @param {Object} parcelData - The land parcel data
 * @returns {Promise<Farmer>}
 */
const addLandParcel = async (userId, parcelData) => {
    const farmer = await getFarmerByUserId(userId);
    if (!farmer) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Farmer profile not found');
    }
    farmer.landParcels.push(parcelData);
    await farmer.save();
    return farmer;
};

/**
 * Update land parcel
 * @param {ObjectId} userId - The user ID
 * @param {ObjectId} parcelId - The land parcel ID
 * @param {Object} updateData - The update data
 * @returns {Promise<Farmer>}
 */
const updateLandParcel = async (userId, parcelId, updateData) => {
    const farmer = await getFarmerByUserId(userId);
    if (!farmer) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Farmer profile not found');
    }

    const parcel = farmer.landParcels.id(parcelId);
    if (!parcel) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Land parcel not found');
    }

    Object.assign(parcel, updateData);
    await farmer.save();
    return farmer;
};

/**
 * Delete land parcel
 * @param {ObjectId} userId - The user ID
 * @param {ObjectId} parcelId - The land parcel ID
 * @returns {Promise<Farmer>}
 */
const deleteLandParcel = async (userId, parcelId) => {
    const farmer = await getFarmerByUserId(userId);
    if (!farmer) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Farmer profile not found');
    }

    const parcel = farmer.landParcels.id(parcelId);
    if (!parcel) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Land parcel not found');
    }

    parcel.remove();
    await farmer.save();
    return farmer;
};

/**
 * Query farmers with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options (sortBy, limit, page)
 * @returns {Promise<QueryResult>}
 */
const queryFarmers = async (filter, options) => {
    const farmers = await Farmer.paginate(filter, options);
    return farmers;
};

/**
 * Check if farmer profile is complete
 * @param {Object} farmer - The farmer object
 * @returns {boolean}
 */
const checkProfileComplete = (farmer) => {
    const requiredFields = ['fullName', 'district', 'taluka', 'village'];
    const hasRequiredFields = requiredFields.every((field) => !!farmer[field]);
    const hasLandParcels = !!(farmer.landParcels && farmer.landParcels.length > 0);
    const hasBankDetails = !!(farmer.bankName && farmer.accountNumber && farmer.ifscCode);

    return hasRequiredFields && hasLandParcels && hasBankDetails;
};

/**
 * Update eKYC status (for officers)
 * @param {ObjectId} farmerId - The farmer ID
 * @param {ObjectId} officerId - The officer user ID
 * @param {string} status - New eKYC status ('verified' or 'rejected')
 * @param {string} remarks - Officer's remarks
 * @returns {Promise<Farmer>}
 */
const updateEkycStatus = async (farmerId, officerId, status, remarks = '') => {
    const farmer = await getFarmerById(farmerId);
    if (!farmer) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Farmer not found');
    }

    if (!['verified', 'rejected'].includes(status)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid eKYC status. Must be "verified" or "rejected"');
    }

    farmer.ekycStatus = status;
    farmer.ekycVerifiedBy = officerId;
    farmer.ekycVerifiedAt = new Date();
    farmer.ekycRemarks = remarks;

    if (status === 'verified') {
        farmer.documentsVerified = true;
    }

    await farmer.save();

    // Send notification to farmer
    if (farmer.user) {
        if (status === 'verified') {
            await notificationService.notifyUser(
                farmer.user._id,
                'ekyc_verified',
                'eKYC Verified ✅ / ईकेवायसी सत्यापित',
                'Your documents have been verified by an officer. You can now submit loss reports and panchanama requests.',
                farmer._id,
                'Farmer'
            );
        } else if (status === 'rejected') {
            await notificationService.notifyUser(
                farmer.user._id,
                'ekyc_rejected',
                'eKYC Rejected ❌ / ईकेवायसी नाकारले',
                `Your eKYC verification was rejected. Reason: ${remarks || 'Please update your documents and resubmit.'}`,
                farmer._id,
                'Farmer'
            );
        }
    }

    return farmer;
};

/**
 * Get farmer with full details including documents (for officers)
 * @param {ObjectId} farmerId - The farmer ID
 * @returns {Promise<Farmer>}
 */
const getFarmerWithDocuments = async (farmerId) => {
    return Farmer.findById(farmerId)
        .populate('user', 'name email mobile role')
        .populate('ekycVerifiedBy', 'name email');
};

/**
 * Get farmers pending eKYC verification (for officers)
 * @param {Object} filter - Additional filters (district, taluka, etc.)
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getPendingEkycFarmers = async (filter = {}, options = {}) => {
    const ekycFilter = {
        ekycStatus: 'submitted',
        ...filter,
    };
    return queryFarmers(ekycFilter, {
        ...options,
        sortBy: options.sortBy || 'updatedAt:desc',
        populate: 'user ekycVerifiedBy',
    });
};

/**
 * Submit eKYC for verification (farmer action)
 * @param {ObjectId} userId - The user ID
 * @returns {Promise<Farmer>}
 */
const submitEkycForVerification = async (userId) => {
    const farmer = await getFarmerByUserId(userId);
    if (!farmer) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Farmer profile not found');
    }

    // Check if at least some documents are uploaded
    const hasDocuments = farmer.documents && (
        farmer.documents.aadhaar?.url ||
        farmer.documents.pan?.url ||
        farmer.documents['7-12']?.url ||
        farmer.documents['8-A']?.url ||
        farmer.documents.passbook?.url
    );

    if (!hasDocuments) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Please upload at least one document before submitting for verification');
    }

    // Only allow submission if status is pending or rejected
    if (!['pending', 'rejected'].includes(farmer.ekycStatus)) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Cannot submit eKYC. Current status is "${farmer.ekycStatus}".`
        );
    }

    const wasRejected = farmer.ekycStatus === 'rejected';

    farmer.ekycStatus = 'submitted';
    farmer.ekycRemarks = ''; // Clear previous remarks when resubmitting
    await farmer.save();

    // Send confirmation notification to farmer
    if (farmer.user) {
        await notificationService.notifyUser(
            farmer.user._id,
            wasRejected ? 'ekyc_resubmitted' : 'ekyc_submitted',
            'eKYC Submitted for Verification 📄 / ईकेवायसी सत्यापनासाठी सबमिट केले',
            'Your documents have been submitted for verification. An officer will review them soon.',
            farmer._id,
            'Farmer'
        );
    }

    // Notify all officers about the new/resubmitted eKYC
    const officers = await User.find({ role: 'officer' });
    const notificationPromises = officers.map(officer => {
        const title = wasRejected
            ? 'eKYC Resubmitted for Review 🔄 / ईकेवायसी पुन्हा सबमिट'
            : 'New eKYC Pending Verification 📋 / नवीन ईकेवायसी प्रलंबित';
        const message = wasRejected
            ? `${farmer.fullName} has resubmitted documents for eKYC verification after rejection. District: ${farmer.district}, Taluka: ${farmer.taluka}`
            : `${farmer.fullName} has submitted documents for eKYC verification. District: ${farmer.district}, Taluka: ${farmer.taluka}`;

        return notificationService.notifyUser(
            officer._id,
            wasRejected ? 'ekyc_resubmitted' : 'ekyc_submitted',
            title,
            message,
            farmer._id,
            'Farmer'
        );
    });

    await Promise.all(notificationPromises);

    return farmer;
};

module.exports = {
    createFarmer,
    getFarmerByUserId,
    getFarmerById,
    updateFarmerByUserId,
    addLandParcel,
    updateLandParcel,
    deleteLandParcel,
    queryFarmers,
    updateEkycStatus,
    getFarmerWithDocuments,
    submitEkycForVerification,
    getPendingEkycFarmers,
};
