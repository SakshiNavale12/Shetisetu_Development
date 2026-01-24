const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const landParcelSchema = mongoose.Schema({
    surveyNumber: {
        type: String,
        required: true,
        trim: true,
    },
    gutNumber: {
        type: String,
        trim: true,
    },
    area: {
        type: Number,
        required: true,
        min: 0,
    },
    unit: {
        type: String,
        enum: ['hectare', 'are', 'guntha', 'acre'],
        default: 'hectare',
    },
    ownershipType: {
        type: String,
        enum: ['owned', 'leased', 'shared'],
        default: 'owned',
    },
    leaseDocument: {
        type: String, // URL to uploaded document
    },
});

const farmerSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        // Personal Details
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        fatherName: {
            type: String,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
        },
        // Location Hierarchy (Division → District → Taluka → Village)
        division: {
            type: String,
            trim: true,
        },
        district: {
            type: String,
            required: true,
            trim: true,
        },
        taluka: {
            type: String,
            required: true,
            trim: true,
        },
        village: {
            type: String,
            required: true,
            trim: true,
        },
        // Bank Details for compensation
        bankName: {
            type: String,
            trim: true,
        },
        accountNumber: {
            type: String,
            trim: true,
            private: true, // Sensitive data
        },
        ifscCode: {
            type: String,
            trim: true,
            uppercase: true,
            validate(value) {
                if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
                    throw new Error('Invalid IFSC code format');
                }
            },
        },
        accountHolderName: {
            type: String,
            trim: true,
        },
        // Land Parcels (7/12 linked)
        landParcels: [landParcelSchema],
        // eKYC Documents
        documents: {
            aadhaar: {
                url: String,
                filename: String,
                uploadedAt: Date,
            },
            pan: {
                url: String,
                filename: String,
                uploadedAt: Date,
            },
            '7-12': {
                url: String,
                filename: String,
                uploadedAt: Date,
            },
            '8-A': {
                url: String,
                filename: String,
                uploadedAt: Date,
            },
            passbook: {
                url: String,
                filename: String,
                uploadedAt: Date,
            },
            lease: {
                url: String,
                filename: String,
                uploadedAt: Date,
            },
        },
        // Profile completion status
        isProfileComplete: {
            type: Boolean,
            default: false,
        },
        // Document verification status
        documentsVerified: {
            type: Boolean,
            default: false,
        },
        // eKYC Status
        ekycStatus: {
            type: String,
            enum: ['pending', 'submitted', 'verified', 'rejected'],
            default: 'pending',
        },
        ekycVerifiedBy: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
        },
        ekycVerifiedAt: {
            type: Date,
        },
        ekycRemarks: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Add plugins
farmerSchema.plugin(toJSON);
farmerSchema.plugin(paginate);

/**
 * Check if user already has a farmer profile
 * @param {ObjectId} userId - The user's ID
 * @param {ObjectId} [excludeFarmerId] - The farmer ID to exclude
 * @returns {Promise<boolean>}
 */
farmerSchema.statics.hasProfile = async function (userId, excludeFarmerId) {
    const farmer = await this.findOne({ user: userId, _id: { $ne: excludeFarmerId } });
    return !!farmer;
};

/**
 * Calculate total land area in hectares
 * @returns {number}
 */
farmerSchema.methods.getTotalLandArea = function () {
    const conversionToHectare = {
        hectare: 1,
        are: 0.01,
        guntha: 0.01012, // 1 guntha = 0.01012 hectares
        acre: 0.4047,
    };

    return this.landParcels.reduce((total, parcel) => {
        const factor = conversionToHectare[parcel.unit] || 1;
        return total + parcel.area * factor;
    }, 0);
};

/**
 * @typedef Farmer
 */
const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
