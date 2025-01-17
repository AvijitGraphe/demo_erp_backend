const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Group = require("./Group");
const User = require("./User");


const MessageSchema =  new Schema({
  sender_id: {
     type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
  },
  receiver_id: {
     type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
  },
  group_id: {
     type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
  },
  content: {
    type:String,
    required: false,
  },
  prevMessageId:{
    type: Number,
    required: true,
  },
  prevContent: {
    type:String,
    required: true,
  },
  sender_name: {
    type:String,
    required: true,
  },
  rebackName: {
    type:String,
  },
  status: {
    type: String,
    enum:['check', 'uncheck'], 
    default: 'uncheck', 
    required: false,
  },
  group_status: {
    type: String,
    enum:['check', 'uncheck'], 
    default: 'uncheck', 
    required: false,
  },

}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', MessageSchema);
