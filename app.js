require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const flash = require("connect-flash");
const nodemailer = require("nodemailer")
const findOrCreate = require("mongoose-findorcreate");
const Verifier = require("email-verifier");


const app = express();
// const _ = require('lodash');


// console.log(process.env.API_KEY);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://dineshbankuru2004:VCKfpOEP7abGodmS@cluster0.5ptp29j.mongodb.net/userDB" , {useNewUrlParser : true});


const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  username: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User" , userSchema);


passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username, name: user.name });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });


  let verifier = new Verifier(process.env.EMAIL_API);


 var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'dineshbankuru2004@gmail.com',
        pass: process.env.PASS
    }
});


let otp='';
let mail='';

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://login-page-1rwv.onrender.com/auth/google/success",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    //console.log(profile);
    User.findOne({googleId: profile.id}).then(function(foundUser){
        
        if(!foundUser)
        {
            //console.log(profile.emails[0].value);
           


            var mailOptions = {
                from:"dineshbankuru2004@gmail.com",
                to: profile.emails[0].value,
                subject: "Welcome aboard!",
                text: `Hi !

Welcome to the team! We’re thrilled to have you here. We know you’re going to be a valuable asset to our company and can’t wait to see what you accomplish.
                    
Best regards,
Dinesh Bankuru.
`

            };

            transporter.sendMail(mailOptions , function(err, info){
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    console.log("Email sent : "+info.response);
                }
            });
            //console.log(profile);
        }
        else
        {
            //console.log("Found");
        }
    })
    .catch(function(err){
        console.log(err);
    })

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));




var mes="";

app.get("/",function(req,res){
    res.render("home", {message: mes});
    mes="";
});

app.get("/auth/google",
    passport.authenticate("google" , { scope: ['profile' , 'email'] })
);

app.get('/auth/google/success', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect Success page.
    res.redirect('/success');
});



app.get("/success" , function(req,res){
    if(req.isAuthenticated())
    {
        mes="";
        res.render("success");
    }
    else
    {
        res.render("home", {message: mes});
    }
});


app.get("/invalid" , function(req,res){
    mes="!!!Invalid Credentials";
    res.redirect("/");
})


app.get("/logout",function(req,res){
    req.logout(function(){});
    res.redirect("/");
});

app.post("/otp" , function(req,res){
    //console.log(req.body.otp);
    if(otp == req.body.otp)
    {
        var mailOptions = {
            from:"dineshbankuru2004@gmail.com",
            to: mail,
            subject: "Welcome aboard!",
            text: `Hi !
    
Welcome to the team! We’re thrilled to have you here. We know you’re going to be a valuable asset to our company and can’t wait to see what you accomplish.


Best regards,
Dinesh Bankuru.
`
            };

        transporter.sendMail(mailOptions , function(err, info){
            if(err)
            {
                console.log(err);
            }
            else
            {
                console.log("Email sent : "+info.response);
            }
        });
        res.redirect("/success");
    }
    else
    {
        mes="!!!Otp Incorrect";
        User.deleteOne({username: mail}).then(function(){
            //console.log("Deleted");
        })
        .catch(function(err){
            console.log(err);
        })
        res.redirect("/");
    }
})


app.post("/signup", function(req,res){
    mail = req.body.username;
    User.register({username: req.body.username} , req.body.password).then(function(user){
        passport.authenticate("local")(req,res,function(){

            mes="";

//             verifier.verify(mail , (err, data) => {
//                 if(err)
//                 {
//                     mes="Check your email again";
//                     console.log(err);
//                     res.redirect("/");
//                 }
//                 else if(data.dnsCheck === 'true' && data.freeCheck === 'true' && data.smtpCheck === 'true'){
//                 console.log(data);

//                 var mailOptions = {
//                 from:"dineshbankuru2004@gmail.com",
//                 to: mail,
//                 subject: "Welcome aboard!",
//                 text: `Hi !
    
// Welcome to the team! We’re thrilled to have you here. We know you’re going to be a valuable asset to our company and can’t wait to see what you accomplish.
                        
// Best regards,
// Dinesh Bankuru.`
//                 };
    
//             transporter.sendMail(mailOptions , function(err, info){
//                 if(err)
//                 {
//                     console.log(err);
//                 }
//                 else
//                 {
//                     console.log("Email sent : "+info.response);
//                 }
//             });
    
//                 res.redirect("/success");
//         }
//         else
//         {
//             mes="Check your email again";
//                     console.log(err);
//                     res.redirect("/");
//         }

//             });



        var min = 100000;
        var max = 999999;
        otp = Math.floor(Math.random() * (max-min+1)) + min;

        var mailOptions = {
            from:"dineshbankuru2004@gmail.com",
            to: mail,
            subject: "OTP Verification",
            text: `Your Otp is : `+otp+

`
Best regards,
Dinesh Bankuru.
`
            };

        transporter.sendMail(mailOptions , function(err, info){
            if(err)
            {
                console.log(err);
            }
            else
            {
                console.log("Email sent : "+info.response);
            }
        });
            res.render("optPage" , {mail: mail});

            // res.redirect("/success");
        });

        })

        .catch(function(err)
        {
            //console.log(err);
            mes="!!!User already exist";
            res.redirect("/");
        })

});



app.post("/login" , function(req,res){
    const user = new User({
        username: req.body.email,
        password: req.body.password
    });


    req.login(user , function(err){
        if(err)
        {
            console.log(err);
            res.render("home", {message: "!!!Invalid Credentials"});
        }
        else{
            passport.authenticate("local" , { failureRedirect: '/invalid' , failureMessage: true })(req,res,function(){
                mes="";
                res.redirect("/success");
            })
        }
    });
});










const PORT = process.env.PORT || 3000;


app.listen(PORT, function() {
    console.log("Server started!!");
});
  

  

