const express= require('express');
const router = express.Router({mergeParams: true});
const ExpressError = require("../utils/ExpressError.js"); 
const { reviewSchema } = require("../schema.js"); // Validating Schema Through JOI and requiring.
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


//Reviews Post route
router.post("/",validateReview, isLoggedIn, wrapAsync(reviewController.createReview ));

//Review Delete Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;