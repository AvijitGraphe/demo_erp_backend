const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpireEmployeeSchema = new Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,     
        ref: 'User',     
        required: true, 
    },
    expire_date:{
        type: Date,
        default:Date.now,
    }
    },{
        timestamps: true,
    });
module.exports = mongoose.model('ExpireEmployeeSchema', ExpireEmployeeSchema);