const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandlers");
const Booking = require("../models/bookModel");
const User = require("../models/userModel");
const { sendNotification } = require("../controllers/notificationController");

exports.bookDetails = catchAsyncError(async (req, res, next) => {
  try {
    const { startDate, endDate, startTime, endTime, description, serviceProviderId, categoryId, userId } = req.body;

    // Parse start date, end date, start time, and end time into Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    // Calculate the duration in milliseconds for each day
    const oneHourMs = 60 * 60 * 1000;
    let totalDurationMs = 0;

    for (let currentDate = startDateObj; currentDate <= endDateObj; currentDate.setDate(currentDate.getDate() + 1)) {
      const startDateTime = new Date(currentDate);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(currentDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const durationInMs = endDateTime - startDateTime;
      totalDurationMs += durationInMs;
    }

    // Convert total duration from milliseconds to hours
    const totalDurationHours = totalDurationMs / oneHourMs;

    console.log('Total Duration in Hours:', totalDurationHours);

    const findUser = await User.findOne({
      token: userId
    });
    
    const serviceProvider = await User.findById(serviceProviderId);
    console.log('ServiceProvider Fees per Hour:', serviceProvider.expectedfees);

    // Ensure serviceProvider.expectedfees is a valid number
    if (isNaN(serviceProvider.expectedfees)) {
      throw new ErrorHandler(400, "Invalid expected fees for the service provider.");
    }

    let fee = serviceProvider.expectedfees * totalDurationHours;
    console.log('Calculated Fee:', fee);

    const newBooking = new Booking({
      startDate,
      endDate,
      startTime,
      endTime,
      description,
      serviceProviderId,
      categoryId,
      userId: findUser._id,
      amount: fee
    });

    const savedBooking = await newBooking.save();
    const bookingId = savedBooking._id;

    const bookingDetails = {
      startDate,
      endDate,
      startTime,
      endTime,
    };

    await sendNotification({userId:findUser._id, serviceProviderId, bookingDetails, bookingId});

    res.status(200).json({
      success: true,
      message: "Order is booked",
    });
  } catch (error) {     
    console.error('Error', error);
    next(error);
  }
});
