const mongoose = require('mongoose');
const { Schema } = mongoose;

const RoleSchema = new Schema({
  role_name: {
    type: String,
    required: true,
    unique: true,  
  },
}, {
  timestamps: true, 
});

const Role = mongoose.model('Role', RoleSchema);
module.exports = Role;
