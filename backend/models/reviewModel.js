const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: String,
    email: String,
    comment: String,
    starRating: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', reviewSchema);