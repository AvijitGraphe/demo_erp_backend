const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Role = require('./Role');

const UserSchema = new Schema({
  first_name: { 
    type: String,
    required: false,
  },
  last_name: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
  },
  Role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: false,
  },
  Is_active: {
    type: Boolean,
    default: true,
  },
  user_type: {
    type: String,
    enum:['Founder','Admin','SuperAdmin','HumanResource','Accounts','Department_Head','Employee','Social_Media_Manager','Task_manager','Ex_employee','Unverified'],
    default: 'Unverified',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
