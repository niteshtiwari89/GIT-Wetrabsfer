const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacityKg: {
    type: Number,
    required: true,
    min: 1
  },
  tyres: {
    type: Number,
    required: true,
    min: 2
  }
}, {
  timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;