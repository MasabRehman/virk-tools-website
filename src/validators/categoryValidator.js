const { body } = require('express-validator');

/**
 * Create Category Validator
 * Validates input fields when creating a new category.
 */
const createCategoryValidator = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Category name must be between 2 and 255 characters'),

  body('description')
    .optional()
    .trim(),

  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer')
    .toInt(),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean value')
    .toBoolean(),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
    .toBoolean(),
];

/**
 * Update Category Validator
 * All fields are optional when updating an existing category.
 */
const updateCategoryValidator = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Category name must be between 2 and 255 characters'),

  body('description')
    .optional()
    .trim(),

  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer')
    .toInt(),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean value')
    .toBoolean(),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
    .toBoolean(),
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator,
};
