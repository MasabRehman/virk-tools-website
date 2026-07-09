const cartService = require('../services/cartService');
const crypto = require('crypto');

const getSessionToken = (req, res) => {
  let token = req.headers['x-cart-session'] || req.cookies?.session_token;
  if (!token) {
    token = crypto.randomBytes(16).toString('hex');
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('session_token', token, { 
      httpOnly: true,
      secure: isProduction, // must be true for cross-site
      sameSite: isProduction ? 'none' : 'lax', // must be 'none' for cross-site
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }
  return token;
};

exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user?.type === 'customer' ? req.user.id : null;
    const sessionToken = getSessionToken(req, res);

    const cart = await cartService.getCart(sessionToken, userId);
    res.status(200).json({ success: true, session_token: sessionToken, data: cart });
  } catch (error) {
    next(error);
  }
};

exports.addItem = async (req, res, next) => {
  try {
    const userId = req.user?.type === 'customer' ? req.user.id : null;
    const sessionToken = getSessionToken(req, res);
    const { product_id, quantity, variant_id, subcategory_id } = req.body;

    const result = await cartService.addToCart(sessionToken, userId, product_id, variant_id, subcategory_id, quantity);
    res.status(201).json({ success: true, session_token: sessionToken, data: result });
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const result = await cartService.updateQuantity(itemId, quantity);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    await cartService.removeFromCart(itemId);
    res.status(200).json({ success: true, message: 'Item removed successfully' });
  } catch (error) {
    next(error);
  }
};
