const mongoose = require('mongoose');
const {Schema, Types} = mongoose;
const User = require('./User');


const SalarySchema = new Schema({

  Salary_basis: {
    type: String,
    enum:['Monthly', 'Weekly', 'Daily', 'Hourly'],
    required: false,
  },
  Salary_Amount: {
    type: Types.Decimal128,
    required: false,
  },
  Payment_type: {
    type: String,
    enum:['Bank_transfer', 'Check', 'Cash', 'Demand_draft'],
    required: false,
  },
  Ptax: {
    type: Types.Decimal128,
    required: true, 
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  timestamps: true,
});


module.exports = mongoose.model('Salary', SalarySchema);
