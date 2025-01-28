const mongoose = require('mongoose');
const { Schema } = mongoose;

const sendLetterSchema = new Schema(
  {
    template_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LetterTemplate', 
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: false, 
    },
    user_email: {
      type: String,
      required: true,
    },
    employee_name: {
      type: String,
      required: true,
    },
    creator_name: {
      type: String,
      required: true,
    },
    creator_designation: {
      type: String,
      required: true,
    },
    signature_url: {
      type: String,
      required: false, 
    },
    signature_file_id: {
      type: String, 
      required: false, 
    },
    status: {
      type: String,
      enum: ['Generated', 'Confirmed', 'Edited'],
      default: 'Generated',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SendLetter', sendLetterSchema);
