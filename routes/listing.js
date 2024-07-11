const express= require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js"); 
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");  //Checking Authentication and Authorization. Go to middleware.js for more info.

const listingController = require("../controllers/listing.js"); //Requring from controllers the whole file.
const multer = require('multer');  // Used to parse the data as a file in the url and send it to the backend.
const {storage} = require("../cloudConfig.js"); //This requires the storage module so that whatever comes as a file from url, it stores it on the CLOUD directly.
const upload = multer({ storage }); //Now this deos the work of storing the file on the cloud .




//INDEX route and CREATE Route
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,        
        wrapAsync( listingController.createListing)
    );
    
//Create/ADD a new Listing.
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync( listingController.showListing))    //Show a Listing route
    .put(                             
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing));



//Edit route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);


module.exports = router;