const authService = require('../services/authService');

/**
 * Helper to set authentication cookies on the response.
 */
const setAuthCookies = (res, tokens) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('access_token', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  if (tokens.refreshToken) {
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

/**
 * Clear authentication cookies from the response.
 */
const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie('access_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
  });

  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
  });
};

/**
 * Register a new customer account.
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.registerCustomer(req.body);
    setAuthCookies(res, result);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login an existing customer.
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.loginCustomer(req.body);
    setAuthCookies(res, result);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login an admin user.
 */
const adminLogin = async (req, res, next) => {
  try {
    const result = await authService.loginAdmin(req.body);
    setAuthCookies(res, result);

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: result.admin,
        role: result.role,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh the access token using a refresh token.
 */
const refreshToken = async (req, res, next) => {
  try {
    const token =
      (req.cookies && req.cookies.refresh_token) || req.body.refreshToken;

    const result = await authService.refreshToken(token);

    // Set the new access token cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout the current user by clearing auth cookies.
 */
const logout = async (req, res, next) => {
  try {
    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the currently authenticated user's profile.
 */
const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  refreshToken,
  logout,
  getProfile,
};
