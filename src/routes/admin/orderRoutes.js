const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { authenticate, requireAdmin } = require('../../middlewares/authMiddleware');

router.use(authenticate, requireAdmin);

router.get('/', orderController.adminGetAll);
router.get('/stats', orderController.adminGetDashboardStats);
router.get('/export/excel', orderController.adminExportExcel);
router.get('/:id', orderController.adminGetById);
router.put('/:id/status', orderController.adminUpdateStatus);

module.exports = router;
