const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },
        image: {
            type: Array,
        },
        description1: {
            type: String,
        },
        description2: {
            type: String,
        },
        description3: {
            type: String,
        },
        description4: {
            type: String,
        },
        description5: {
            type: String,
        },
        description6: {
            type: String,
        },
        serviceProviders: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    { timestamps: true }
);

module.exports = mongoose.model("ServiceCategory", serviceCategorySchema);