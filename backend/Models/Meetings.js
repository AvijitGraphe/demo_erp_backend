const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const MeetingSchema = new Schema({
  date:{
    type: Date,     
    required: false,   
  },
  start_time:{
    type: String,     
    required:false,   
  },
  end_time:{
    type: String,     
    required: false,   
  },
  purpose:{
    type: String,     
    required:false,   
},
meeting_member_id: [{ 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'User' 
}]
},{
  timestamps: true,
}); 
module.exports = mongoose.model('Meeting', MeetingSchema);