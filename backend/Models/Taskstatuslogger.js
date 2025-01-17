const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User'); // Assuming the User model is set up for MongoDB
const Tasks = require('./Tasks'); // Assuming the Tasks model is set up for MongoDB

const TaskStatusLoggerSchema = new Schema({

  task_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tasks',
    required: true
  },
  task_user_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  username: {
    type: String, 
    required: false
  },
  status_initial: {
    type: String,
    required: false
  },
  status_final: {
    type: String, 
    required: false
  },
  missed_deadline: {
    type: Boolean, 
    required: false,
    default: false
  },
  time_stamp: {
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('TaskStatusLogger', TaskStatusLoggerSchema);
