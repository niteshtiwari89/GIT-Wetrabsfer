const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  deleteBooking
} = require('../controllers/bookingController');
const { validateBooking } = require('../middleware/validation');

router.post('/', validateBooking, createBooking);
router.get('/', getAllBookings);
router.delete('/:id', deleteBooking);

module.exports = router;
