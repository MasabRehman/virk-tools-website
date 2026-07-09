const jwt = require('jsonwebtoken');

/**
 * Authenticate middleware - Verifies JWT from cookie or Authorization header.
 * Attaches decoded user payload to req.user on success.
 */
const authenticate = (req, res, next) => {
  try {
    let token = null;

    // 1) Try httpOnly cookie named 'access_token'
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    // 2) Try Authorization header 'Bearer <token>'
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Require admin middleware - Ensures the authenticated user is an admin.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

/**
 * Optional auth middleware - Attempts to verify JWT but does not block
 * the request if no token or an invalid token is provided.
 */
const optionalAuth = (req, res, next) => {
  try {
    let token = null;

    // 1) Try httpOnly cookie named 'access_token'
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    // 2) Try Authorization header 'Bearer <token>'
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type,
    };

    next();
  } catch (error) {
    // Invalid token — silently continue without user context
    next();
  }
};

module.exports = { authenticate, requireAdmin, optionalAuth };
