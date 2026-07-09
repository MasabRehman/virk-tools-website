const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { optionalAuth } = require('../../middlewares/authMiddleware');
const { validate } = require('../../validators/validate');
const { checkoutValidator } = require('../../validators/orderValidator');

router.use(optionalAuth);

router.post('/checkout', checkoutValidator, validate, orderController.checkout);
router.get('/confirmation/:orderId', orderController.getConfirmation);
router.get('/delivery-fee', orderController.getDeliveryFee);

module.exports = router;
