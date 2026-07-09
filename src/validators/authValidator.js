const { body } = require('express-validator');

/**
 * Registration Validator
 * Validates customer registration input fields.
 */
const registerValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),

  body('phone')
    .optional()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Phone number must be 10-15 digits, optionally starting with +'),
];

/**
 * Login Validator
 * Validates customer/admin login input fields.
 */
const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = {
  registerValidator,
  loginValidator,
};
