const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');

const UserTimeSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  start_time: {
    type: String, 
    required: true,
  },
}, {
  timestamps: true, 
});

module.exports = mongoose.model('UserTime', UserTimeSchema);
