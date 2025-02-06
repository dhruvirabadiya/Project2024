const ErrorHandler = require("../utils/errorHandlers");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel");

exports.addDetalis = catchAsyncError(async (req, res, next) => {
    try {
        const commissionRate = 0.10; // 10% commission rate
        const expectedFees = req.body.expectedfees;
        
        // Calculate the commission amount
        const commissionAmount = expectedFees * commissionRate;
        
        // Calculate the total amount including commission
        const totalAmount = expectedFees + commissionAmount;

        const newData = {
            aadharCardNo: req.body.aadharCardNo,
            city: req.body.city,
            experience: req.body.experience,
            expectedfees: totalAmount,
            accountNumber: req.body.accountNumber,
            ifscCode: req.body.ifscCode,
            bankName: req.body.bankName,
            serviceCategoryId: req.body.serviceCategoryId
        };

        const updatedData = await User.findByIdAndUpdate(req.user.id, {
            $set: newData,
        }, { new: true });

        const roundedTotalAmount = Math.round(totalAmount);

        res.status(200).json({
            success: true,
            user: updatedData,
            roundedTotalAmount: roundedTotalAmount
        });
    } catch (error) {
        console.error("error", error);
        next(error);
    }
});

exports.getAllServiceProviders = catchAsyncError(async (req, res, next) => {
    try {
        const providers = await User.find({ role: 'Service Provider' });
        res.status(200).json({
            success: true,
            providers,
        });
    } catch (error) {
        console.error("error", error);
        next(error);
    }
});

exports.updateAvailability = catchAsyncError(async (req, res, next) => {
    try {
        const serviceProviderId = req.params.id;
        let status = req.body.availability

        const serviceProvider = await User.findById(serviceProviderId);
        serviceProvider.availability = status

        const updatedServiceProvider = await serviceProvider.save();
        res.status(200).json({
            success: true,
            message: "Availability updated successfully",
            serviceProvider: updatedServiceProvider,
        });
    } catch (error) {
        console.error("Error updating availability:", error);
        next(error);
    }
});