
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');


const EmployeeAssestSchema = new Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,     
        ref: 'User',     
        required: true,   
    },
    Asset_Serial_No:{
        type: String,     
        required: false,   
    },
    Asset_name:{
        type: String,     
        required: false,   
    },
    Asset_Status:{
        type: String,     
        required: false,   
    },
    Asset_icon:{
        type: String,     
        required: false,   
    }
},
{   
    timestamps: true,
})

module.exports = mongoose.model('EmployeeAssests', EmployeeAssestSchema)

