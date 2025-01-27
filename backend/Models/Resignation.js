const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');

const resignationSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  resignation_date: {
    type: Date,
    required: true,
  },
  estimated_last_working_day: {
    type: Date,
    required: false,
  },
  last_working_day: {
    type: Date,
    required: false,
  },
  resignation_reason: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  notice_period_served: {
    type: Boolean,
    default: false,
  },
  notice_duration: {
    type: String,
    enum: ['0', '15', '30', '45', '60', '90'],
    required: false,
  },
}, {
  timestamps: true, 
  collection: 'Resignation',
});

const Resignation = mongoose.model('Resignation', resignationSchema);

module.exports = Resignation;
