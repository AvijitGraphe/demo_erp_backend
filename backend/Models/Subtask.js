const mongoose = require('mongoose');
const { Schema } = mongoose;

// Assuming you have corresponding models for Projects, Brand, Tasks, User, ProjectUserRole
const Projects = require('./Projects'); // Adjust path as necessary
const Brand = require('./Brand'); // Adjust path as necessary
const Tasks = require('./Tasks'); // Adjust path as necessary
const User = require('./User'); // Adjust path as necessary
const ProjectUserRole = require('./ProjectUserRole'); // Adjust path as necessary

// Define the Subtask schema
const SubtaskSchema = new Schema({
  subtask_name: {
    type: String,
    required: true
  },
  task_id: {
    type: mongoose.Schema.Types.ObjectId,  // Task ID (ObjectId in MongoDB)
    ref: 'Task',  // Reference to the Tasks model
    required: true
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,  // Project ID (ObjectId in MongoDB)
    ref: 'Project',  // Reference to the Projects model
    required: true
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,  // Brand ID (ObjectId in MongoDB)
    ref: 'Brand',  // Reference to the Brand model
  },
  project_role_id: {
    type: mongoose.Schema.Types.ObjectId,  // Project User Role ID (ObjectId in MongoDB)
    ref: 'ProjectUserRole',
  },
  sub_task_description: {
    type: String,
    required: false
  },
  sub_task_startdate: {
    type: Date,  // Store both date and time
    required: true
  },
  sub_task_deadline: {
    type: Date,  // Store both date and time
    required: true
  },
  sub_task_user_id: {
    type: mongoose.Schema.Types.ObjectId,  // User ID (ObjectId in MongoDB)
    ref: 'User',  // Reference to the User model
    required: true
  },
  missed_deadline: {
    type: Boolean
  },
  status: {
    type: String,
    enum: ['Todo', 'InProgress', 'Completed'],
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Low'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  on_hold: {
    type: Boolean,
    default: false
  },
  priority_flag: {
    type: String,
    enum: ['Priority', 'No-Priority'],
    default: 'No-Priority'
  }
}, {
  timestamps: true  // Automatically manage createdAt and updatedAt fields
});

// Create the Mongoose model
const Subtask = mongoose.model('Subtask', SubtaskSchema);

module.exports = Subtask;
