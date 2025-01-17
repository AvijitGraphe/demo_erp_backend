
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const JoiningDateSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,     
    ref: 'User',     
    required: true,   
  },
  joining_date:{
    type: Date,
    default: Date.now,
  }
})
module.exports = mongoose.model('JoiningDate', JoiningDateSchema);