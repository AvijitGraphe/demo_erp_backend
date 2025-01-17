const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User'); 

const OvertimeSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    start_time: {
      type: String, 
      required: true,
    },
    end_time: {
      type: String, 
      required: true,
    },
    total_time: {
      type: Number, 
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending', 
      required: true,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: false, 
    },
    reason: {
      type: String, 
      required: false,
    },
    overtime_date: {
      type: Date, 
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('Overtime', OvertimeSchema);
