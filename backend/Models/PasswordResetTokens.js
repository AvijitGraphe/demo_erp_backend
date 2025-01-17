const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');



const PasswordResetTokenSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  token: {
    type: String,
    required: false,
  },
  created_at: {
    type:Date,
    default:Date.now,
  },
  expires_at: {
    type:Date,
    default:Date.now,
    required: false,
  },
}, {
  timestamps: true
})

module.exports = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);