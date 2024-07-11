const User = require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl, validateListing} = require("../middleware.js");
const Listing = require("../models/listing.js");
const methodOverride = require("method-override");
const wrapAsync = require("../utils/wrapAsync.js");   // So that we dont need to use try and catch agian and again.
const ExpressError = require("../utils/ExpressError.js");  //Gives us the STATUS code and the occured error message 
const {listingSchema, reviewSchema} = require("../schema.js");  // Validating Schema Through JOI and requiring.
const ejsmate = require("ejs-mate"); // It is a module that helps in ejs templating . it enhances templating.
const Review = require("../models/review.js");
const flash = require('connect-flash');
const session = require('express-session');

const LocalStrategy = require("passport-local");


module.exports.renderSignupForm = (req,res) => {
    res.render("users/signup.ejs");
};
module.exports.signup = async(req,res) => {
    try{
    let {username, email, password} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);  //Stores the data and password in hashed form securely so that it can be used in authentication.
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if(err){
            return next();
        }
        req.flash("success", "Welcome to Wanderlust");
        res.redirect("/listings");
    });

    }catch(e){
        req.flash("error", e.message);
        // req.flash("success", "Well done, you are successfully regsitered!");
        res.redirect("/signup");

    }
};

module.exports.renderLoginForm =  (req,res) => {
    res.render("users/login.ejs");
};

module.exports.login = async(req,res) => {
    req.flash("success", "Welcome to Wanderlust, You are successfully Logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};
module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err){
            return next();
        }
        req.flash("success", "Succesfully Logged out! Wanderlust will wait back to see you again!");
        res.redirect("/listings");
    });
};