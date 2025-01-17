const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./User'); 

const RaiseTicketSchema = new Schema({
  ticket_no: {
    type: String,
    unique: true,
    required: false,  
  },
  Raiser_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true, 
  },
  subject: {
    type: String,
    required: false,  
  },
  issue: {
    type: String,
    required: false,  
  },
  status: {
    type: String,
    enum: ['New_ticket', 'Solved', 'In-progress', 'Rejected'],
    default: 'New_ticket', 
  },
  remarks: {
    type: String,
    required: false, 
  },
  Resolver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    required: false,  
  },
  category: {
    type: String,
    enum: [
      'IT_Support',
      'Connectivity',
      'NetworkIssue',
      'Hardware_issue',
      'Software_issue',
      'Security',
      'Others',
    ],
    required: false, 
  },
}, {
  timestamps: true,  
});

module.exports = mongoose.model('RaiseTicket', RaiseTicketSchema);
