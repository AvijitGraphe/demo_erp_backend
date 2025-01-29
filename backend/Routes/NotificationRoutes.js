const express = require('express');
const Notification = require('../Models/Notification');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();
const moment = require('moment');   

const mongoose = require('mongoose');

// Fetch notifications by user_id
router.get('/notifications/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { start, end } = req.query;
    try {
        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();
        const dateFilter = start && end
            ? {
                  createdAt: {
                      $gte: new Date(start), 
                      $lte: new Date(end),  
                  },
              }
            : {
                  createdAt: {
                      $gte: todayStart,
                      $lte: todayEnd,
                  },
              };

        // Fetch all notifications for the user with applied filters and sort them
        const notifications = await Notification.find({
            user_id: userId,
            ...dateFilter, // Apply date range filter
        })
        .sort({
            is_read: 1, 
            createdAt: -1, 
        });

        // Count unread notifications
        const unreadCount = await Notification.countDocuments({
            user_id: userId,
            is_read: false,
            ...dateFilter,
        });

        // Extract IDs of unsent notifications
        const unsentNotificationIds = notifications
            .filter((n) => !n.is_sent)
            .map((n) => n._id); 

        // Update is_sent flag for unsent notifications
        if (unsentNotificationIds.length > 0) {
            await Notification.updateMany(
                { _id: { $in: unsentNotificationIds } },
                { $set: { is_sent: true } }
            );
            // console.log(`Notifications marked as sent: ${unsentNotificationIds}`);
        }
        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Mark one notification as read based on notification_id
router.put('/notifications/:notificationId/mark-as-read', authenticateToken, async (req, res) => {
    const { notificationId } = req.params; // Extract notificationId from the request URL
    if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID is required.' });
    }
    try {
        // Find the notification by its ID and update the `is_read` field to true
        const notification = await Notification.findByIdAndUpdate(
            notificationId, 
            { is_read: true }, // Set is_read to true
            { new: true } // Return the updated notification document
        );

        // Check if the notification was found and updated
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found or already marked as read.' });
        }

        return res.json({ message: 'Notification marked as read successfully.' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});




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

        res.json({ hasUnread: hasUnreadNotifications ? true : false });
    } catch (error) {
        console.error('Error checking unread notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Fetch notifications by user_id for today
router.get('/notifications_push/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    try {
        // Calculate today's date range
        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();
        const notifications = await Notification.find({
            user_id: userId,
            is_sent: false,
            createdAt: {
                $gte: todayStart,
                $lte: todayEnd,
            },
        }).sort({
            is_read: 1,
            createdAt: -1, 
        });
        const unsentNotificationIds = notifications.map((n) => n._id);
        if (unsentNotificationIds.length > 0) {
            await Notification.updateMany(
                { _id: { $in: unsentNotificationIds } },
                { $set: { is_sent: true } }
            );
            // console.log(`Notifications marked as sent: ${unsentNotificationIds}`);
        }
        res.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;
