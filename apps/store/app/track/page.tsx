"use client";

import { useState } from "react";
import Link from "next/link";

interface TrackingEvent {
  location?: string;
  status?: string;
  time?: string;
  updated?: string;
}

interface TrackingInfo {
  ShipmentData?: {
    Shipment?: Array<{
      Status?: string;
      CurrentLocation?: string;
      ExpectedDeliveryDate?: string;
      EstimatedDeliveryDate?: string;
      UpdateTime?: string;
      Picked?: string;
      Delivered?: string;
      consignee?: string;
      destination?: string;
      origin?: string;
    }>;
  };
}

function EventRow({ event }: { event: TrackingEvent }) {
  return (
    <div className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-900">{event.status || "Unknown status"}</p>
        {event.location && <p className="text-xs text-gray-500 mt-0.5">{event.location}</p>}
        {event.time && <p className="text-xs text-gray-400 mt-1">{event.time}</p>}
      </div>
    </div>
  );
}

export default function TrackPage() {
  const [awb, setAwb] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackingInfo | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awb.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/track?awb=${encodeURIComponent(awb.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to track");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch tracking info");
    } finally {
      setLoading(false);
    }
  };

  const shipment = data?.ShipmentData?.Shipment?.[0];
  const status = shipment?.Status || "";
  const isDelivered = status.toLowerCase().includes("delivered") || status.toLowerCase().includes("completed");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-xl font-black text-gray-900">Gray Cup <span className="text-amber-500">(Fast)</span></Link>
            <p className="text-xs text-gray-500 mt-0.5">Track your order</p>
          </div>
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">← Back to store</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-black text-gray-900 mb-6">Track Shipment</h1>

          <form onSubmit={handleTrack} className="flex gap-3 mb-8">
            <input
              type="text"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="Enter AWB number (e.g. DHP1234567890)"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={loading || !awb.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              {loading ? "Tracking..." : "Track"}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
          )}

          {data && shipment && (
            <div>
              <div className="bg-stone-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${isDelivered ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {status || "In Transit"}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{awb}</span>
                </div>
                {shipment.CurrentLocation && (
                  <p className="text-sm text-gray-600">Current location: <strong className="text-gray-900">{shipment.CurrentLocation}</strong></p>
                )}
                {shipment.destination && (
                  <p className="text-sm text-gray-600 mt-1">Destination: <strong className="text-gray-900">{shipment.destination}</strong></p>
                )}
                {shipment.ExpectedDeliveryDate && (
                  <p className="text-sm text-gray-600 mt-1">Expected: <strong className="text-gray-900">{shipment.ExpectedDeliveryDate}</strong></p>
                )}
              </div>

              <div className="space-y-0">
                {shipment.Status && <EventRow event={{ status, location: shipment.CurrentLocation, time: shipment.UpdateTime }} />}
              </div>
            </div>
          )}

          {searched && !loading && !data && !error && (
            <p className="text-sm text-gray-500">No tracking info found for this AWB number.</p>
          )}
        </div>
      </main>
    </div>
  );
}