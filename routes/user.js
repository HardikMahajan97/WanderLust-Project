const express= require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js"); 
const User = require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

const userController = require("../controllers/users.js");



router.route("/signup")
    .get(userController.renderSignupForm)  //Render Signup Form
    .post(wrapAsync(userController.signup));  //Signup Route


router.route("/login")
    .get(userController.renderLoginForm) //Render Login form
    .post(saveRedirectUrl,    //Login route.
        passport.authenticate(   //Passport.authenticate() checks whether the user entered the correct details to log in and allows then.
        "local", {
            failureRedirect: "/login",  // If wrong details entered, redirect to the given page.Here login.
            failureFlash: true,
        }),
        userController.login
    );

//Logout Route
router.get("/logout", userController.logout);
module.exports = router;