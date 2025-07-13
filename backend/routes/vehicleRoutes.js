const express = require('express');
const router = express.Router();
const {
  addVehicle,
  getAllVehicles,
  getAvailableVehicles,
  deleteVehicle
} = require('../controllers/vehicleController');
const { validateVehicle } = require('../middleware/validation');

router.post('/', validateVehicle, addVehicle);
router.get('/', getAllVehicles);

router.get('/available', getAvailableVehicles);
router.delete('/:id', deleteVehicle);

module.exports = router;
