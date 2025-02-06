const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    statusCode: {
        type: Number,
        default: 0  // Default status code is 0
    }
});
module.exports = mongoose.model("Contact", contactSchema);