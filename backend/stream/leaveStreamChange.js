const mongoose = require('mongoose');
const Notification = require('../Models/Notification');
const User = require('../Models/User');
const LeaveRequest = require('../Models/LeaveRequest');
const leaveStreamChange = LeaveRequest.watch([
    { 
        $match: {
            operationType: 'update',
            'updateDescription.updatedFields.Status': { $in: ['Approved', 'Rejected'] }
        }
    }
]);

// Event listener when a change occurs in the LeaveRequest collection
leaveStreamChange.on('change', async (change) => {
    try {
        const updatedLeaveRequest = await LeaveRequest.findById(change.documentKey._id);
        if (updatedLeaveRequest) {
            const user = await User.findById(updatedLeaveRequest.user_id);
            if (user) {
                let notificationMessage = '';
                if (updatedLeaveRequest.Status === 'Approved') {
                    notificationMessage = `Hi ${user.first_name} ${user.last_name}, Your leave request for ${updatedLeaveRequest.dates} has been approved.`;
                } else if (updatedLeaveRequest.Status === 'Rejected') {
                    notificationMessage = `Hi ${user.first_name} ${user.last_name}, Your leave request for ${updatedLeaveRequest.dates} has been rejected.`;
                }
                const notification = new Notification({
                    user_id: user._id,
                    notification_type: 'Leave Request Status',
                    message: notificationMessage
                });
                await notification.save();
            }
        }
    } catch (error) {
        console.error('Error creating leave request notification:', error);
    }
});

process.on('SIGINT', () => {
    leaveStreamChange.close();
    mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit();
});
