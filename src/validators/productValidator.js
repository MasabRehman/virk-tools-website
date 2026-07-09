const { body, query: queryValidator } = require('express-validator');

/**
 * Create Product Validator
 * Validates input fields when creating a new product.
 */
const createProductValidator = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .trim(),

  body('sku')
    .notEmpty()
    .withMessage('SKU is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('SKU must be between 2 and 100 characters'),

  body('brand_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Brand ID must be a positive integer')
    .toInt(),

  body('category_id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
    .toInt(),

  body('selling_price')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a non-negative number')
    .toFloat(),

  body('availability_status')
    .optional()
    .isIn(['available', 'on_request', 'coming_soon', 'temporarily_unavailable', 'discontinued'])
    .withMessage('Availability status must be one of: available, on_request, coming_soon, temporarily_unavailable, discontinued'),

  body('description')
    .optional()
    .trim(),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean value')
    .toBoolean(),

  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean value')
    .toBoolean(),

  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),

  body('specifications')
    .optional()
    .isArray()
    .withMessage('Specifications must be an array'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

/**
 * Update Product Validator
 * All fields are optional when updating an existing product.
 */
const updateProductValidator = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .trim(),

  body('sku')
    .optional()
    .notEmpty()
    .withMessage('SKU cannot be empty')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('SKU must be between 2 and 100 characters'),

  body('brand_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Brand ID must be a positive integer')
    .toInt(),

  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
    .toInt(),

  body('selling_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a non-negative number')
    .toFloat(),

  body('availability_status')
    .optional()
    .isIn(['available', 'on_request', 'coming_soon', 'temporarily_unavailable', 'discontinued'])
    .withMessage('Availability status must be one of: available, on_request, coming_soon, temporarily_unavailable, discontinued'),

  body('description')
    .optional()
    .trim(),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean value')
    .toBoolean(),

  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean value')
    .toBoolean(),

  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),

  body('specifications')
    .optional()
    .isArray()
    .withMessage('Specifications must be an array'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

/**
 * Search Validator
 * Validates the search query parameter.
 */
const searchValidator = [
  queryValidator('q')
    .notEmpty()
    .withMessage('Search query is required')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query must be at least 1 character'),
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  searchValidator,
};
