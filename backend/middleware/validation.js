const Joi = require('joi');

const vehicleValidationSchema = Joi.object({
  name: Joi.string().required().trim(),
  capacityKg: Joi.number().integer().min(1).required(),
  tyres: Joi.number().integer().min(2).required()
});

const bookingValidationSchema = Joi.object({
  vehicleId: Joi.string().required(),
  fromPincode: Joi.string().required().trim(),
  toPincode: Joi.string().required().trim(),
  startTime: Joi.string().isoDate().required(),
  customerId: Joi.string().required().trim()
});

const validateVehicle = (req, res, next) => {
  const { error, value } = vehicleValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details[0].message
    });
  }
  req.body = value; 
  next();
};

const validateBooking = (req, res, next) => {
  const { error, value } = bookingValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details[0].message
    });
  }
  req.body = value; 
  next();
};

module.exports = {
  validateVehicle,
  validateBooking
};
