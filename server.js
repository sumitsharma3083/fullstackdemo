     // Packages
const express = require('express')
const app     = express();
const bodyParser = require('body-parser')
const ejs  = require('ejs')
const port = process.env.PORT  || 5000 ; 
const mongoose = require('mongoose')
const razorpay = require('razorpay')
const cookieParser = require('cookie-parser')
const session  = require('express-session')
const mongodbSession = require('connect-mongodb-session')(session) 
const isLogged = require('./config/auth')

const { check, validationResult } = require('express-validator')











    //Models 
const Product = require('./model/product')
const User   = require('./model/User')














    // Razorpay credentials .
const keyid = 'rzp_test_0GlX8PetLfsnXi'
const keysecret = 'XZaxvzdwmrHiRVQOuF9bwsVP'

var instance = new razorpay({
 key_id: keyid,
 key_secret: keysecret,
})














const store = new mongodbSession({
      uri : "mongodb+srv://sumit:sumit123@cluster0-x042n.mongodb.net/demopaymentapp?retryWrites=true&w=majority" , 
      collection : "mysessions"
})










app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended : false}))
app.use(cookieParser())
app.use(session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false , 
      store :  store
    }))




 
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


















  

 app.get('/', isLogged , (req,res)=>{  
     res.render('index', {islogged  : req.session.loggedIn, user : req.session.user })
 }) 


 














 app.get('/products', (req,res)=>{ 
     
       
        Product.find().then((data) => {
                 res.render('products', {product: data[0] , islogged  : req.session.loggedIn})
        }).catch((err) => {
                console.log(err);
                
        });
 })




















 app.post('/checkout' , isLogged  ,(req,res)=>{
        
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
                       res.render('checkout' , {product : product , shipping : shippingPrice, total :  order.amount , orderid :  orderId, productid : product._id , islogged  : req.session.loggedIn})
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

     User.findOne({username : req.session.user.username}).then((user) => {
            var orders = user.orders 
            var orderObj = {
                  orderid : razorpay_order_id, 
                  paymentid: razorpay_payment_id, 
                  signature : razorpay_signature
            }
             orders.push(orderObj)

             user.save();
     }).catch((err) => {
            console.log(err);
            
     });
         res.send("Payment is successful..")
 })





















  app.get('/orders', isLogged , (req,res)=>{
     User.findOne({username : req.session.user.username}).then((user) => {  
           console.log(user.orders)
      res.render('order' , { orders : user.orders ,islogged  : req.session.loggedIn} )
     }).catch((err) => {
            console.log(err);
            
     });

      
     
     
  })


















  app.get('/refund/:paymentid', (req,res)=>{
       const paymentid =  req.params.paymentid 
           
  }) 


















  app.get('/login' , (req,res)=>{
    res.render('login' , {islogged : req.session.isLogged})
  })

 













  app.post('/login', (req,res,next)=>{

     const { username , password } = req.body 

     User.findOne({username : username }).then((result) => {
            if(result)
            {
                  const storedpassword = result.password 
                  if(storedpassword == password)
                  {
                         req.session.user = result
                         req.session.loggedIn= true 
                         res.send("login successfull")
                  }
                  else{
                        res.send("login failed")
                  }
            }
            else{
                    res.send("no such user found") 
            }
             
     }).catch((err) => {
            console.log(err);
            
     });

})

 




































  app.get('/register', (req,res)=>{
         res.render("register", {islogged  : req.session.loggedIn})
  })



















  app.post('/register', [ 
        check('username').notEmpty() , check('password').isLength({min : 5}) 
  ]   , (req,res)=>{  

        const error = validationResult(req) 

        console.log(error.array()) ;
      //   const { username , password } = req.body 
         
      //   User.findOne({username : username}).then((result) => {
      //            if(!result)
      //            {
      //             const newuser = new User({
      //                   username : username , 
      //                   password : password
      //             })
      //             newuser.save()   
      //            }
      //   }).catch((err) => {
      //          console.log(err);
               
      //   }); 
      //    res.redirect('/register')
 })






















 app.get('/logout', (req,res)=>{
   req.session.destroy((err)=>{
         if(err)
         {
               throw err ;
         }
          
         res.redirect('/login')
   })

 })



















 app.listen(port ,  ()=>{
    mongoose.connect('mongodb+srv://sumit:sumit123@cluster0-x042n.mongodb.net/demopaymentapp?retryWrites=true&w=majority').then(() => {
          console.log("DATABASE CONNECTED.")
    }).catch((err) => {
          console.log(err)
    });
})