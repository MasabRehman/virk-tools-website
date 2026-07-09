const cartRepository = require('../repositories/cartRepository');

async function getCart(sessionToken, userId) {
  const cart = await cartRepository.findBySessionOrUser(sessionToken, userId);
  
  if (!cart) {
    return { items: [], subtotal: 0 };
  }
  
  const cartWithItems = await cartRepository.getCartWithItems(cart.id);
  
  let subtotal = 0;
  let formattedItems = [];
  if (cartWithItems && cartWithItems.length > 0) {
    formattedItems = cartWithItems.map(item => ({
      ...item,
      unit_price: Number(item.product_price),
      total_price: Number(item.product_price) * item.quantity
    }));
    subtotal = formattedItems.reduce((sum, item) => sum + item.total_price, 0);
  }
  
  return { 
    id: cart.id,
    items: formattedItems,
    subtotal
  };
}

async function addToCart(sessionToken, userId, productId, variantId, subcategoryId, quantity) {
  let cart = await cartRepository.findBySessionOrUser(sessionToken, userId);
  
  if (!cart) {
    cart = { id: await cartRepository.createCart(sessionToken, userId) };
  }
  
  return await cartRepository.addItem(cart.id, productId, variantId, subcategoryId, quantity);
}

async function updateQuantity(itemId, quantity) {
  return await cartRepository.updateItemQuantity(itemId, quantity);
}

async function removeFromCart(itemId) {
  return await cartRepository.removeItem(itemId);
}

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart
};
