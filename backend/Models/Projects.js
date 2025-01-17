


const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const User = require('./User');
const Brand = require('./Brand');



const ProjectSchema = new Schema({
  project_name: {
    type: String,
    required: true
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brand',
    required: true
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  total_time: {
    type: Types.Decimal128, 
  },
  description: {
    type: String
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Low'
  },
  lead_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  project_files: {
    type: String
  },
  status: {
    type: String,
    enum: ['Created', 'In-Progress', 'Completed', 'Deadline-missed', 'On-Hold', 'Rejected'],
    default: 'Created'
  },
  missed_deadline: {
    type: Boolean,
    default: false
  },
  member_id: {
    type: [mongoose.Schema.Types.ObjectId], 
    ref: 'User',
    default: []
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Project', ProjectSchema);


