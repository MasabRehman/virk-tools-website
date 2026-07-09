const router = require('express').Router();
const authController = require('../../controllers/authController');
const { authenticate } = require('../../middlewares/authMiddleware');
const { authLimiter } = require('../../middlewares/rateLimiter');
const {
  registerValidator,
  loginValidator,
} = require('../../validators/authValidator');
const { validate } = require('../../validators/validate');

// Public auth routes
router.post(
  '/register',
  authLimiter,
  registerValidator,
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  loginValidator,
  validate,
  authController.login
);

router.post(
  '/admin/login',
  authLimiter,
  loginValidator,
  validate,
  authController.adminLogin
);

router.post('/refresh', authController.refreshToken);

router.post('/logout', authController.logout);

// Protected route — requires authentication
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
