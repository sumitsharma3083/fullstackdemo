const mongoose = require('mongoose')

const schema = mongoose.Schema ; 


const orderSchema = new schema({
    orderid : {
        type: String , 
        required : true
    } , 
    paymentid : {
        type : String , 
        required : true 
    }, 
    signature :{
        type : String , 
        required : true
    }
})


module.exports  = mongoose.model('orders', orderSchema)