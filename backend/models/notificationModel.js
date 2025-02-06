const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  message: {
    type: String,
  },
  name: {
    type: String,
  },
  userProfileImage: {
    type: String,
  },
  type: {
    type: String,
    enum: ['bookingRequest', 'acceptance', 'rejection', 'adminNotification'],
  },
  accountNo: {
    type: Number,
  },
  ifscCode: {
    type: String,
  },
  payment: {
    type: Number,
  },
  status: {
    type: Number,
    enum: [0, 1, 3, 4, 5, 6, 7, 8, 9, 2, 10],
    default: 0
  },
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);

