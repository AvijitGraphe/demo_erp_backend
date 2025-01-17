const mongoose = require('mongoose');
const { Schema } = mongoose;
const RaiseTicket = require('./RaiseTicket'); 

const TicketImagesSchema = new Schema({
  ticket_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RaiseTicket',
    required: true,
  },
  image_url_ticket: {
    type: String,
    required: false, 
  },
  imagekit_file_id: {
    type: String, 
    required: false,
  },
}, {
  timestamps: true,
  collection: 'TicketImages',
});

module.exports = mongoose.model('TicketImages', TicketImagesSchema);
