const mongoose = require('mongoose');

const resignationSchema = new mongoose.Schema({
    user_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    resignation_reason: { 
      type: String, 
      required: true 
    },
    resignation_date: { 
      type: Date, 
      required: true 
    },
    notice_period_served: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      default: 'Pending' 
    },
},{
  timestamps: true
});

const Resignation = mongoose.model('Resignation', resignationSchema);
module.exports = Resignation;
