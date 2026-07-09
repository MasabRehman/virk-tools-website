const router = require('express').Router();
const brandController = require('../../controllers/brandController');

router.get('/', brandController.getAll);
router.get('/:slug', brandController.getBySlug);

module.exports = router;
