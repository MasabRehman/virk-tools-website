const orderRepository = require('../repositories/orderRepository');
const cartRepository = require('../repositories/cartRepository');
const deliveryRuleRepository = require('../repositories/deliveryRuleRepository');
const excelService = require('./excelService');

function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'ORD-' + randomPart;
}

async function calculateDeliveryFee(city) {
  try {
    const rule = await deliveryRuleRepository.findByCity(city);
    if (rule && rule.fee_amount !== undefined) {
      return Number(rule.fee_amount);
    }
    return 500; // Default fee if rule not found
  } catch (error) {
    console.error('Error fetching delivery rule for city:', city, error);
    return 500; // Default fee on error
  }
}

async function checkout(sessionToken, userId, checkoutData) {
  // 1. Get cart
  const cart = await cartRepository.findBySessionOrUser(sessionToken, userId);
  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Get cart items
  const cartWithItems = await cartRepository.getCartWithItems(cart.id);
  if (!cartWithItems || cartWithItems.length === 0) {
    const error = new Error('Cart is empty');
    error.statusCode = 400;
    throw error;
  }

  // 3. Calculate subtotal and total items
  const subtotal = cartWithItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const totalItems = cartWithItems.reduce((sum, item) => sum + item.quantity, 0);

  // 4. Get delivery fee
  const deliveryFee = await calculateDeliveryFee(checkoutData.city);

  // 5. Calculate grand total
  const additionalCharges = checkoutData.additionalCharges ? Number(checkoutData.additionalCharges) : 0;
  const grandTotal = subtotal + deliveryFee + additionalCharges;

  // 6. Construct order data using proper snake_case for DB
  const orderNumber = generateOrderNumber();
  const orderData = {
    order_number: orderNumber,
    user_id: userId || null,
    customer_name: checkoutData.customer_name,
    phone: checkoutData.phone,
    alt_phone: checkoutData.alternate_phone || checkoutData.alt_phone || null,
    complete_address: checkoutData.complete_address,
    city: checkoutData.city,
    subtotal_amount: subtotal,
    delivery_charge: deliveryFee,
    additional_charge: additionalCharges,
    grand_total: grandTotal,
    confirmation_status: 'pending_confirmation'
  };

  const itemsData = cartWithItems.map(item => ({
    productId: item.product_id,
    variantId: item.variant_id,
    subcategoryId: item.subcategory_id,
    subcategoryName: item.subcategory_name,
    productName: item.product_name,
    sku: item.product_id, // We should technically fetch SKU, but putting ID for now to satisfy constraints
    quantity: item.quantity,
    price: item.product_price
  }));

  // 7. Create order transaction (creates order)
  const orderId = await orderRepository.createOrderTransaction(orderData, itemsData);
  
  // Clear the cart
  await cartRepository.clearCart(cart.id);

  // 10. Return order details
  return { id: orderId, orderNumber };
}

async function getOrderConfirmation(orderId) {
  return await orderRepository.findById(orderId);
}

async function adminGetAll(filters) {
  return await orderRepository.findAllAdmin(filters);
}

async function adminGetById(orderId) {
  return await orderRepository.findById(orderId);
}

async function adminUpdateOrderStatus(id, status, adminNotes) {
  const result = await orderRepository.updateStatus(id, status, adminNotes);
  
  if (status === 'confirmed') {
    try {
      const order = await orderRepository.findById(id);
      if (order) {
        const excelOrderData = {
          id: order.id,
          orderNumber: order.order_number,
          createdAt: order.created_at,
          customerName: order.customer_name,
          phoneNumber: order.phone,
          alternatePhone: order.alt_phone,
          completeAddress: order.complete_address,
          city: order.city,
          items: order.items,
          totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: order.subtotal_amount,
          deliveryFee: order.delivery_charge,
          additionalCharges: order.additional_charge,
          grandTotal: order.grand_total,
          status: status,
          adminNotes: adminNotes || order.admin_notes || ''
        };
        excelService.appendOrder(excelOrderData).catch(console.error);
      }
    } catch (error) {
      console.error('Failed to append to excel on confirmation:', error);
    }
  }

  return result;
}

const productRepository = require('../repositories/productRepository');

async function adminGetDashboardStats() {
  const stats = await orderRepository.getDashboardStats();
  const totalProducts = await productRepository.countByFilters({}, true);
  stats.total_products = totalProducts;
  return stats;
}

module.exports = {
  generateOrderNumber,
  calculateDeliveryFee,
  checkout,
  getOrderConfirmation,
  adminGetAll,
  adminGetById,
  adminUpdateOrderStatus,
  adminGetDashboardStats
};
