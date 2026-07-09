const router = require('express').Router();
const productController = require('../../controllers/productController');

router.get('/', productController.getAll);

// Static routes MUST come before the :slug param route
router.get('/featured', productController.getFeatured);
router.get('/search', productController.search);

router.get('/:slug', productController.getBySlug);

module.exports = router;
