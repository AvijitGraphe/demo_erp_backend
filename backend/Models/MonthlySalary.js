const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');

const MonthlySalarySchema = new Schema({
  user_id:{
    type: mongoose.Schema.Types.ObjectId,     
    ref: 'User',     
    required: true,   
  },
  no_of_days:{
    type: Number,     
    required: true,   
  },
  total_working_days:{
    type: Number,     
    required: true,   
  },
  month:{
    type: String,
    required: true,
  },
  monthly_salary:{
    type: Number,     
    required: true,   
  },
  Present_days:{
    type: Number,
    required: true,   
  },
  Absent_days:{
    type: Number,
    required: true,   
  },
  Total_days:{
    type: Number,
    required: true,  
   },
   Paid_leaves:{
     type: Number,     
      required: true
    },
    Unpaid_leaves:{
      type: Number,     
       required:false
    },
    Overtime:{
      type: Number,     
       required: false
    },
    Added_Amount:{
        type: Number,
        required: false
    },
     Deduction_amount:{
        type: Number,
        required: false
   },
    Pf: {
        type: Number,
        required: false,
    },
    Esi: {
        type: Number,
        required: false,
    },
    Ptax: {
        type: Number,
        required: false,
    },
    TDS: {
        type: Number,
        required: false,
    },
    Advance: {
        type: Number,
        required: false,
    },
    Base_salary: {
        type: Number,
        required: false,
    },
    Pay_in_hand: {
        type: Number,
        required: false,
    },
    Generation_status: {
        type: String,
        enum: ['Estimated', 'Final'],
        required: false,
    },
    SalaryStatus: {
        type: String,
        enum:['Unpaid', 'Paid'],
        required: false,
    },
    date:{
        type: Date,     
        required: true,   
    }
},
{   
  timestamps: true,
})
module.exports = mongoose.model('MonthlySalary', MonthlySalarySchema);