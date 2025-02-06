const mongoose = require("mongoose");
const Schema = require("mongoose");

const bookingSchema = new mongoose.Schema({
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
    description: String,
    amount: Number,
    hour: String,
    serviceProviderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceCategory'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Booking', bookingSchema);