const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    notification_type: {
        type: String,
        required: true,
        maxlength: 50,
    },
    message: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    is_read: {
        type: Boolean,
        default: false,
    },
    is_sent: {
        type: Boolean,
        default: false,
    },
    link_url: {
        type: String,
        maxlength: 2550,
    }
}, {
    collection: 'Notifications',
    timestamps: false,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;