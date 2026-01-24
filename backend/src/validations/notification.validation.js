const Joi = require('joi');

const getNotifications = {
    query: Joi.object().keys({
        isRead: Joi.boolean(),
        type: Joi.string().valid(
            'crop_survey_submitted',
            'crop_survey_verified',
            'loss_report_submitted',
            'loss_report_verified',
            'payment_status',
            'system'
        ),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const markAsRead = {
    params: Joi.object().keys({
        notificationId: Joi.string().required(),
    }),
};

const deleteNotification = {
    params: Joi.object().keys({
        notificationId: Joi.string().required(),
    }),
};

module.exports = {
    getNotifications,
    markAsRead,
    deleteNotification,
};
