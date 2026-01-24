const httpStatus = require('http-status');
const { Notification } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a notification
 * @param {Object} notificationBody
 * @returns {Promise<Notification>}
 */
const createNotification = async (notificationBody) => {
    return Notification.create(notificationBody);
};

/**
 * Create notification for a user
 * @param {ObjectId} userId
 * @param {string} type
 * @param {string} title
 * @param {string} message
 * @param {ObjectId} relatedEntity
 * @param {string} entityModel
 * @returns {Promise<Notification>}
 */
const notifyUser = async (userId, type, title, message, relatedEntity = null, entityModel = null) => {
    const notificationData = {
        userId,
        type,
        title,
        message,
    };

    if (relatedEntity) {
        notificationData.relatedEntity = relatedEntity;
        notificationData.entityModel = entityModel;
    }

    return Notification.create(notificationData);
};

/**
 * Query for notifications
 * @param {ObjectId} userId
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryNotifications = async (userId, filter, options) => {
    const notificationFilter = { userId, ...filter };
    const notificationOptions = {
        sortBy: options.sortBy || 'createdAt:desc',
        limit: options.limit || 10,
        page: options.page || 1,
    };
    const notifications = await Notification.paginate(notificationFilter, notificationOptions);
    return notifications;
};

/**
 * Get notification by id
 * @param {ObjectId} id
 * @returns {Promise<Notification>}
 */
const getNotificationById = async (id) => {
    return Notification.findById(id);
};

/**
 * Mark notification as read
 * @param {ObjectId} notificationId
 * @param {ObjectId} userId
 * @returns {Promise<Notification>}
 */
const markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOne({ _id: notificationId, userId });
    if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
    }
    notification.isRead = true;
    await notification.save();
    return notification;
};

/**
 * Mark all notifications as read for a user
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const markAllAsRead = async (userId) => {
    const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return { modifiedCount: result.nModified || result.modifiedCount };
};

/**
 * Get unread notification count
 * @param {ObjectId} userId
 * @returns {Promise<number>}
 */
const getUnreadCount = async (userId) => {
    const count = await Notification.countDocuments({ userId, isRead: false });
    return count;
};

/**
 * Delete notification by id
 * @param {ObjectId} notificationId
 * @param {ObjectId} userId
 * @returns {Promise<Notification>}
 */
const deleteNotification = async (notificationId, userId) => {
    const notification = await Notification.findOne({ _id: notificationId, userId });
    if (!notification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
    }
    await notification.remove();
    return notification;
};

module.exports = {
    createNotification,
    notifyUser,
    queryNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
};
