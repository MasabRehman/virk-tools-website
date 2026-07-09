const { body } = require('express-validator');

exports.checkoutValidator = [
  body('customer_name').notEmpty().withMessage('customer_name is required'),
  body('phone').notEmpty().withMessage('phone is required'),
  body('complete_address').notEmpty().withMessage('complete_address is required'),
  body('city').notEmpty().withMessage('city is required')
];
