const mongoose = require('mongoose');
const { Schema } = mongoose;

const MeetingSchema = new Schema(
  {
    date: {
      type: Date, 
      required: true,
    },
    start_time: {
      type: String, 
      required: true,
    },
    end_time: {
      type: String, 
      required: true,
    },
    purpose: {
      type: String, 
      required: true,
    },
    meeting_member_id: {
      type: [mongoose.Schema.Types.ObjectId], 
      ref: 'User', 
      required: false, 
    },
  },
  {
    timestamps: true, 
    collection: 'meetings', 
  }
);

module.exports = mongoose.model('Meeting', MeetingSchema);
