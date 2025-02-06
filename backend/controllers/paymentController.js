const catchAsyncError = require("../middleware/catchAsyncError");
const Notification = require("../models/notificationModel");
const Booking = require("../models/bookModel");
const User = require("../models/userModel");
const Razorpay = require('razorpay');
const mongoose = require("mongoose");

const razorpayInstance = new Razorpay({
  key_id: "rzp_test_tokakj4cCUA8Py",
  key_secret: "1SpXJ2lPomzS7GkN5kkLfSJH"
});

// Function to create Razorpay order
const createRazorpayOrder = (options) => {
  return new Promise((resolve, reject) => {
    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        resolve(order);
      } else {
        reject(err);
      }
    });
  });
};

// User payment to Admin
exports.makePayment = catchAsyncError(async (req, res, next) => {
  try {
    let { notificationId } = req.params;

    // Check if notificationId is an object and extract the _id if needed
    if (typeof notificationId === 'object' && notificationId !== null) {
      notificationId = notificationId._id;
    }

    console.log('Notification ID:', notificationId);

    // Check if notificationId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format',
      });
    }

    const notification = await Notification.findOne({ _id: notificationId });
    console.log('Notification:', notification);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const serviceProvider = await User.findById(notification.senderId); // Retrieve service provider details

    if (!serviceProvider) {
      return res.status(404).json({ success: false, message: 'Service provider not found' });
    }

    const { amount, currency, userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required for payment."
      });
    }

    const minimumAmount = 100;
    if (amount < minimumAmount) {
      return res.status(400).json({
        success: false,
        message: "The amount must be at least INR 1.00."
      });
    }

    // Create Razorpay order
    const razorpayOptions = {
      amount, // amount in paise
      currency,
      receipt: `receipt_${userId}`,
    };
    const order = await createRazorpayOrder(razorpayOptions);

    // Send notification to admin
    const user = await User.findById(userId);

    await Notification.create({
      senderId: userId,
      receiverId: '65d866bfe189d4b942e1f3c4',
      name: user.name,
      payment: amount,
      message: `Payment received from user ${user.name}`,
      type: 'adminNotification',
      status: 5,
    });

    // Update notification status to 2
    await Notification.findByIdAndUpdate(notificationId, { status: 2 }, { new: true });

    // Create a new notification for the admin
    const adminNotification = new Notification({
      senderId: notification.receiverId, // Service provider
      receiverId: '65d866bfe189d4b942e1f3c4', // Admin user ID 
      serviceProviderId: serviceProvider._id,
      message: `Service taker ${user.name} pay ${amount}`,
      name: serviceProvider.name,
      accountNo: serviceProvider.accountNumber,
      ifscCode: serviceProvider.ifscCode,
      payment: amount, // Use the booking amount from the booking table
      type: 'adminNotification', // Set the type of notification
      status: 3 // Set status 3 for the admin notification
    });

    await adminNotification.save(); // Save the admin notification

    res.status(200).json({
      success: true,
      orderId: order.id, // Send the order ID back to the client
    });
  } catch (error) {
    console.error("Error payment:", error);
    next(error);
  }
});

// Admin payment to Service Provider
exports.adminPayment = catchAsyncError(async (req, res, next) => {
  try {
    let { notificationId } = req.params;

    const { amount, currency } = req.body;
    const comision = Math.ceil(amount * 0.1);
    const rmainAmount = amount - comision;

    const razorpayOptions = {
      amount: rmainAmount,// amount in paise
      currency,
      receipt: `receipt_${notificationId}`,
    };

    const order = await createRazorpayOrder(razorpayOptions);

    res.status(200).json({
      success: true,
      orderId: order.id, // Send the order ID back to the client
    });
    
    await Notification.findByIdAndUpdate({ _id: notificationId }, {
      $set: {
        status: 6,
        payment: rmainAmount,
        message: 'Pay successfully'
      }
    }, { new: true });
  } catch (error) {
    console.error("Error: ", error);
    next(error);
  }
});
