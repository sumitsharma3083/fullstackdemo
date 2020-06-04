const mongoose = require('mongoose')

const schema = mongoose.Schema 

const product = new schema({
    productname : {
        type : String, 
        required : true 
    }, 
    productprice : {
        type : Number , 
        required  : true
    }
})


module.exports = mongoose.model('products', product)
