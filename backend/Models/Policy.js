const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');


const PolicySchema = new Schema({
    policy_name: {
        type: String,
        required: false
    },
    policy_type: {
        type: [String],
        enum: ['HumanResource','Accounts','Department_Head','Employee','Social_Media_Manager','Task_manager'],
        required: false
    },
    policy_subject: {
        type: String,
        required: false
    },
    policy_desc: {
        type: String,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: false
    }
},{
    timestamps: true
});

module.exports = mongoose.model('Policy', PolicySchema);