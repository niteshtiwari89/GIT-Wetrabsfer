const Vehicle = require('../models/vehicle.model.js');
const Booking = require('../models/booking.model.js');
const { calculateRideDuration, hasBookingConflict } = require('../utils/bookingUtils');

const addVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    const savedVehicle = await vehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAvailableVehicles = async (req, res) => {
  try {
    const { capacityRequired, fromPincode, toPincode, startTime } = req.query;

    if (!capacityRequired || !fromPincode || !toPincode || !startTime) {
      return res.status(400).json({
        error: 'Missing required parameters: capacityRequired, fromPincode, toPincode, startTime'
      });
    }

    const startDateTime = new Date(startTime);
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({
        error: 'Invalid startTime format. Please use ISO date format.'
      });
    }

    const estimatedRideDurationHours = calculateRideDuration(fromPincode, toPincode);
    const endDateTime = new Date(startDateTime.getTime() + (estimatedRideDurationHours * 60 * 60 * 1000));

    const vehiclesWithCapacity = await Vehicle.find({
      capacityKg: { $gte: parseInt(capacityRequired) }
    });

    const availableVehicles = [];
    for (const vehicle of vehiclesWithCapacity) {
      const hasConflict = await hasBookingConflict(vehicle._id, startDateTime, endDateTime);
      if (!hasConflict) {
        availableVehicles.push(vehicle);
      }
    }

    res.status(200).json({
      vehicles: availableVehicles,
      estimatedRideDurationHours: estimatedRideDurationHours,
      searchCriteria: {
        capacityRequired: parseInt(capacityRequired),
        fromPincode,
        toPincode,
        startTime: startDateTime,
        endTime: endDateTime
      }
    });
  } catch (error) {
    console.error('Error finding available vehicles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    const activeBookings = await Booking.find({ 
      vehicleId: vehicleId,
      endTime: { $gt: new Date() } // Future bookings
    });
    
    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete vehicle with active bookings',
        activeBookings: activeBookings.length
      });
    }
    await Vehicle.findByIdAndDelete(vehicleId);
    
    res.status(200).json({ 
      message: 'Vehicle deleted successfully',
      deletedVehicle: vehicle
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid vehicle ID' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addVehicle,
  getAllVehicles,
  getAvailableVehicles,
  deleteVehicle
};
