const ErrorHandler = require("../utils/errorHandlers");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");

// User
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    const user = await User.findById(decodedData.id);   

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("error", error);
    return next(new ErrorHandler("Invalid token", 401));
  }
});


// Admin
exports.isAuthenticatedAdmin = catchAsyncError(async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const admin = await Admin.findById(decodedData.id);
        
        if (!admin) {
            return next(new ErrorHandler("User not found", 404));
        }

        req.admin = admin;
        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid token", 401));
    }
});
