const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');

const UserDetails = new Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employee_id: {
    type: String,
    required: false
  },
  address: {
    type: String,
   required: false
  },
  city: {
    type: String,
   required: false
  },
  pincode: {
    type: String,
   required: false
  },
  state: {
    type: String,
   required: false
  },
  country: {
    type: String,
   required: false
  },
  phone: {
    type: String,
   required: false
  },
  gender: {
    type: String,
   required: false
  },
  date_of_birth: {
    type: Date,
   required: false,
  },
  
  forte: {
    type: String,
   required: true
  },
  other_skills: {
    type: String,
   required: true
  },
  pan_card_no: {
    type: String,
   required: false
  },
  passport_no: {
    type: String,
   required: false
  },
  aadhar_no: {
    type: String,
   required: false
  },
  nationality: {
    type: String,
   required: false
  },
  religion: {
    type: String,
   required: false
  },
  marital_status: {
    type: String,
   required: false
  },
  employment_of_spouse: {
   type: String,
   required: true
  },
  no_of_children: {
   type: Number,
   required: true
  }
}, {
  timestamps: true
});



module.exports = mongoose.model('UserDetails', UserDetails);
