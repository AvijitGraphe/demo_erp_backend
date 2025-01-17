const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Role = require('./Role'); 
const LeaveTypeSchema = new Schema({
  name: {
    type: String,     
    required:false,   
  },
  description: {
    type: String,     
    required: true,   
  },
  total_days: {
    type: Number,
    required: true,
    default: 0,
  },
  accrual_type: {
    type: String,
    enum: ['MonthlyAquired', 'YearlyAquired'],     
    required: false,   
  },
  Role_id: {
    type: mongoose.Schema.Types.ObjectId,     
    ref: 'Role',     
    required: true,   
  },
  salary_deduction: {
    type: Boolean,
    required: true,
  },
},{ 
  timestamps: true,
});
module.exports = mongoose.model('LeaveType', LeaveTypeSchema);