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
  template_body: {
    type: String,     
    required: true,   
  },
  signature_url:{
    type: String,     
    required: true,
  },
  signature_file_id:{
    type: String,     
    required: true,   
  }
},{
  timestamps: true,
});   
module.exports = mongoose.model('LetterTemplate', LetterTemplateSchema);