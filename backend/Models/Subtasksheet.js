const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Tasks = require('./Tasks'); // Assuming the Tasks model is in the same directory
const Tasksheet = require('./Tasksheet'); // Assuming the TaskSheet model is in the same directory
const Subtask = require('./Subtask'); // Assuming the Subtask model is in the same directory




const SubtasksheetSchema = new Schema({ 
  tasksheet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tasksheet',
    required: true
  },
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tasks',
    required: true
  },
  subtask_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subtask',
    required: true
  },
  Subtask_status: {
    type: String,
    enum:['Todo','InProgress', 'Completed'],
    default: 'Todo',
    required: false,
  },
  task_deadline: {
    type: Date,
    required: true
  },
  task_priority_flag: {
    type: String, 
    enum:['Priority', 'No-Priority'],
    default: 'No-Priority',
  },
  missed_deadline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});



module.exports = mongoose.model('Subtasksheet', SubtasksheetSchema);
