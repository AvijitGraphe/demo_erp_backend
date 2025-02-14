const express = require('express');
const Notification = require('../Models/Notification');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();
const User = require("../Models/User");
const mongoose = require('mongoose');
const moment = require('moment');

router.get('/notifications/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { start, end } = req.query;
    try {
        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();
        const dateFilter = start && end
            ? {
                  created_at: {
                      $gte: new Date(start),
                      $lte: new Date(end),
                  },
              }
            : {
                  created_at: {
                      $gte: todayStart,
                      $lte: todayEnd,
                  },
              };
        const notifications = await Notification.find({
            user_id: userId,
            ...dateFilter,
        }).sort({ is_read: 1, created_at: -1 });

        const unreadCount = await Notification.countDocuments({
            user_id: userId,
            is_read: false,
            ...dateFilter,
        });

        const unsentNotificationIds = notifications
            .filter((n) => !n.is_sent)
            .map((n) => n.notification_id);

        if (unsentNotificationIds.length > 0) {
            await Notification.updateMany(
                { notification_id: { $in: unsentNotificationIds } },
                { $set: { is_sent: true } }
            );
        }

        const responseNotifications = notifications.map((n) => ({
            ...n.toObject(),
            notification_id: n._id,
            _id: undefined, // Remove the original _id field
        }));

        res.json({ notifications: responseNotifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




// Mark one notification as read based on notification_id
router.put('/notifications/:notificationId/mark-as-read', authenticateToken, async (req, res) => {
    const { notificationId } = req.params; 
    if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID is required.' });
    }
    try {
        const result = await Notification.updateOne(
            { _id: notificationId },
            { $set: { is_read: true } }
        );
        if (result.nModified === 0) {
            return res.status(404).json({ error: 'Notification not found or already marked as read.' });
        }
        return res.json({ message: 'Notification marked as read successfully.' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



//notifications
router.get('/notifications/unread/today/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    try {
        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();
        const hasUnreadNotifications = await Notification.findOne({
            user_id: userId,
            is_read: false,
            created_at: {
                $gte: todayStart,
                $lte: todayEnd,
            },
        });
        res.json({ hasUnread: !!hasUnreadNotifications });
    } catch (error) {
        console.error('Error checking unread notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Fetch notifications by user_id for today
router.get('/notifications_push/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid userId format' });
    }
    try {
        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();
        // Convert userId to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const notifications = await Notification.find({
            user_id: userObjectId,
            is_sent: false,
            created_at: {
                $gte: todayStart,
                $lte: todayEnd,
            },
        }).sort({ is_read: 1, created_at: -1 });
        const unsentNotificationIds = notifications.map((n) => n._id);
        if (unsentNotificationIds.length > 0) {
            await Notification.updateMany(
                { _id: { $in: unsentNotificationIds } },
                { $set: { is_sent: true } }
            );
        }
        res.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;
