/**
 * VIRK Tools & Equipment - API Routes Index
 *
 * Central router that mounts all API route modules.
 * All routes are prefixed with /api/v1 (set in app.js).
 */

const express = require('express');
const router = express.Router();

// API root info
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VIRK Tools & Equipment API v1',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/v1/auth',
      categories: '/api/v1/categories',
      brands: '/api/v1/brands',
      products: '/api/v1/products',
      admin: '/api/v1/admin/*',
    },
  });
});

// =============================================================================
// PUBLIC ROUTES
// =============================================================================
router.use('/auth', require('./public/authRoutes'));
router.use('/categories', require('./public/categoryRoutes'));
router.use('/brands', require('./public/brandRoutes'));
router.use('/products', require('./public/productRoutes'));
router.use('/cart', require('./public/cartRoutes'));
router.use('/orders', require('./public/orderRoutes'));
router.use('/catalog', require('./public/catalogRoutes'));
router.use('/settings', require('./public/settingsRoutes'));

// =============================================================================
// ADMIN ROUTES (all prefixed with /admin)
// =============================================================================
router.use('/admin/categories', require('./admin/categoryRoutes'));
router.use('/admin/brands', require('./admin/brandRoutes'));
router.use('/admin/products', require('./admin/productRoutes'));
router.use('/admin/orders', require('./admin/orderRoutes'));
router.use('/admin/upload', require('./admin/uploadRoutes'));
router.use('/admin/settings', require('./admin/settingsRoutes'));

module.exports = router;
