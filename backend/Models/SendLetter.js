const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LetterTemplate = require('./Letter_template'); 
const User = require('./User'); 


const SendLetterSchema = new Schema({

    template_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LetterTemplate',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user_email: {
       type: String,
        required: false,
    },
    employee_name: {
       type: String,
        required: false,
    },
    joining_date: {
        type: Date ,
        required: true,
    },
    designation_offered: {
       type: String,
        required: false,
    },
    body: {
        type: String, 
        required: false,
    },
    creator_name: {
       type: String,
        required: false,
    },
    creator_designation: {
       type: String,
        required: false,
    },
    signature_url: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum:['Generated', 'Confirmed', 'Edited'],
        default: 'Generated',
        required: false,
    },
}, {
    tableName: 'send_letters',
});

module.exports = mongoose.model('SendLetter', SendLetterSchema);


