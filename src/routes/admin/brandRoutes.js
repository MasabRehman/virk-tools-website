const router = require('express').Router();
const brandController = require('../../controllers/brandController');
const {
  authenticate,
  requireAdmin,
} = require('../../middlewares/authMiddleware');
const {
  createBrandValidator,
  updateBrandValidator,
} = require('../../validators/brandValidator');
const { validate } = require('../../validators/validate');

// All admin brand routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/', brandController.adminGetAll);
router.get('/:id', brandController.getById);
router.post('/', createBrandValidator, validate, brandController.create);
router.put('/:id', updateBrandValidator, validate, brandController.update);
router.delete('/:id', brandController.remove);

module.exports = router;
