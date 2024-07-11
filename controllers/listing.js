const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');  //Used to get coordinates of the location of the porperty.
const mapToken = process.env.MAP_TOKEN;                             // Map token is taken from mapbox.
const geocodingClient = mbxGeocoding({accessToken: mapToken});      // Refer mapbox sdk forward geocoding github repo.

const {validateListing} = require("../middleware.js");
const methodOverride = require("method-override");
const wrapAsync = require("../utils/wrapAsync.js");   // So that we dont need to use try and catch agian and again.
const ExpressError = require("../utils/ExpressError.js");  //Gives us the STATUS code and the occured error message 
const {listingSchema, reviewSchema} = require("../schema.js");  // Validating Schema Through JOI and requiring.
const ejsmate = require("ejs-mate"); // It is a module that helps in ejs templating . it enhances templating.
const Review = require("../models/review.js");
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require("passport-local");
const User = require("../models/user.js");

module.exports.index =  async (req,res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res) =>{
    res.render("listings/new.ejs");
};
module.exports.showListing = async(req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate: {
            path:"author"
        },
    })
    .populate("owner");

    res.render("listings/show.ejs", {listing});
    console.log(listing);
};

module.exports.createListing = async(req,res) =>{
    //The code is to get map coordinates for the location of the property.
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,   // Passes the location as a query.
        limit: 1   //limit of the responses . Obvio we want only one pair of coordinates.
    })
    .send()

    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, "..." , filename);

    let result= listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    const newListing = new Listing(req.body.listing);
    //req.user stores the information of the current user .
    //Thus we give the id of the new listing to the owner of that particullar account.
    //Hence all the listings made by that account will be shown under his name.
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");

};

module.exports.renderEditForm =  async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    console.log(listing);
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250/q_auto:low");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing =  async (req,res) =>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file!== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");

};


