const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/settingsController');
const { authenticate, requireAdmin } = require('../../middlewares/authMiddleware');

router.use(authenticate, requireAdmin);

router.get('/', settingsController.getAll);
router.put('/', settingsController.update);

module.exports = router;
