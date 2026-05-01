"use client";

import { useState, useEffect } from "react";

type Order = {
  id: number;
  orderRef: string;
  status: string;
  amount: number;
  createdAt: string;
};

export default function AdminHome() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const total = orders?.length || 0;
  const revenue = orders?.reduce((sum, o) => sum + o.amount, 0) || 0;
  const pending = orders.filter((o) => o.status === "PENDING" || o.status === "PAID").length;
  const dispatched = orders.filter((o) => o.status === "DISPATCHED" || o.status === "DELIVERED").length;

  const statCards = [
    { label: "Total Orders", value: total, color: "text-gray-900" },
    { label: "Pending / Paid", value: pending, color: "text-orange-600" },
    { label: "Dispatched / Delivered", value: dispatched, color: "text-green-600" },
    { label: "Total Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, color: "text-blue-600" },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <h1 className="text-2xl font-black mb-6">Dashboard</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
                <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-sm text-gray-700">Recent Orders</h2>
              <a href="/orders" className="text-xs font-medium text-amber-600 hover:text-amber-800">View all →</a>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-bold">{o.orderRef}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-right font-bold">₹{o.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        o.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                        o.status === "DISPATCHED" ? "bg-purple-100 text-purple-800" :
                        o.status === "PAID" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-400">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}