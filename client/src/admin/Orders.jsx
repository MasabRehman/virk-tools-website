import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileSpreadsheet, X } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.adminGetOrders();
      setOrders(res.data?.rows || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.adminUpdateOrderStatus(id, newStatus);
      fetchOrders(); // refresh
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleViewDetails = async (id) => {
    setModalLoading(true);
    setSelectedOrder({ id }); // open modal with loading state
    try {
      const res = await api.adminGetOrderById(id);
      if (res.success) {
        setSelectedOrder(res.data);
      }
    } catch (err) {
      alert('Failed to fetch order details');
      setSelectedOrder(null);
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_confirmation': return 'bg-yellow-900 text-yellow-400';
      case 'confirmed': return 'bg-blue-900 text-blue-400';
      case 'completed': return 'bg-green-900 text-green-400';
      case 'cancelled': return 'bg-red-900 text-red-400';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white">Order Management</h1>
          <p className="text-gray-400 mt-1">Review, confirm, and manage customer orders.</p>
        </div>
        <div className="bg-industrial-dark border border-border-gray px-4 py-2 rounded flex items-center text-sm">
          <FileSpreadsheet size={16} className="text-green-500 mr-2" />
          <a 
            href="/api/v1/admin/orders/export/excel" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white font-bold hover:text-safety-yellow transition-colors underline"
          >
            Download orders_master.xlsx
          </a>
        </div>
      </div>

      <div className="bg-industrial-dark border border-border-gray rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-black border-b border-border-gray">
              <tr>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Customer Info</th>
                <th className="px-6 py-4">Delivery City</th>
                <th className="px-6 py-4">Grand Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gray">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center">Loading orders...</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-black transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-safety-yellow">{order.order_number}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{order.customer_name}</div>
                    <div className="text-xs text-gray-500">{order.phone}</div>
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-bold tracking-wider">{order.city}</td>
                  <td className="px-6 py-4 font-bold text-white">Rs. {order.grand_total?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={order.confirmation_status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-bold appearance-none cursor-pointer focus:outline-none ${getStatusColor(order.confirmation_status)}`}
                    >
                      <option value="pending_confirmation">PENDING</option>
                      <option value="confirmed">CONFIRMED</option>
                      <option value="completed">DELIVERED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleViewDetails(order.id)}
                      className="text-gray-400 hover:text-white transition-colors border border-border-gray px-3 py-1 rounded text-xs"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No orders received yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-industrial-dark border border-border-gray rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border-gray flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {modalLoading ? 'Loading Order...' : `Order Details: ${selectedOrder.order_number}`}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {modalLoading || !selectedOrder.items ? (
                <div className="text-center py-8 text-gray-400">Fetching details...</div>
              ) : (
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="text-safety-yellow font-bold uppercase text-xs mb-3">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-black/30 p-4 rounded border border-border-gray">
                      <div><span className="text-gray-500">Name:</span> <span className="text-white">{selectedOrder.customer_name}</span></div>
                      <div><span className="text-gray-500">Phone:</span> <span className="text-white">{selectedOrder.phone}</span></div>
                      <div><span className="text-gray-500">Alt Phone:</span> <span className="text-white">{selectedOrder.alt_phone || 'N/A'}</span></div>
                      <div><span className="text-gray-500">Email:</span> <span className="text-white">{selectedOrder.email || 'N/A'}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="text-white">{selectedOrder.complete_address}, {selectedOrder.city}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Notes:</span> <span className="text-white">{selectedOrder.delivery_notes || 'None'}</span></div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div>
                    <h3 className="text-safety-yellow font-bold uppercase text-xs mb-3">Order Items</h3>
                    <div className="bg-black/30 rounded border border-border-gray overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-black/50 text-gray-400 border-b border-border-gray">
                          <tr>
                            <th className="px-4 py-2 font-normal">Product</th>
                            <th className="px-4 py-2 font-normal">Subcategory</th>
                            <th className="px-4 py-2 font-normal text-center">Qty</th>
                            <th className="px-4 py-2 font-normal text-right">Price</th>
                            <th className="px-4 py-2 font-normal text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-gray">
                          {selectedOrder.items.map((item, idx) => {
                            // Ensure we use the correct database column name (unit_price) and fallback to 0 if it's missing for any reason
                            const price = Number(item.unit_price) || 0;
                            const qty = Number(item.quantity) || 1;
                            const total = Number(item.total_price) || (price * qty);
                            
                            return (
                              <tr key={idx}>
                                <td className="px-4 py-3 text-white">
                                  {item.product_name}
                                  {item.variant_sku && <div className="text-xs text-gray-500 mt-1">SKU: {item.variant_sku}</div>}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {item.subcategory_name
                                    ? <span className="text-xs bg-safety-yellow/20 border border-safety-yellow/40 text-safety-yellow px-2 py-0.5 rounded">{item.subcategory_name}</span>
                                    : <span className="text-gray-600 text-xs">—</span>
                                  }
                                </td>
                                <td className="px-4 py-3 text-center text-gray-300">{qty}</td>
                                <td className="px-4 py-3 text-right text-gray-300">Rs. {price.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-white font-bold">Rs. {total.toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2 text-sm bg-black/30 p-4 rounded border border-border-gray">
                      <div className="flex justify-between text-gray-400">
                        <span>Subtotal:</span>
                        <span className="text-white">Rs. {selectedOrder.subtotal_amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Delivery:</span>
                        <span className="text-white">Rs. {selectedOrder.delivery_charge?.toLocaleString()}</span>
                      </div>
                      {selectedOrder.additional_charge > 0 && (
                        <div className="flex justify-between text-gray-400">
                          <span>Additional:</span>
                          <span className="text-white">Rs. {selectedOrder.additional_charge?.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="pt-2 mt-2 border-t border-border-gray flex justify-between font-bold text-safety-yellow text-lg">
                        <span>Grand Total:</span>
                        <span>Rs. {selectedOrder.grand_total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-border-gray flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
