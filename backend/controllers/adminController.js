const ErrorHandler = require("../utils/errorHandlers");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const ServiceCategory = require("../models/servicesCategoryModel");
const Contact = require("../models/contactusModel");
const Review  = require("../models/reviewModel");

//admin login
exports.adminLogin = catchAsyncError(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email && !password) {
            return next(new ErrorHandler("Please Enter Email & Password", 400));
        }

        const admin = await Admin.findOne({ email }).select("+password");

        if (!admin) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        const isPasswordMatched = await admin.comparePassword(password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        const token = admin.getJWTToken();
        await admin.saveToken(token);

        sendToken(admin, 200, res);
    } catch (error) {
        console.error("error", error);
        return next(error);
    }
});

// Get all users(admin)
exports.getAllUser = catchAsyncError(async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("error", error);
        next(error);
    }
});

// Get single user (admin)
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`));
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("error", error);
        next(error);
    }
});

// Delete User --Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return next(
                new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
            );
        }

        res.status(200).json({
            success: true,
            message: "User Deleted Successfully",
        });
    } catch (error) {
        console.error("error", error);
        next(error);
    }
});

// count user and service provider and Services
exports.getRegisteredCounts = catchAsyncError(async (req, res, next) => {
    try {
        // Count registered users
        const registeredUsersCount = await User.countDocuments({ role: 'Service Taker' });

        // Count registered service providers
        const registeredServiceProvidersCount = await User.countDocuments({ role: 'Service Provider' });

        // Count Services
        const serviceCount = await ServiceCategory.countDocuments();

        // count contactus
        const contactCount = await Contact.countDocuments();

        // count Reviews
        const reviewCount = await Review.countDocuments();

        res.status(200).json({
            success: true,
            registeredUsersCount,
            registeredServiceProvidersCount,
            serviceCount,
            contactCount,
            reviewCount,
        });
    } catch (error) {
        next(error);
    }
});

// Service Taker data
exports.getRegisteredServiceTaker = catchAsyncError(async (req, res, next) => {
    try {
        // registered users
        const registeredServiceTaker = await User.find({ role: 'Service Taker' });

        res.status(200).json({
            success: true,
            registeredServiceTaker
        });
    } catch (error) {
        next(error);
    }
});

// Service Provider Data
exports.getRegisteredServiceProvider = catchAsyncError(async (req, res, next) => {
    try {
        // registered users
        const registeredServiceProvider = await User.find({ role: 'Service Provider' });

        res.status(200).json({
            success: true,
            registeredServiceProvider
        });
    } catch (error) {
        next(error);
    }
});

// Get contact us message
exports.getAllMessage = catchAsyncError(async (req, res, next) => {
    try {
        const contacts = await Contact.find();

        res.status(200).json({
            success: true,
            contacts,
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        next(error);
    }
});

exports.updateMessage = catchAsyncError(async (req, res, next) => {
    try {
        const contactId = req.params.id;

        const updatedContact = await Contact.findByIdAndDelete( contactId );

        if (!updatedContact) {
            return next(
                new ErrorHandler(`Contact not found with Id: ${req.params.id}`, 400)
            );
        }

        res.status(200).json({
            success: true,
            updatedContact,
        });
    } catch (error) {
        console.error("Error updating message:", error);
        next(error);
    }
});

//Logout Admin
exports.logout = catchAsyncError(async (req, res, next) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: "Logged Out",
        });
    } catch (error) {
        console.log("error", error);
    }
});

