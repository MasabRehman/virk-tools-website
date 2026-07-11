const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const adminRepository = require('../repositories/adminRepository');

const SALT_ROUNDS = 12;

/**
 * Slugify Helper
 * Converts text to a URL-friendly slug.
 * @param {string} text - The text to slugify.
 * @returns {string} The slugified text.
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters
    .replace(/-+/g, '-')        // Collapse multiple hyphens
    .replace(/^-|-$/g, '');     // Remove leading/trailing hyphens
}

/**
 * Generate Access Token
 * Signs a JWT with the access token secret and expiration.
 * @param {Object} payload - The payload to encode in the token.
 * @returns {string} The signed JWT access token.
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
}

/**
 * Generate Refresh Token
 * Signs a JWT with the refresh token secret and expiration.
 * @param {Object} payload - The payload to encode in the token.
 * @returns {string} The signed JWT refresh token.
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

/**
 * Register a new customer account.
 * @param {Object} params - Registration details.
 * @param {string} params.name - Customer's full name.
 * @param {string} params.email - Customer's email address.
 * @param {string} params.password - Customer's plaintext password.
 * @param {string} [params.phone] - Customer's phone number (optional).
 * @returns {Promise<Object>} The created user (without password_hash) and tokens.
 */
async function registerCustomer({ name, email, password, phone }) {
  try {
    // Check if email is already registered
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the user record
    const userId = await userRepository.create({
      name,
      email,
      password_hash,
      phone: phone || null,
    });

    // Fetch the created user
    const user = await userRepository.findById(userId);

    // Generate tokens
    const tokenPayload = { id: user.id, email: user.email, type: 'customer' };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshTokenValue = generateRefreshToken(tokenPayload);

    // Remove password_hash before returning
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: refreshTokenValue,
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Registration failed: ${error.message}`);
  }
}

/**
 * Login a customer with email and password.
 * @param {Object} params - Login credentials.
 * @param {string} params.email - Customer's email address.
 * @param {string} params.password - Customer's plaintext password.
 * @returns {Promise<Object>} The authenticated user (without password_hash) and tokens.
 */
async function loginCustomer({ email, password }) {
  try {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Compare password with hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate tokens
    const tokenPayload = { id: user.id, email: user.email, type: 'customer' };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshTokenValue = generateRefreshToken(tokenPayload);

    // Remove password_hash before returning
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: refreshTokenValue,
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Login failed: ${error.message}`);
  }
}

/**
 * Login an admin with email and password.
 * @param {Object} params - Admin login credentials.
 * @param {string} params.email - Admin's email address.
 * @param {string} params.password - Admin's plaintext password.
 * @returns {Promise<Object>} The authenticated admin (without password_hash), role, and tokens.
 */
async function loginAdmin({ email, password }) {
  try {
    // Find admin by email
    const admin = await adminRepository.findByEmail(email);
    if (!admin) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Support manually changing admin credentials to plain text in the database
    let isPasswordValid = false;
    let needsHashing = false;

    // Check if it's a valid bcrypt hash format
    if (admin.password_hash && admin.password_hash.startsWith('$2')) {
      isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    } else {
      // If someone manually edited the DB with a plaintext password
      if (password === admin.password_hash) {
        isPasswordValid = true;
        needsHashing = true;
      }
    }

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Automatically secure the password if it was entered in plaintext
    if (needsHashing) {
      const newHash = await bcrypt.hash(password, 10);
      await adminRepository.update(admin.id, { password_hash: newHash });
    }

    // Generate tokens with admin type and role
    const tokenPayload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshTokenValue = generateRefreshToken(tokenPayload);

    // Remove password_hash before returning
    const { password_hash: _, ...adminWithoutPassword } = admin;

    return {
      admin: adminWithoutPassword,
      role: admin.role,
      accessToken,
      refreshToken: refreshTokenValue,
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Admin login failed: ${error.message}`);
  }
}

/**
 * Refresh an access token using a valid refresh token.
 * @param {string} refreshTokenStr - The refresh token string.
 * @returns {Promise<Object>} A new access token.
 */
async function refreshToken(refreshTokenStr) {
  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshTokenStr, process.env.JWT_REFRESH_SECRET);

    let entity = null;

    // Determine if token belongs to a customer or admin
    if (decoded.type === 'admin') {
      entity = await adminRepository.findById(decoded.id);
      if (!entity) {
        const error = new Error('Admin account not found');
        error.statusCode = 401;
        throw error;
      }
    } else {
      entity = await userRepository.findById(decoded.id);
      if (!entity) {
        const error = new Error('User account not found');
        error.statusCode = 401;
        throw error;
      }
    }

    // Generate a new access token
    const tokenPayload = {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type,
      ...(decoded.role && { role: decoded.role }),
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    return {
      accessToken: newAccessToken,
    };
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      const tokenError = new Error('Invalid or expired refresh token');
      tokenError.statusCode = 401;
      throw tokenError;
    }
    if (error.statusCode) throw error;
    throw new Error(`Token refresh failed: ${error.message}`);
  }
}

/**
 * Verify an access token and return the decoded payload.
 * @param {string} token - The access token string.
 * @returns {Object} The decoded token payload.
 */
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    const verifyError = new Error('Invalid or expired access token');
    verifyError.statusCode = 401;
    throw verifyError;
  }
}

module.exports = {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  refreshToken,
  verifyAccessToken,
  slugify,
};
