// models/LeaveRequest.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const User = require('./User'); 

const leaveRequestSchema = new Schema(
  {
    Leave_type_Id: {
      type: Schema.Types.ObjectId, 
      ref: 'LeaveType',              
      required: true,
    },
    name: {
      type: String,
      maxlength: 100,
    },
    user_id: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
    },
    dates: {
      type: String, 
      required: true,
    },
    Total_days: {
      type: Number,
    },
    reason: {
      type: String,
      maxlength: 2055, 
      required: true, 
    },
    Status: {
      type: String,
      default: 'Pending',
    },
    Comment: {
      type: String,
      required: false,
    },
    Approved_By: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: false,
    },
  },
  {
    timestamps: true, 
    collection: 'LeaveRequest', 
  }
);


module.exports = model('LeaveRequest', leaveRequestSchema);


