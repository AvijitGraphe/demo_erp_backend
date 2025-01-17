const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');


const NotificationSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,     
        ref: 'User',     
        required: true,   
    },
    notification_type:{
        type: String,     
        required:false,   
    },
    message:{
        type: String,     
        required:false,   
    },
    is_read:{
        type: Boolean,     
        required: false,   
    },
    is_sent:{
        type: Boolean,     
        required: false,   
    },
    link_url:{
        type: String,   
        maxlength: 2550,  
        required: true,   
}
},{
  timestamps: true,
});
module.exports = mongoose.model('Notification', NotificationSchema);


