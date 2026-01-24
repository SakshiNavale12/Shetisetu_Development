const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const panchanamaSchema = mongoose.Schema(
    {
        // Reference to the loss report
        lossReport: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'LossReport',
            required: true,
        },
        // Reference to the farmer
        farmer: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Farmer',
            required: true,
        },
        // Officer conducting the inspection
        officer: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        // Case details
        caseNumber: {
            type: String,
            required: true,
            unique: true,
        },
        // Site visit information
        siteVisit: {
            scheduledDate: {
                type: Date,
                required: true,
            },
            actualDate: {
                type: Date,
            },
            startTime: {
                type: String,
            },
            endTime: {
                type: String,
            },
            gpsCoordinates: {
                latitude: Number,
                longitude: Number,
            },
        },
        // Land details (from survey)
        landDetails: {
            surveyNumber: String,
            gutNumber: String,
            area: Number,
            areaUnit: {
                type: String,
                enum: ['hectare', 'acre', 'guntha'],
                default: 'hectare',
            },
        },
        // Crop details
        cropDetails: {
            cropType: String,
            variety: String,
            sowingDate: Date,
            expectedYield: Number,
            actualCondition: String,
        },
        // Damage assessment
        damageAssessment: {
            causeOfDamage: {
                type: String,
                enum: ['drought', 'flood', 'pest', 'disease', 'hailstorm', 'unseasonal_rain', 'fire', 'other'],
            },
            damagePercentage: {
                type: Number,
                min: 0,
                max: 100,
            },
            affectedArea: {
                type: Number,
            },
            severityLevel: {
                type: String,
                enum: ['mild', 'moderate', 'severe', 'total'],
            },
            detailedObservation: {
                type: String,
            },
        },
        // Photo evidence
        photos: [
            {
                url: String,
                caption: String,
                gpsCoordinates: {
                    latitude: Number,
                    longitude: Number,
                },
                capturedAt: Date,
            },
        ],
        // Witnesses
        witnesses: [
            {
                name: String,
                designation: String,
                contact: String,
            },
        ],
        // Officer's remarks and recommendation
        officerRemarks: {
            type: String,
        },
        recommendation: {
            type: String,
            enum: ['approve', 'partial_approve', 'reject', 'further_investigation'],
        },
        recommendedAmount: {
            type: Number,
        },
        // Digital signature (base64 or reference)
        officerSignature: {
            type: String,
        },
        farmerSignature: {
            type: String,
        },
        // Status workflow
        status: {
            type: String,
            enum: ['draft', 'submitted', 'reviewed', 'approved', 'rejected'],
            default: 'draft',
        },
        submittedAt: {
            type: Date,
        },
        reviewedBy: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
        },
        reviewedAt: {
            type: Date,
        },
        reviewRemarks: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Add plugins
panchanamaSchema.plugin(toJSON);
panchanamaSchema.plugin(paginate);

// Generate case number
panchanamaSchema.statics.generateCaseNumber = async function () {
    const year = new Date().getFullYear();
    const count = await this.countDocuments({ caseNumber: new RegExp(`^PAN-${year}`) });
    return `PAN-${year}-${String(count + 1).padStart(6, '0')}`;
};

/**
 * @typedef Panchanama
 */
const Panchanama = mongoose.model('Panchanama', panchanamaSchema);

module.exports = Panchanama;
