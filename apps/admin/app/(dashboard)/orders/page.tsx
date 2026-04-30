"use client";

import { useState, useEffect } from "react";

type Order = {
  id: number;
  orderRef: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  amount: number;
  gstAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string;
  customerPincode: string;
  status: string;
  delhiveryWaybill: string | null;
  invoiceKey: string | null;
  invoiceNumber: string | null;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  PAID_DISPATCH_PENDING: "bg-orange-100 text-orange-800",
  DISPATCHED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
};

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">Order Details</h2>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{order.orderRef}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
              {order.status}
            </span>
            <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("en-IN")}</span>
          </div>

          {/* Customer Info */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer</h3>
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-semibold text-gray-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-semibold text-gray-900">{order.customerPhone}</span>
              </div>
              {order.customerEmail && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-semibold text-gray-900">{order.customerEmail}</span>
                </div>
              )}
            </div>
          </section>

          {/* Delivery Address */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Delivery Address</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <p className="text-gray-900 leading-relaxed whitespace-pre-line">{order.customerAddress}</p>
              <p className="text-gray-500 mt-1">Pincode: <span className="font-semibold text-gray-900">{order.customerPincode}</span></p>
            </div>
          </section>

          {/* Order Items */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items</h3>
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">{order.productName} · {order.variantLabel} ×{order.quantity}</span>
                <span className="font-bold text-gray-900">₹{order.amount}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 border-t border-gray-200 pt-2 mt-1">
                <span>GST (incl.)</span>
                <span>₹{order.gstAmount}</span>
              </div>
            </div>
          </section>

          {/* Shipping */}
          {order.delhiveryWaybill && (
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Shipping</h3>
              <div className="bg-gray-50 rounded-xl p-4 text-sm flex justify-between">
                <span className="text-gray-500">Waybill</span>
                <span className="font-mono font-bold text-gray-900">{order.delhiveryWaybill}</span>
              </div>
            </section>
          )}

          {/* Invoice */}
          <a
            href={`/api/invoice/${order.orderRef}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-colors"
          >
            📄 Download Invoice
          </a>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Order Ref</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Amount</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Waybill</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 font-semibold text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-bold">{o.orderRef}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customerName}</div>
                    <div className="text-xs text-gray-400">{o.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.productName}</div>
                    <div className="text-xs text-gray-400">{o.variantLabel} ×{o.quantity}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">₹{o.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{o.delhiveryWaybill || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}