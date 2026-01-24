const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const lossReportSchema = mongoose.Schema(
    {
        farmer: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Farmer',
            required: true,
        },
        // Link to crop survey if applicable
        cropSurvey: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'CropSurvey',
        },
        // Land parcel details
        landParcel: {
            surveyNumber: { type: String, required: true },
            gutNumber: { type: String },
            area: { type: Number, required: true },
            unit: { type: String, enum: ['hectare', 'are', 'guntha', 'acre'], default: 'hectare' },
        },
        // Crop details
        cropName: {
            type: String,
            required: true,
            trim: true,
        },
        cropType: {
            type: String,
            enum: ['cereals', 'pulses', 'oilseeds', 'vegetables', 'fruits', 'sugarcane', 'cotton', 'other'],
        },
        // Loss details
        lossType: {
            type: String,
            enum: ['drought', 'flood', 'hailstorm', 'pest', 'disease', 'unseasonal_rain', 'frost', 'fire', 'other'],
            required: true,
        },
        lossDate: {
            type: Date,
            required: true,
        },
        dateReported: {
            type: Date,
            default: Date.now,
        },
        // Affected area
        affectedArea: {
            type: Number,
            required: true,
            min: 0,
        },
        affectedAreaUnit: {
            type: String,
            enum: ['hectare', 'are', 'guntha', 'acre'],
            default: 'hectare',
        },
        // Damage percentage
        damagePercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        // Estimated loss amount
        estimatedLoss: {
            type: Number,
            min: 0,
        },
        // Geo-tagged photos (evidence)
        photos: [{
            url: { type: String, required: true },
            type: { type: String, enum: ['damage', 'field', 'evidence'], default: 'damage' },
            caption: { type: String },
            geoLocation: {
                latitude: { type: Number },
                longitude: { type: Number },
                accuracy: { type: Number },
            },
            capturedAt: { type: Date, default: Date.now },
        }],
        // GPS location of the affected area
        fieldLocation: {
            latitude: { type: Number },
            longitude: { type: Number },
            accuracy: { type: Number },
        },
        // Description
        description: {
            type: String,
            maxlength: 1000,
        },
        // Status tracking
        status: {
            type: String,
            enum: ['draft', 'submitted', 'under_review', 'site_visit_scheduled', 'verified', 'approved', 'rejected', 'compensation_processed'],
            default: 'draft',
        },
        // Verification details
        verifiedBy: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
        },
        verifiedAt: {
            type: Date,
        },
        verificationRemarks: {
            type: String,
        },
        siteVisitDate: {
            type: Date,
        },
        siteVisitNotes: {
            type: String,
        },
        // Compensation details
        approvedAmount: {
            type: Number,
            min: 0,
        },
        compensationStatus: {
            type: String,
            enum: ['pending', 'approved', 'disbursed', 'rejected'],
        },
        compensationDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Add plugins
lossReportSchema.plugin(toJSON);
lossReportSchema.plugin(paginate);

// Indexes for efficient queries
lossReportSchema.index({ farmer: 1, lossDate: -1 });
lossReportSchema.index({ status: 1 });
lossReportSchema.index({ lossType: 1 });
lossReportSchema.index({ 'landParcel.surveyNumber': 1 });

/**
 * Get loss type display name
 */
lossReportSchema.methods.getLossTypeDisplay = function () {
    const displayNames = {
        drought: 'Drought / दुष्काळ',
        flood: 'Flood / पूर',
        hailstorm: 'Hailstorm / गारपीठ',
        pest: 'Pest Attack / कीड',
        disease: 'Disease / रोग',
        unseasonal_rain: 'Unseasonal Rain / अवेळी पाऊस',
        frost: 'Frost / दंव',
        fire: 'Fire / आग',
        other: 'Other / इतर',
    };
    return displayNames[this.lossType] || this.lossType;
};

/**
 * @typedef LossReport
 */
const LossReport = mongoose.model('LossReport', lossReportSchema);

module.exports = LossReport;
