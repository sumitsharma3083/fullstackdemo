const mongoose = require('mongoose')

const Schema = mongoose.Schema 

const user = new Schema({
    username : {
        type : String , 
        required : true 
    }, 
    password : {
        type : String , 
        required : true 
    }, 
    orders : [
        {
            orderid : {
                type : String
            }, 
            paymentid : {
                type : String 
            },
            signature : {
                type : String 
            }
        }
    ]
})


module.exports  = mongoose.model('users' , user) 