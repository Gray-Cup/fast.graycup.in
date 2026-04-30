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
  createdAt: string;
};

type Filter = "ALL" | "PENDING" | "PAID" | "PAID_DISPATCH_PENDING" | "DISPATCHED" | "DELIVERED";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PAID_DISPATCH_PENDING: "Awaiting Dispatch",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  PAID_DISPATCH_PENDING: "bg-orange-100 text-orange-800",
  DISPATCHED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selected, setSelected] = useState<Order | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const handleGenerateWaybill = async (orderRef: string) => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/orders/${orderRef}/generate-waybill`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.orderRef === orderRef
              ? { ...o, status: data.status || "DISPATCHED", delhiveryWaybill: data.waybill || null }
              : o
          )
        );
        if (selected?.orderRef === orderRef) {
          setSelected((prev) => prev ? { ...prev, status: data.status || "DISPATCHED", delhiveryWaybill: data.waybill || null } : null);
        }
      } else {
        alert(data.error || "Failed to generate waybill");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Orders</h1>
        <div className="flex gap-2">
          {(["ALL", "PAID", "PAID_DISPATCH_PENDING", "DISPATCHED", "DELIVERED"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-stone-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {f === "ALL" ? "All" : STATUS_LABELS[f] || f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Order ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Amount</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Waybill</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-bold">{o.orderRef}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customerName}</div>
                    <div className="text-xs text-gray-400">{o.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{o.productName}</div>
                    <div className="text-xs text-gray-400">{o.variantLabel} ×{o.quantity}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">₹{o.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{o.delhiveryWaybill || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(o)} className="text-xs font-medium text-amber-600 hover:text-amber-800">View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-over panel */}
      {selected && (
        <OrderPanel order={selected} onClose={() => setSelected(null)} onGenerateWaybill={handleGenerateWaybill} generating={generating} />
      )}
    </div>
  );
}

function OrderPanel({ order, onClose, onGenerateWaybill, generating }: { order: Order; onClose: () => void; onGenerateWaybill: (ref: string) => void; generating: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-black">{order.orderRef}</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${{
              PENDING: "bg-yellow-100 text-yellow-800",
              PAID: "bg-blue-100 text-blue-800",
              PAID_DISPATCH_PENDING: "bg-orange-100 text-orange-800",
              DISPATCHED: "bg-purple-100 text-purple-800",
              DELIVERED: "bg-green-100 text-green-800",
            }[order.status] || "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
            {order.delhiveryWaybill && (
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{order.delhiveryWaybill}</span>
            )}
          </div>

          {/* Customer */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer</h3>
            <div className="text-sm space-y-1">
              <p className="font-bold">{order.customerName}</p>
              <p className="text-gray-600">{order.customerPhone}</p>
              {order.customerEmail && <p className="text-gray-600">{order.customerEmail}</p>}
              <p className="text-gray-600">{order.customerAddress}</p>
              <p className="text-gray-600">{order.customerPincode}</p>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order</h3>
            <div className="text-sm space-y-1">
              <p className="font-bold">{order.productName}</p>
              <p className="text-gray-600">{order.variantLabel} × {order.quantity}</p>
              <p className="text-gray-600">₹{order.amount} (incl. ₹{order.gstAmount} GST)</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            {order.invoiceKey && (
              <a href={`/api/invoice/${order.orderRef}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-colors">
                📄 View / Download Invoice
              </a>
            )}
            {order.status === "PAID" || order.status === "PAID_DISPATCH_PENDING" ? (
              <button onClick={() => onGenerateWaybill(order.orderRef)} disabled={generating} className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl transition-colors">
                {generating ? "Generating..." : "Generate Delhivery Pickup"}
              </button>
            ) : order.delhiveryWaybill ? (
              <a href={`https://track.delhivery.com/search?waybill=${order.delhiveryWaybill}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl transition-colors">
                Track on Delhivery →
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}