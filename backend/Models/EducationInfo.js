


const mongoose = require('mongoose');
const Schema = mongoose.Schema; 
const User = require('./User');


const EducationInfoSchema = new Schema({     
  user_id: {     
    type: mongoose.Schema.Types.ObjectId,     
    ref: 'User',     
    required: true,   
  },   
  institute: {     
    type: String,     
    required: true,   
  },   
  year_of_passing: {     
    type: Number,     
    required: true,   
  },   
  degree_name: {  
    type: String,  
    required: true,  
  } 
},{   
  timestamps: true,   
});    
module.exports = mongoose.model('EducationInfo', EducationInfoSchema);