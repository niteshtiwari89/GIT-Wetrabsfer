const Booking = require("../models/booking.model.js");

function calculateRideDuration(fromPincode, toPincode) {
  // estimatedRideDurationHours = Math.abs(parseInt(toPincode) - parseInt(fromPincode)) % 24
  const from = parseInt(fromPincode) || 0;
  const to = parseInt(toPincode) || 0;
  const estimatedRideDurationHours = Math.abs(to - from) % 24;

  return Math.max(1, estimatedRideDurationHours);
}

async function hasBookingConflict(
  vehicleId,
  startTime,
  endTime,
  excludeBookingId = null
) {
  const conflictQuery = {
    vehicleId: vehicleId,
    $or: [
      {
        startTime: { $gte: startTime, $lt: endTime },
      },
      {
        endTime: { $gt: startTime, $lte: endTime },
      },

      {
        startTime: { $lte: startTime },
        endTime: { $gte: endTime },
      },
    ],
  };

  if (excludeBookingId) {
    conflictQuery._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(conflictQuery);
  return !!conflictingBooking;
}

module.exports = {
  calculateRideDuration,
  hasBookingConflict,
};
