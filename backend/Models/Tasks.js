const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Tasks schema
const TaskSchema = new Schema({
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
  task_name: {
    type: String,
    required: false,
    maxlength: 1055
  },
  task_description: {
    type: String
  },
  task_startdate: {
    type: Date
  },
  task_deadline: {
    type: Date
  },
  task_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  missed_deadline: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Todo', 'InProgress', 'InReview', 'InChanges', 'Completed'],
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
  },
  task_type: {
    type: String,
    enum: ['Graphe', 'Weddings'],
    default: 'Graphe'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);


