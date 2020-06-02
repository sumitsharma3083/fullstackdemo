const express = require('express')
const app     = express();
const bodyParser = require('body-parser')
const ejs  = require('ejs')
const port = process.env.PORT  || 5000 ; 
// var sha_256 = require('crypto-js/hmac-sha256')

const razorpay = require('razorpay')
const keyid = 'rzp_test_0GlX8PetLfsnXi'
const keysecret = 'XZaxvzdwmrHiRVQOuF9bwsVP'

var instance = new razorpay({
 key_id: keyid,
 key_secret: keysecret,
})

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended : false}))

 app.get('/', (req,res)=>{ 
     res.render('index')
      
 }) 

  app.get('/pay', (req,res)=>{
        res.render('payment')
  })

 app.get('/proceed', (req,res)=>{ 
     
       var options = {
        amount: 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11",
        payment_capture: '0'
      };
       
      instance.orders.create(options , (err, order)=>{
           res.render('payment', {order})
      })
 })

 app.post('/success' , (req,res)=>{
    var razorpay_order_id = req.body.razorpay_order_id
    var razorpay_payment_id = req.body.razorpay_payment_id
    var razorpay_signature = req.body.razorpay_signature
    
    res.send("Payment is successful..")
 })


 app.listen(port ,  ()=>{
    console.log("Server is running .")
})