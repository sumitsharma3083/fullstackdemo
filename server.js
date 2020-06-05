const express = require('express')
const app     = express();
const bodyParser = require('body-parser')
const ejs  = require('ejs')
const port = process.env.PORT  || 5000 ; 
const mongoose = require('mongoose')
const razorpay = require('razorpay')
const keyid = 'rzp_test_0GlX8PetLfsnXi'
const keysecret = 'XZaxvzdwmrHiRVQOuF9bwsVP'
const Product = require('./model/product')
const Order   = require('./model/order')
var instance = new razorpay({
 key_id: keyid,
 key_secret: keysecret,
})



app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended : false}))


app.use((req,res , next)=>{
     Product.find().then((result) => {
           if(result.length  == 0)
           {
               var newproduct = new Product({
                productname : "full sleeve tshirt", 
                productprice : 10
            }) 
             newproduct.save()
           }
     }).catch((err) => {
           console.log(err)
     });
      
     next();
})

 app.get('/', (req,res)=>{ 
       res.render('index')
 }) 
 app.get('/products', (req,res)=>{
        Product.find().then((data) => {
                
                 res.render('products', {product: data[0]})
        }).catch((err) => {
                console.log(err);
                
        });
 })


 app.post('/checkout' , (req,res)=>{
        
       var shippingPrice ; 
       var totalPrice ; 
       var orderId ; 
       Product.findOne({_id : req.body.productid}).then((product) => {
             if(product.productprice < 100)
             {
                     shippingPrice = 0
             }else{
                    shippingPrice = 40 ;       
             }
               totalPrice = product.productprice + shippingPrice ;

               var options = {
                  amount: totalPrice*100,  // amount in the smallest currency unit
                  currency: "INR",
                  receipt: "order_rcptid_11",
                  payment_capture: '0'
                };

                 instance.orders.create(options, (err, order)=>{
                       orderId = order.id ;
                       totalPrice = order.amount;
                       res.render('checkout' , {product : product , shipping : shippingPrice, total :  order.amount , orderid :  orderId, productid : product._id})
                 })
               
         

       }).catch((err) => {
               console.log(err)
       });
      
 })


 app.post('/success' , (req,res)=>{
    var razorpay_order_id = req.body.razorpay_order_id
    var razorpay_payment_id = req.body.razorpay_payment_id
    var razorpay_signature = req.body.razorpay_signature 
    var productId = req.body.productid ;

    var order = new Order({
      orderid :razorpay_order_id , 
      paymentid : razorpay_payment_id , 
      signature : razorpay_signature
      })
         order.save();  
         res.send("Payment is successful..")
 })

  app.get('/orders', (req,res)=>{
         
      Order.find().then((orders) => { 
            console.log(orders)
            res.render('order' , {myorders : orders} )
      }).catch((err) => {
            
      });
     
  })

  app.get('/refund/:paymentid', (req,res)=>{
       const paymentid =  req.params.paymentid 
           
  }) 


  app.get('/login' , (req,res)=>{
    res.render('login')
  })

  app.get('/register', (req,res)=>{
         res.render("register")
  })

 app.listen(port ,  ()=>{
    mongoose.connect('mongodb+srv://sumit:sumit123@cluster0-x042n.mongodb.net/demopaymentapp?retryWrites=true&w=majority').then(() => {
          console.log("DATABASE CONNECTED.")
    }).catch((err) => {
          console.log(err)
    });
})