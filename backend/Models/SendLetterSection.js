const mongoose = require('mongoose');
const { Schema } = mongoose;

const sendLetterSectionSchema = new Schema(
  {
    send_letter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SendLetter',
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SendLetterSection', sendLetterSectionSchema);
