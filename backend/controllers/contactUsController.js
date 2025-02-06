const catchAsyncError = require("../middleware/catchAsyncError");
const Contact = require("../models/contactusModel");

exports.contact = catchAsyncError( async (req, res, next ) => {
    try {
        const { name, email, message } = req.body;
        const contact = await Contact({ name, email, message });
        await contact.save();
        res.status(200).json({
            success: true,
            contact
        });
    } catch (error) {
        console.error("Error:", error);
        next(error);
    }
});


