const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandlers");
const Review = require("../models/reviewModel");

// Add Review
exports.postReview = catchAsyncError(async (req, res, next) => {
    try {
        const { name, email, comment, starRating } = req.body;

        if (!name) return next(new ErrorHandler('Name is required', 400, 'name'));

        const newReview = await Review.create({
            name,
            email,
            comment,
            starRating
        })

        await newReview.save();

        res.status(200).json({
            success: true,
            message: "Review stored successfully",
        });
    } catch (error) {
        console.log("error", error);
        next(error);
    }
});

// Get All Review
exports.getReviews = catchAsyncError(async (req, res, next) => {
    try {
        const reviews = await Review.find();

        res.status(200).json({
            success: true,
            reviews,
        });
    } catch (error) {
        console.error("error", error);
        next(error);
    }
});

// Delete Review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
    try {
        const deleteReview = await Review.findByIdAndDelete(req.params.id);

        if (!deleteReview) {
            return next(
                new ErrorHandler(`Review does not exist with Id: ${req.params.id}`, 400)
            );
        }
        res.status(200).json({
            success: true,
            message: "Review Deleted Successfully",
        });
    } catch (error) {
        console.error("error", error);
        next(error);
    }
});