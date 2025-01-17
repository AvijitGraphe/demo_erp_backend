const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');

const userTaskLimitsSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    max_tasks_per_day: {
        type: Number,
        required: true,
        default: 5, 
    },
}, {
    timestamps: false, 
});

module.exports = mongoose.model('UserTaskLimits', userTaskLimitsSchema);


