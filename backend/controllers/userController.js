const ErrorHandler = require("../utils/errorHandlers");
const catchAsyncError = require("../middleware/catchAsyncError");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("../utils/cloudinary");
const Booking = require("../models/bookModel");
const servicesCategoryModel = require("../models/servicesCategoryModel");

//Register user
exports.userRegister = catchAsyncError(async (req, res, next) => {
    try {
        const { name, email, mobile, address, password, role} = req.body;
        let profileImage = 'https://img.hotimg.com/profile.png';

        if (!name) return next(new ErrorHandler('Name is required', 400, 'name'));
        if (!email) return next(new ErrorHandler("Email is required", 400, 'email'));
        if (!mobile) return next(new ErrorHandler("Mobile is required", 400, 'mobile'));
        if (!address) return next(new ErrorHandler("Address is required", 400, 'address'));
        if (!password) return next(new ErrorHandler("Password is required", 400, 'password'));
        if (!role) return next(new ErrorHandler("Role is required", 400, 'role'));

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorHandler('Email is already registered', 400, 'email'));
        }
        
        const user = await User.create({
            name,
            email,
            mobile,
            address,
            password,
            role,
            profileImage
        });

        const token = user.getJWTToken();
        await user.saveToken(token);

        sendToken(user, 201, res);
    } catch (error) {
        console.log("error", error);
        next(error);
    }

});

//login user
exports.userLogin = catchAsyncError(async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return next(new ErrorHandler("Please Enter Email & Password and Role", 400));
        }

        const user = await User.findOne({ email }).select("+password +role");

        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        if (!user.role.includes(role)) {
            return next(new ErrorHandler("Invalid role", 401));
        }

        const token = user.getJWTToken();
        await user.saveToken(token);

        sendToken(user, 200, res);
    } catch (error) {
        console.error("error", error);
        next(error);
    }
});

//Logout user
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

//Forgot Password Token
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not Found", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `http://localhost:3000/resetpassword/${resetToken}`;

    const message = `
        <p>Hello ${user.name},</p>
        <p>You have requested to reset your password. Please click the link below to reset it:</p>
        <p><a href="${resetPasswordUrl}" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>If you have not requested this email, please ignore it.</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: `Password Recovery`,
            html: message,
        });

        console.log(`Email sent to ${user.email} successfully`);

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        });
        console.log(resetToken);
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpier = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    try {
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");
        
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpier: { $gt: Date.now() },
        });

        if (!user) {
            return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 400));
        }

        if (req.body.password !== req.body.confirmPassword) {
            return next(new ErrorHandler("Password does not matched", 400));
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpier = undefined;

        await user.save();
        res.status(200).json({
            success: true,
            message: "Password reset"
        });
        
    } catch (error) {
        console.error("error", error);
        next(error);
    }

});

// GET User Detail
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate('serviceCategoryId');

        const userDetails = {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            address: user.address,
            profileImage: user.profileImage,
            city: user.city,
            country: user.country,
            zipcode: user.zipcode,
            aboutme: user.aboutme,
            aadharCardNo: user.aadharCardNo,
            experience: user.experience,
            expectedfees: user.expectedfees,
            accountNumber: user.accountNumber,
            ifscCode: user.ifscCode,
            bankName: user.bankName,
            serviceCategory: user.serviceCategoryId ? user.serviceCategoryId.name : 'Not Specified',
        }

        res.status(200).json({
            success: true,
            user: userDetails,
        });
    } catch (error) {
        console.error("error", error);
        next(error);
    }
});

// update User password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("+password");

        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Old password is incorrect", 400));
        }

        if (req.body.newPassword !== req.body.confirmPassword) {
            return next(new ErrorHandler("password does not match", 400));
        }

        user.password = req.body.newPassword;

        await user.save();
        res.status(200).json({
            success: true,
            message: "Password update successfull"
        });
    } catch (error) {
        console.error("error", error);
        next(error);
    }
});

// update User Profile
exports.updateProfile = catchAsyncError(async (req, res, next) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            address: req.body.address,
            city: req.body.city,
            country: req.body.country,
            zipcode: req.body.zipcode,
            aadharCardNo: req.body.aadharCardNo,
            experience: req.body.experience,
            expectedfees: req.body.expectedfees,
            accountNumber: req.body.accountNumber,
            ifscCode: req.body.ifscCode,
            bankName: req.body.bankName,
            aboutme: req.body.aboutme,
        };

        // Update user data
        const updatedUser = await User.findByIdAndUpdate(req.user.id, {
            $set: newUserData,
        }, { new: true });

        res.status(200).json({
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error:", error);
        next(error);
    }
});

//update profile Image
exports.updateProfileImage = catchAsyncError(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const profileImage = req.file;

        if (!profileImage) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded",
            });
        }

        // Upload the image to Cloudinary
        const result = await cloudinary.uploader.upload(profileImage.path);

        // Update only the profileImage field of the user object
        user.profileImage = result.secure_url;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            user: {
                profileImage: user.profileImage,
            }
        });
    } catch (error) {
        console.error("Error", error);
        next(error);
    }
});

// Provider details category wise
exports.provider = catchAsyncError(async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }
        const providers = await User.find({ serviceCategoryId: categoryId });
        const findScrvice = await servicesCategoryModel.findOne({_id: categoryId})
        res.status(200).json({
            success: true,
            serviceProvider: providers,
            categoryDetail: findScrvice,
        });
    } catch (error) {
        console.error("error", error);
        next(error);
    }
});

//fetch booking details
exports.booking = catchAsyncError(async (req, res, next) => {
    try{
        const userId = req.params.userId;

        const bookings = await Booking.find({ userId }).populate('serviceProviderId');

        const bookedProviders = bookings.map(booking => ({
            serviceProvider: booking.serviceProviderId,
            startDate: booking.startDate,
            time: booking.time,
            description: booking.description
        }));
        res.status(200).json({
            success: true,
            bookedProviders
        })
    } catch (error) {
        console.error("error", error);
        next (error);
    }
});