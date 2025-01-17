const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User')


const EmergencyContactSchema = new Schema({   
  user_id: {     
    type: mongoose.Schema.Types.ObjectId,     
    ref: 'User',     
    required: true,   
  },
  name: {     
    type: String,     
    required: true,   
  },
  relationship: {     
    type: String,     
    required: true,   
  },
  phone: {     
    type: String,     
    required: true,   
  }
},
{
  timestamps: true,
});

module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);