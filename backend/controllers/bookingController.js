const Booking = require("../models/booking.model.js");
const Vehicle = require("../models/vehicle.model.js");
const {
  calculateRideDuration,
  hasBookingConflict,
} = require("../utils/bookingUtils");

const createBooking = async (req, res) => {
  try {
    const { vehicleId, fromPincode, toPincode, startTime, customerId } =
      req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const startDateTime = new Date(startTime);
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({
        error: "Invalid startTime format. Please use ISO date format.",
      });
    }

    const estimatedRideDurationHours = calculateRideDuration(
      fromPincode,
      toPincode
    );
    const endDateTime = new Date(
      startDateTime.getTime() + estimatedRideDurationHours * 60 * 60 * 1000
    );

    const hasConflict = await hasBookingConflict(
      vehicleId,
      startDateTime,
      endDateTime
    );
    if (hasConflict) {
      return res.status(409).json({
        error: "Vehicle is already booked for an overlapping time slot",
      });
    }

    const booking = new Booking({
      vehicleId,
      fromPincode,
      toPincode,
      startTime: startDateTime,
      endTime: endDateTime,
      customerId,
      estimatedRideDurationHours,
    });

    const savedBooking = await booking.save();

    const populatedBooking = await Booking.findById(savedBooking._id).populate(
      "vehicleId"
    );

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("vehicleId");
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId).populate("vehicleId");
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const currentTime = new Date();
    const isActive =
      currentTime >= booking.startTime && currentTime <= booking.endTime;

    console.log(`Attempting to delete booking ${bookingId} at ${currentTime}`);
    console.log(
      `Booking start time: ${booking.startTime}, end time: ${booking.endTime}`
    );
    console.log(`Is booking currently active: ${isActive}`);

    if (isActive) {
      return res.status(400).json({
        error:
          "Cannot delete booking that is currently in progress. Please wait until the booking is completed.",
      });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({
      message: "Booking deleted successfully",
      deletedBooking: booking,
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid booking ID" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  deleteBooking,
};
