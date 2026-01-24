const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const cropSurveySchema = mongoose.Schema(
    {
        farmer: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Farmer',
            required: true,
        },
        landParcel: {
            surveyNumber: { type: String, required: true },
            gutNumber: { type: String },
            area: { type: Number, required: true },
            unit: { type: String, enum: ['hectare', 'are', 'guntha', 'acre'], default: 'hectare' },
        },
        // Season information
        season: {
            type: String,
            enum: ['kharif', 'rabi', 'perennial', 'summer'],
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        // Crop details
        cropName: {
            type: String,
            required: true,
            trim: true,
        },
        cropNameLocal: {
            type: String, // Marathi name
            trim: true,
        },
        cropType: {
            type: String,
            enum: ['cereals', 'pulses', 'oilseeds', 'vegetables', 'fruits', 'sugarcane', 'cotton', 'other'],
            required: true,
        },
        variety: {
            type: String,
            trim: true,
        },
        seedType: {
            type: String,
            enum: ['certified', 'truthful', 'farm_saved', 'hybrid'],
        },
        // Cultivation details
        cultivatedArea: {
            type: Number,
            required: true,
            min: 0,
        },
        cultivatedAreaUnit: {
            type: String,
            enum: ['hectare', 'are', 'guntha', 'acre'],
            default: 'hectare',
        },
        sowingDate: {
            type: Date,
            required: true,
        },
        expectedHarvestDate: {
            type: Date,
        },
        irrigationType: {
            type: String,
            enum: ['rainfed', 'canal', 'well', 'borewell', 'drip', 'sprinkler', 'mixed'],
            required: true,
        },
        // Geo-tagged photos
        photos: [{
            url: { type: String, required: true },
            type: { type: String, enum: ['crop', 'field', 'sowing', 'growth'], default: 'crop' },
            caption: { type: String },
            geoLocation: {
                latitude: { type: Number },
                longitude: { type: Number },
                accuracy: { type: Number },
            },
            capturedAt: { type: Date, default: Date.now },
        }],
        // GPS location of the field
        fieldLocation: {
            latitude: { type: Number },
            longitude: { type: Number },
            accuracy: { type: Number },
        },
        // Status tracking
        status: {
            type: String,
            enum: ['draft', 'submitted', 'verified', 'rejected'],
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
        // Additional fields
        remarks: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Add plugins
cropSurveySchema.plugin(toJSON);
cropSurveySchema.plugin(paginate);

// Indexes for efficient queries
cropSurveySchema.index({ farmer: 1, season: 1, year: 1 });
cropSurveySchema.index({ status: 1 });
cropSurveySchema.index({ 'landParcel.surveyNumber': 1 });

/**
 * Check if farmer already has a survey for this land parcel in the same season
 */
cropSurveySchema.statics.hasDuplicateSurvey = async function (farmerId, surveyNumber, season, year, excludeId) {
    const survey = await this.findOne({
        farmer: farmerId,
        'landParcel.surveyNumber': surveyNumber,
        season,
        year,
        _id: { $ne: excludeId },
    });
    return !!survey;
};

/**
 * @typedef CropSurvey
 */
const CropSurvey = mongoose.model('CropSurvey', cropSurveySchema);

module.exports = CropSurvey;
