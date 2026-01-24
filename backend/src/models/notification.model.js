const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const notificationTypes = [
    'crop_survey_submitted',
    'crop_survey_verified',
    'loss_report_submitted',
    'loss_report_verified',
    'payment_status',
    'system',
    'panchanama_scheduled',
    'panchanama_submitted',
    'panchanama_approved',
    'panchanama_rejected',
    'ekyc_submitted',
    'ekyc_verified',
    'ekyc_rejected',
    'ekyc_resubmitted'
];

const notificationSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: notificationTypes,
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        relatedEntity: {
            type: mongoose.SchemaTypes.ObjectId,
            refPath: 'entityModel',
        },
        entityModel: {
            type: String,
            enum: ['CropSurvey', 'LossReport', 'Panchanama', 'Farmer', null],
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
notificationSchema.plugin(toJSON);
notificationSchema.plugin(paginate);

/**
 * @typedef Notification
 */
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
module.exports.notificationTypes = notificationTypes;
