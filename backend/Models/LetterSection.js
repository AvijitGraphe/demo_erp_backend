const mongoose = require('mongoose');
const { Schema } = mongoose;


const letterSectionSchema = new Schema({
  template_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LetterTemplate',
    required: true,
  },
  section_heading: {
    type: String,
    required: true,
  },
  section_body: {
    type: String,
    required: true,
  },
  section_order: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('LetterSection', letterSectionSchema);
