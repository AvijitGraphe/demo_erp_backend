const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');

const AttendanceSchema = new Schema({
  date: {
    type:Date,
    required:true
  },
  start_time: {
    type:String,
    required:true
  },
  end_time: {
    type:String,
    required:false
  },
  total_time: {
    type:String,
    required:false
  },
  checkin_status: {
    type:Boolean,
    default:false
  },
  attendance_status:{
    type:String,
    enum: ['Full-Day', 'Half-Day', 'Started', 'Absent'], 
    default: 'Started',
    required:true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  }
},{
  timestamps: true,
});   
module.exports = mongoose.model('Attendance', AttendanceSchema);