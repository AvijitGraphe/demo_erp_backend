const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpireEmployeeSchema = new Schema({
    expire_date: {
        type: Date,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('ExpireUser', ExpireEmployeeSchema);
