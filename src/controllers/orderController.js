const orderService = require('../services/orderService');

exports.checkout = async (req, res, next) => {
  try {
    const userId = req.user?.type === 'customer' ? req.user.id : null;
    const sessionToken = req.cookies?.session_token;
    
    const result = await orderService.checkout(sessionToken, userId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getConfirmation = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getConfirmation(orderId);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.getDeliveryFee = async (req, res, next) => {
  try {
    const feeInfo = await orderService.calculateDeliveryFee(req.query.city);
    res.status(200).json({ success: true, data: { fee: feeInfo } });
  } catch (error) {
    next(error);
  }
};

exports.adminGetAll = async (req, res, next) => {
  try {
    const orders = await orderService.adminGetAll(req.query);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

exports.adminGetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.adminGetById(id);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.adminUpdateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { confirmation_status, admin_notes } = req.body;
    const result = await orderService.adminUpdateOrderStatus(id, confirmation_status, admin_notes);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.adminExportExcel = async (req, res, next) => {
  try {
    const excelService = require('../services/excelService');
    const orderService = require('../services/orderService');
    
    // Fetch all orders
    const ordersData = await orderService.adminGetAll({ limit: 10000, page: 1 }); // get up to 10000 orders
    
    // Generate buffer
    const buffer = await excelService.generateOrdersExcelBuffer(ordersData.rows || ordersData);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'virk_tools_orders_master.xlsx');
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

exports.adminGetDashboardStats = async (req, res, next) => {
  try {
    const stats = await orderService.adminGetDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
