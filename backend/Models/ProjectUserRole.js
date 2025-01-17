const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectUserRoleSchema = new Schema({
  project_role_name: {
    type: String,
    required: false
  }
})

module.exports = mongoose.model('ProjectUserRole', ProjectUserRoleSchema);