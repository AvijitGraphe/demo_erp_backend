const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User')
const LeaveType = require('./LeaveType'); 


const LeaveBlanceSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  leave_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: true,
  },
  name:{
    type: String,
    required: false
  },
  total_days: {
    type: Number,
    required: false,
    default: 0
  },
  earned_days: {
    type: Number,
    required: false,
    default: 0
  },
  arrear_days: {
    type: Number,
    required: false,
    default: 0
  }
},{ 
  timestamps: true
})

module.exports = mongoose.model('LeaveBlance', LeaveBlanceSchema);