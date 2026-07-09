const { body } = require('express-validator');

exports.addItemValidator = [
  body('product_id').isInt().withMessage('product_id must be an integer'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be an integer of at least 1'),
  body('variant_id').optional({ nullable: true }).isInt().withMessage('variant_id must be an integer')
];

exports.updateItemValidator = [
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be an integer of at least 1')
];
