"use client";

import { useEffect, useState } from "react";

type StateCount = {
  state: string;
  total_count: number;
  website_count: number;
  manual_count: number;
  revenue: number;
  pincodes: string[];
};

const today = new Date().toISOString().slice(0, 10);
const defaultStart = new Date(Date.now() - 1000 * 60 * 60 * 24 * 29).toISOString().slice(0, 10);

function formatMoney(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function OrderMapPage() {
  const [states, setStates] = useState<StateCount[]>([]);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(today);
  const [queryStart, setQueryStart] = useState(defaultStart);
  const [queryEnd, setQueryEnd] = useState(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (queryStart) params.set("startDate", queryStart);
    if (queryEnd) params.set("endDate", queryEnd);

    fetch(`/api/order-map?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load data");
        return r.json();
      })
      .then((data: StateCount[]) => setStates(data))
      .catch(() => {
        setError("Failed to load data");
        setStates([]);
      })
      .finally(() => setLoading(false));
  }, [queryStart, queryEnd]);

  const totalOrders = states.reduce((sum, row) => sum + row.total_count, 0);
  const totalRevenue = states.reduce((sum, row) => sum + row.revenue, 0);
  const totalStates = states.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-4 px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-gray-900">Orders by State</h1>
          <p className="text-sm text-gray-500">
            {queryStart} → {queryEnd} &nbsp;·&nbsp; {totalOrders} order{totalOrders !== 1 ? "s" : ""} across {totalStates} state{totalStates !== 1 ? "s" : ""} &nbsp;·&nbsp; {formatMoney(totalRevenue)} total sold
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => { setQueryStart(startDate); setQueryEnd(endDate); }}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">State</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Orders</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Website</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Manual</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Sold value</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Pincodes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {states.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                      {loading ? "Loading…" : error ? error : "No orders found for this date range."}
                    </td>
                  </tr>
                ) : (
                  states.map((row, i) => (
                    <tr key={row.state} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.state}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{row.total_count}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{row.website_count}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{row.manual_count}</td>
                      <td className="px-4 py-3 text-right font-semibold text-amber-700">{formatMoney(row.revenue)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {row.pincodes.map((pin) => (
                            <span key={pin} className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-600">
                              {pin}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {states.length > 0 && (
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 font-semibold text-gray-700">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{totalOrders}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-700">
                      {states.reduce((s, r) => s + r.website_count, 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-700">
                      {states.reduce((s, r) => s + r.manual_count, 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-amber-700">{formatMoney(totalRevenue)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
