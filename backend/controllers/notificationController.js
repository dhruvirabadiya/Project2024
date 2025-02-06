const catchAsyncError = require("../middleware/catchAsyncError");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const Booking = require("../models/bookModel");
const mongoose = require('mongoose');

// Send Notification ST to SP
exports.sendNotification = catchAsyncError(async (data) => {
  try {
    if (!(data.bookingId instanceof mongoose.Types.ObjectId)) {
      bookingId = mongoose.Types.ObjectId(data.bookingId);
    }

    const user = await User.findById(data.userId);
    const serviceProvider = await User.findById(data.serviceProviderId);

    if (!user || !serviceProvider) {
      throw new Error('User or service provider not found');
    }

    const name = user.name;
    const notificationMessage = `New Booking 
          Start Date: ${data.bookingDetails.startDate},
          End Date: ${data.bookingDetails.endDate},
          Start Time: ${data.bookingDetails.startTime},
          End Time: ${data.bookingDetails.endTime}`;
    const userProfileImage = user.profileImage;

    const notification = new Notification({
      senderId: data.userId,
      receiverId: data.serviceProviderId,
      message: notificationMessage,
      name: name,
      userProfileImage: userProfileImage,
      type: 'bookingRequest',
      bookingId: data.bookingId
    });
    await notification.save();

    console.log(`Notification sent to service provider ${data.serviceProviderId}`);
  } catch (error) {
    console.error('Error sending notification', error);
  }
});

// Process-notification
exports.processNotification = catchAsyncError(async (req, res, next) => {
  try {
    const { notificationId, action } = req.params;

    const notification = await Notification.findOne({ _id: notificationId });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.status !== 0) {
      return res.status(400).json({ success: false, message: 'Notification has already been processed' });
    }

    const serviceProvider = await User.findById(notification.receiverId); // Retrieve service provider details

    if (!serviceProvider) {
      return res.status(404).json({ success: false, message: 'Service provider not found' });
    }

    if (action === 'accept' && notification.type === 'bookingRequest') {
      const bookingDetails = await Booking.findById(notification.bookingId);

      if (!bookingDetails) {
        return res.status(404).json({ success: false, message: 'Booking details not found' });
      }

      // Create a new notification for Service Taker
      const userNotification = new Notification({
        senderId: notification.receiverId, // Service provider
        receiverId: notification.senderId, // User who requested the service
        payment: bookingDetails.amount,
        message: `Your booking request has been accepted by ${serviceProvider.name}`,
        type: 'acceptance',
        status: 4
      });
      await userNotification.save();

      // Update the original notification's status or other relevant fields
      notification.status = 1; // Set status 1 for the service provider's notification
      await notification.save();

      res.status(200).json({ success: true, message: 'Notification accepted' });
    } else if (action === 'reject' && notification.type === 'bookingRequest') {
      // Create a new notification for the user who requested the service
      const userNotification = new Notification({
        senderId: notification.receiverId, // Service provider
        receiverId: notification.senderId, // User who requested the service
        message: 'Your booking request has been rejected',
        type: 'rejection', // Set the type of notification
        status: 9 // Set status 9 for the user notification
      });
      await userNotification.save();

      // Update the original notification's status or other relevant fields
      notification.status = 10; // Set status 1 for the service provider's notification
      await notification.save();

      res.status(200).json({ success: true, message: 'Notification rejected' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action or notification type' });
    }
  } catch (error) {
    console.error("Error processing notification:", error);
    next(error);
  }
});

// Show notification service taker
exports.serviceTaker = catchAsyncError(async (req, res, next) => {
  try {

    const notifications = await Notification.find({ receiverId: req.user._id, status: { $in: [1, 4, 9] } });
    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    next(error);
  }
});

// Show notification Admin
exports.getNotificationAdmin = catchAsyncError(async (req, res, next) => {
  try {
    const adminId = req.params.adminId;
    const notifications = await Notification.find({ receiverId: adminId, status: { $in: [3, 5, 6] } });
    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    next(error);
  }
});

// Show Notification SP
exports.serviceProvider = catchAsyncError(async (req, res, next) => {
  try {
    const notifications = await Notification.find({ receiverId: req.user._id, status: { $in: [0, 7] } }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    next(error);
  }
});

// Delete the notification
exports.deleteNotification = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedNotification = await Notification.findOneAndDelete({ _id: id  });

    if (!deletedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    return res.status(200).json({ message: 'Notification deleted successfully', deletedNotification });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});