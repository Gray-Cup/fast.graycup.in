"use client";

import { useState, useEffect } from "react";

type Order = {
  id: number;
  orderRef: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  amount: number;
  customerName: string;
  status: string;
  createdAt: string;
};

export default function InvoicesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Invoices</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs font-bold text-gray-500">{o.orderRef}</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{o.productName}</p>
                  <p className="text-xs text-gray-400">{o.variantLabel} ×{o.quantity}</p>
                </div>
                <span className="text-sm font-bold">₹{o.amount}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-IN")}</span>
                <a href={`/api/invoice/${o.orderRef}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-600 hover:text-amber-800">
                  View PDF →
                </a>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="col-span-full text-center py-12 text-gray-400">No invoices yet</p>
          )}
        </div>
      )}
    </div>
  );
}