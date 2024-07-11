const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js"); 
const { listingSchema, reviewSchema } = require("./schema.js"); // Validating Schema Through JOI and requiring.


//This method is used to Validate the schema of the database .
//Suppose if you didnt enter or enter some wrong values which goes against the Schema then it will give you an error message.
module.exports.validateListing = (req,res,next) => {
    let {error}= listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){     //req.isAuthenticated() is a passport function taht automatically detects if user is logged in or not.
        req.session.redirectUrl = req.originalUrl; // Every page has a session so we create a variable redirectUrl and assign the value of the path where the user was trying to go.
        //Suppose in create new listing, then login page pooped up and then if we login/signup, then we redirect to the create new listings page directly.
        req.flash("error", " You must be logged in to do this!");
        return res.redirect("/login");
    }
    next();
};


//Since above we created the redirectUrl variable which stores the Original path where the user wanted to go, But when passport
//authenticates it, it deletes/resets the req.session. and hence it deletes the redirectUrl variable. So we store it in locals ,
//Passport doesnt hve access to these local variables so we can use them . Thus we create a middleware to store them first and then use.
module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl= req.session.redirectUrl;
    }
    next();
};


//This middleware checks whether the owner himself is editing, deleting his/her listing. 
//If some other person though logged in, is making to change it, flash will be called for access denied.
module.exports.isOwner = async(req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "Only owner can make changes to their listings.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};


module.exports.validateReview = (req,res,next) => {
    let {error}= reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};


module.exports.isReviewAuthor = async(req,res,next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "Access Denied! You are not the author of this review.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
