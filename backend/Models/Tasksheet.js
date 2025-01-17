const mongoose = require('mongoose');
const { Schema } = mongoose;
const Tasks = require('./Tasks'); 
const User = require('./User');

const TasksheetSchema = new Schema({
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tasks',
    required: true
  },
  tasksheet_user_id: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task_status: {
    type: String,
    enum: ['Todo', 'InProgress', 'InReview', 'InChanges', 'Completed'],
    required: false,
    default: 'Todo',
  },
  task_deadline: {
    type: Date,
    required: true,
  },
  task_priority_flag: {
    type: String,
    enum: ['Priority', 'No-Priority'],
    default: 'No-Priority',
  },
  missed_deadline: {
    type: Boolean,
    default: false,
  },
  tasksheet_date: {
    type: Date, 
    required: false,
    default: Date.now,
  },
}, {
  timestamps: true, 
});

module.exports = mongoose.model('Tasksheet', TasksheetSchema);
