

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BrandSchema = new Schema({      
  brand_name: {     
    type: String,     
    required: true,   
  }
},{   
  timestamps: true,   
}); 
module.exports = mongoose.model('Brand', BrandSchema);
