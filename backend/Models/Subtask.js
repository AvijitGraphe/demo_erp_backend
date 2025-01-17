const mongoose = require('mongoose');
const Schema = mongoose.Schema; 
const Projects = require('./Projects'); // Assuming the Projects model is in the same directory
const Brand = require('./Brand'); // Assuming the Brand model is in the same directory
const User = require('./User'); // Assuming the User model is in the same directory
const Tasks = require('./Tasks'); // Assuming the User model is in the same directory
const ProjectUserRole = require('./ProjectUserRole'); // Assuming the User model is in the same directory



const SubtaskSchema = new Schema({

  subtask_name: {
    type: String,
    required: false
  },
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tasks',
    required: true
  },
  project_id: {
   type: mongoose.Schema.Types.ObjectId,
      ref: 'Projects',
      required: true
  }, 
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  project_role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectUserRole',
    required: true
  },
  sub_task_description: {
    type: String
  },
  sub_task_startdate: {
    type: Date,  // Change to DATE to store both date and time
    required: false
  },
  sub_task_deadline: {
    type: Date,  // Change to DATE to store both date and time
    required: false
  },
  sub_task_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  missed_deadline: {
    type: Boolean,
  },
  status: {
    type: String,
    enum:['Created', 'In-Progress', 'Completed', 'Deadline-missed', 'On-Hold', 'Rejected'],
    default: 'Created'
  },
  priority: {
    type: String, 
    enum:['Low', 'Medium', 'High', 'Urgent'],
    default: 'Low'
  },
  is_active: {
    type: Boolean,
  },
  on_hold: {
    type: Boolean,
  },
  priority_flag: { 
    type: String, 
    enum:['Priority', 'No-Priority'],
    default: 'No-Priority' 
  }
}, {
  timestamps: true
});




module.exports = mongoose.model('Subtask', SubtaskSchema);
