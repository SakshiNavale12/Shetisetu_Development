const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { notificationService } = require('../services');
const pick = require('../utils/pick');

const getNotifications = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['isRead', 'type']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await notificationService.queryNotifications(req.user.id, filter, options);
    res.send(result);
});

const getUnreadCount = catchAsync(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.send({ count });
});

const markAsRead = catchAsync(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.notificationId, req.user.id);
    res.send(notification);
});

const markAllAsRead = catchAsync(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.send(result);
});

const deleteNotification = catchAsync(async (req, res) => {
    await notificationService.deleteNotification(req.params.notificationId, req.user.id);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
