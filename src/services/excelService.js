const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const excelLogRepository = require('../repositories/excelLogRepository');

const EXCEL_PATH = process.env.EXCEL_EXPORT_PATH || './exports';
const MASTER_FILE = path.join(EXCEL_PATH, 'orders_master.xlsx');

async function initializeWorkbook() {
  if (!fs.existsSync(EXCEL_PATH)) {
    fs.mkdirSync(EXCEL_PATH, { recursive: true });
  }
  
  if (!fs.existsSync(MASTER_FILE)) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');
    
    worksheet.columns = [
      { header: 'Order ID', key: 'id' },
      { header: 'Date/Time', key: 'dateTime' },
      { header: 'Customer Name', key: 'customerName' },
      { header: 'Phone Number', key: 'phoneNumber' },
      { header: 'Alternate Phone', key: 'alternatePhone' },
      { header: 'Complete Address', key: 'completeAddress' },
      { header: 'City', key: 'city' },
      { header: 'Ordered Products', key: 'orderedProducts' },
      { header: 'Total Items', key: 'totalItems' },
      { header: 'Subtotal', key: 'subtotal' },
      { header: 'Delivery Charges', key: 'deliveryCharges' },
      { header: 'Additional Charges', key: 'additionalCharges' },
      { header: 'Grand Total', key: 'grandTotal' },
      { header: 'Confirmation Status', key: 'confirmationStatus' },
      { header: 'Admin Notes', key: 'adminNotes' }
    ];
    
    await workbook.xlsx.writeFile(MASTER_FILE);
  }
}

async function appendOrder(order) {
  try {
    await initializeWorkbook();
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(MASTER_FILE);
    const worksheet = workbook.getWorksheet('Orders');
    
    // Format ordered products if it's an array of objects
    let orderedProductsStr = '';
    if (order.items && Array.isArray(order.items)) {
      orderedProductsStr = order.items.map(item => `${item.productName || item.name} (x${item.quantity})`).join(', ');
    } else if (typeof order.orderedProducts === 'string') {
      orderedProductsStr = order.orderedProducts;
    }

    worksheet.addRow({
      id: order.id || order.orderNumber,
      dateTime: order.createdAt || new Date().toISOString(),
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      alternatePhone: order.alternatePhone || '',
      completeAddress: order.completeAddress,
      city: order.city,
      orderedProducts: orderedProductsStr,
      totalItems: order.totalItems || (order.items ? order.items.length : 0),
      subtotal: order.subtotal,
      deliveryCharges: order.deliveryFee || order.deliveryCharges || 0,
      additionalCharges: order.additionalCharges || 0,
      grandTotal: order.grandTotal,
      confirmationStatus: order.status || order.confirmationStatus || 'Pending',
      adminNotes: order.adminNotes || ''
    });

    await workbook.xlsx.writeFile(MASTER_FILE);
    
    if (excelLogRepository && typeof excelLogRepository.logExport === 'function') {
      await excelLogRepository.logExport(order.id, MASTER_FILE, 'success');
    }
  } catch (error) {
    console.error('Error appending order to excel:', error);
    if (excelLogRepository && typeof excelLogRepository.logExport === 'function') {
      await excelLogRepository.logExport(order ? order.id : null, MASTER_FILE, 'failed');
    }
  }
}

async function generateOrdersExcelBuffer(orders) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orders');
  
  worksheet.columns = [
    { header: 'Order ID', key: 'id' },
    { header: 'Date/Time', key: 'dateTime' },
    { header: 'Customer Name', key: 'customerName' },
    { header: 'Phone Number', key: 'phoneNumber' },
    { header: 'Alternate Phone', key: 'alternatePhone' },
    { header: 'Complete Address', key: 'completeAddress' },
    { header: 'City', key: 'city' },
    { header: 'Ordered Products', key: 'orderedProducts' },
    { header: 'Total Items', key: 'totalItems' },
    { header: 'Subtotal', key: 'subtotal' },
    { header: 'Delivery Charges', key: 'deliveryCharges' },
    { header: 'Additional Charges', key: 'additionalCharges' },
    { header: 'Grand Total', key: 'grandTotal' },
    { header: 'Confirmation Status', key: 'confirmationStatus' },
    { header: 'Admin Notes', key: 'adminNotes' }
  ];

  for (const order of orders) {
    let orderedProductsStr = '';
    // order.items might not be loaded if we did a simple findAll, we should check if they exist
    // Actually orderRepository.findAllAdmin returns rows without items in the current implementation.
    // If we want items, we might need to fetch them. Or we can just output basic info.
    // Let's assume order doesn't have items array unless fetched.
    
    worksheet.addRow({
      id: order.id || order.order_number,
      dateTime: order.created_at || new Date().toISOString(),
      customerName: order.customer_name,
      phoneNumber: order.phone,
      alternatePhone: order.alt_phone || '',
      completeAddress: order.complete_address,
      city: order.city,
      orderedProducts: 'Multiple Items (View in Admin Panel)',
      totalItems: 0,
      subtotal: order.subtotal_amount,
      deliveryCharges: order.delivery_charge || 0,
      additionalCharges: order.additional_charge || 0,
      grandTotal: order.grand_total,
      confirmationStatus: order.confirmation_status || 'Pending',
      adminNotes: order.admin_notes || ''
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = {
  initializeWorkbook,
  appendOrder,
  generateOrdersExcelBuffer
};
