const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Logistics Vehicle Booking System'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Logistics Vehicle Booking System is running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`   POST   /api/vehicles - Add a new vehicle`);
  console.log(`   GET    /api/vehicles/available - Find available vehicles`);
  console.log(`   POST   /api/bookings - Book a vehicle`);
  console.log(`   GET    /api/vehicles - Get all vehicles`);
  console.log(`   GET    /api/bookings - Get all bookings`);
  console.log(`   DELETE /api/vehicles/:id - Delete a vehicle`);
  console.log(`   DELETE /api/bookings/:id - Delete a booking`);
  console.log(`   GET    /health - Health check`);
});

module.exports = app;