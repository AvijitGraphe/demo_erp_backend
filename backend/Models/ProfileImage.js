const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');

const ProfileImageSchema = new Schema({
  image_url: {
    type: String,
    required: false
  },
  imagekit_file_id: { 
    type: String,
    required: false,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProfileImage', ProfileImageSchema);
