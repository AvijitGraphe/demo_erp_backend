const mongoose = require('mongoose');
const { Schema } = mongoose;
const Brand = require('./Brand'); // Reference to the Brand model

const BrandCalanderSchema = new Schema({
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand', 
    required: true,
  },
  event_name: {
    type: String,
    required: false, 
  },
  event_date: {
    type: Date,
    required: false, 
  },
  event_status: {
    type: String,
    enum: ['Pending', 'Posted', 'Cancelled'],
    default: 'Pending',
    required: true, 
  },
  event_color: {
    type: String,
    required: false, 
  },
}, {
  timestamps: true, 
});


module.exports = mongoose.model('BrandCalander', BrandCalanderSchema);
