const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js"); // Validating Schema Through JOI and requiring.
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

module.exports.createReview = async(req,res) =>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;  // Saves the id of the current user with each rating.
    listing.reviews.push(newReview); 
    await newReview.save();
    await listing.save();
    console.log("New review Saved");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async(req,res) => {
    let {id, reviewId} = req.params;

    //This is finding the review through $PULL operator in mongoose, This will delete the review from the reviews array when matched with the same reviewID.
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Listing.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
};