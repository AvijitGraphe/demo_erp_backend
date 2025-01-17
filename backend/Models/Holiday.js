


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HolidaySchema = new Schema({
    holiday_name:{
        type: String,     
        required: true,   
    },
    holiday_date:{
        type: Date,     
        required: true,   
    },
    image_url:{
        type: String,     
        required: true,   
    },
    imagekit_file_id:{
        type: String,     
        required: true,   
    },
    status:{
        type: String,     
        required: true,   
    }
},
{   
    timestamps: true,
})
module.exports = mongoose.model('Holiday', HolidaySchema);