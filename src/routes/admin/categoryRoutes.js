const router = require('express').Router();
const categoryController = require('../../controllers/categoryController');
const {
  authenticate,
  requireAdmin,
} = require('../../middlewares/authMiddleware');
const {
  createCategoryValidator,
  updateCategoryValidator,
} = require('../../validators/categoryValidator');
const { validate } = require('../../validators/validate');

// All admin category routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/', categoryController.adminGetAll);
router.get('/:id', categoryController.getById);
router.get('/:id/subcategories', categoryController.getSubcategories);
router.post(
  '/',
  createCategoryValidator,
  validate,
  categoryController.create
);
router.post('/:id/subcategories', categoryController.createSubcategory);
router.put(
  '/:id',
  updateCategoryValidator,
  validate,
  categoryController.update
);
router.delete('/:id', categoryController.remove);
router.delete('/:id/subcategories/:subId', categoryController.deleteSubcategory);

module.exports = router;
