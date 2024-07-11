
//Requiring DOTENV for setting up cloud.
//.env file stores the credentials our api's or cloud related information.
if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}
// console.log(process.env.SECRET);

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync.js");   // So that we dont need to use try and catch agian and again.
const ExpressError = require("./utils/ExpressError.js");  //Gives us the STATUS code and the occured error message 
const {listingSchema, reviewSchema} = require("./schema.js");  // Validating Schema Through JOI and requiring.
const ejsmate = require("ejs-mate"); // It is a module that helps in ejs templating . it enhances templating.
const Review = require("./models/review.js");
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const cookieParser = require('cookie-parser');


/*******************************************  DATABSE CONNECTION  **************************************** */

const dbUrl = process.env.ATLASDB_URL;
main() 
    .then(() =>{
        console.log("Connected to Wanderlust DATABASE!");  
    })
    .catch((err) => {
        console.log(err);
    });


async function main() { 
    await mongoose.connect(dbUrl);  
}

/*__________________________________________________________________________________________________________________________*/
/* **************************************REQUIRING ROUTER FILES ************************************************** */

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

/* ************************************** REQUIRING and CONNECTING COMPLETE  ****************************************** */

//Mongo Sessions: It is used to create sessions in MongoDB online.
//What happens when we use the express sessions , they are only valid for development phase and not for production because, it may cause data leak.
// Hence we use mongo sessions when our project is online.Below is the required syntax.
const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto: {
        secret : process.env.SECRET,  //Encryption
    },
    touchAfter : 24 * 3600,  // It is nothing but updating itself after how many time if session is not updated or database has not interacted with the server.
});

//Nothing just error handling. Seeing what the error is .
store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

//Sessions
const sessionOptions = {   
    store, // Storing the information in the ATLAS DB online through this. Reference from above.
    secret:process.env.SECRET,
    resave: false,    //Saves it only when changes are made. 
    saveUninitialized: true,  //Force saves it whenever any session is started.
    cookie:{        //Cookie expiry date is the deletion of the data stored. For eg. github login: Asks every one week to login again.
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // There default expiry is one week and hence deletes the cookie with the login credentials.
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly:true, // Only for security purposes.
    },
};

app.use(session(sessionOptions));
app.use(cookieParser()); 
app.use(flash());



/*********************************AUTHENTICATION SETTERS START *******************************************   */
app.use(passport.initialize());  //passport.initialize() initialises the authentication module.
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());  //Storing the user details is known as serialize
passport.deserializeUser(User.deserializeUser()); //UNstoring the user details is known as deserialize

/*********************************AUTHENTICATION SETTERS END ********************************************    */



/*********************************FLASH UPS MESSAGES ********************************************    */
//res.locals() method is used to store the variables so that they can be passed on to the ejs pages and then can be used there.
//We cannot use directly the the inbuilt-methods in ejs pages.
app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
/*********************************  FLASH UPS END ********************************************    */


app.use((err, req, res, next) => {
    res.send("something went wrong");
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));   // overriding methods of GET and POST.
app.engine("ejs", ejsmate);   // templating enhancement module.
let port = 8080;

/* *****************************************************MIDDLEWARES AND SETTING PATHS COMPLETE ************************************ */


app.listen(port,  (req,res) => {
    console.log("Listening on Port 8080.");
});


/* **************************************************** ROUTER MAIN CODES START ********************************************* */ 
//Using router to remove the heavy weight of the app.js file
//Listings program in routes/listing.js folder.
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/privacy", (req,res) =>{
    res.render("listings/privacy.ejs");
});
app.use("/terms", (req,res) =>{
    res.render("listings/privacy.ejs");
});
/*****************************************************ROUTING COMPLETE MAIN CODES ON THE ROUTERS **************************** */


app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page not found"));
});
app.use((err,req,res,next) => {
    let {statusCode=500, message="Some Error Occured, Please wait while we resolve!"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {message});
});
