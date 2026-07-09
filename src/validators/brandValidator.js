const { body } = require('express-validator');

/**
 * Create Brand Validator
 * Validates input fields when creating a new brand.
 */
const createBrandValidator = [
  body('name')
    .notEmpty()
    .withMessage('Brand name is required')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Brand name must be between 2 and 255 characters'),

  body('description')
    .optional()
    .trim(),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
    .toBoolean(),
];

/**
 * Update Brand Validator
 * All fields are optional when updating an existing brand.
 */
const updateBrandValidator = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Brand name cannot be empty')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Brand name must be between 2 and 255 characters'),

  body('description')
    .optional()
    .trim(),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
    .toBoolean(),
];

module.exports = {
  createBrandValidator,
  updateBrandValidator,
};
