const router = require('express').Router();
const categoryController = require('../../controllers/categoryController');

router.get('/', categoryController.getAll);
router.get('/featured', categoryController.getFeatured);
router.get('/:id/subcategories', categoryController.getSubcategories);
router.get('/:slug', categoryController.getBySlug);

module.exports = router;
