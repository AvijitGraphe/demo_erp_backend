const mongoose = require('mongoose');
const Schema = mongoose.Schema;   

const BankDetailsSchema = new Schema({      
  user_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  bank_name: {
    type:String,
    required:true
  },
  bank_account_no: {
    type:String,
    required:true
  },      
  ifsc_code: {      
    type:String,      
    required:true      
  },
  branch_name: {      
    type:String,
    required:true      
  },
  accountHolder_name: {
    type: String,      
    required: true      
  }
},{   
  timestamps: true,   
});    
module.exports = mongoose.model('BankDetails', BankDetailsSchema);
