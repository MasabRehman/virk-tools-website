const router = require('express').Router();
const productController = require('../../controllers/productController');
const {
  authenticate,
  requireAdmin,
} = require('../../middlewares/authMiddleware');
const {
  createProductValidator,
  updateProductValidator,
} = require('../../validators/productValidator');
const { validate } = require('../../validators/validate');

// All admin product routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/', productController.adminGetAll);
router.get('/:id', productController.getById);
router.post('/', createProductValidator, validate, productController.create);
router.put('/:id', updateProductValidator, validate, productController.update);
router.delete('/:id', productController.remove);

module.exports = router;
