const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LetterTemplateSchema = new Schema({
  template_name: {
    type: String,
    required: true,
  },
  template_subject: {
    type: String,
    required: true,
  },
},{
  timestamps: true,
});   
module.exports = mongoose.model('LetterTemplate', LetterTemplateSchema);