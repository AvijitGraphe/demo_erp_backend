const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User'); 
const Tasks = require('./Tasks');


const UserTaskPositionsSchema = new Schema({
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    task_id: {
      type: Schema.Types.ObjectId,
      ref: 'Tasks', 
      required: true,
    },
    column: {
      type: String,
      enum:[
        'Todo',
        'InProgress',
        'InReview',
        'InChanges',
        'Completed'
      ],
      required: false
    },
    position: {
      type: Number,
      required: false,    
    }
  }, {
    timestamps: true
  });

  module.exports = mongoose.model('UserTaskPositions', UserTaskPositionsSchema);