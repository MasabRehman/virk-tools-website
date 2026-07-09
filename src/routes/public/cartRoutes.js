const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cartController');
const { optionalAuth } = require('../../middlewares/authMiddleware');
const { validate } = require('../../validators/validate');
const { addItemValidator, updateItemValidator } = require('../../validators/cartValidator');

router.use(optionalAuth);

router.get('/', cartController.getCart);
router.post('/items', addItemValidator, validate, cartController.addItem);
router.put('/items/:itemId', updateItemValidator, validate, cartController.updateItem);
router.delete('/items/:itemId', cartController.removeItem);

module.exports = router;
