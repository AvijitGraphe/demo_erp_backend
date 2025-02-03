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

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid userId format' });
    }

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
            user_id: new mongoose.Types.ObjectId(userId), // Ensure userId is a valid ObjectId
            ...dateFilter, // Apply date range filter
        })
        .sort({
            is_read: 1, 
            createdAt: -1, 
        });

        if (!notifications || notifications.length === 0) {
            return res.status(400).json({ message: 'Notification Data Not Found!' });
        }

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
            { is_read: true }, 
            { new: true } 
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
            user_id:  new mongoose.Types.ObjectId(userId),
            is_read: false,
            created_at: {
                $gte: todayStart,
                $lte: todayEnd,   
            },
        });
        if (hasUnreadNotifications) {
            return res.status(404).json({ message : "Notification Data not Found!"})
        }
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
            user_id: new mongoose.Types.ObjectId(userId),
            is_sent: false,
            createdAt: {
                $gte: todayStart,
                $lte: todayEnd,
            },
        }).sort({
            is_read: 1,
            createdAt: -1, 
        });
        if(!notifications){
            return res.status(404).json({ message : "Notifications Data Not Found! "});
        }
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
