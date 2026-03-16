"use client";

import { useState } from "react";
import { Search, Package, CheckCircle, Truck, MapPin, Clock, Loader2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface TimelineStep {
  status: string;
  description: string;
  date: string | null;
  completed: boolean;
  tracking_number?: string;
}

interface TrackingResult {
  order_number: string;
  status: string;
  tracking_number: string | null;
  courier: string;
  estimated_delivery: string | null;
  message?: string;
  timeline: TimelineStep[];
}

const timelineIcons = [Package, CheckCircle, Clock, Truck, MapPin, CheckCircle];

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [tracking, setTracking] = useState<TrackingResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);
    setTracking(null);

    try {
      const res = await fetch(`/api/shipping/track?order_number=${encodeURIComponent(orderNumber.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Order not found");
        return;
      }

      // Map API response to our display format
      const result: TrackingResult = {
        order_number: data.order?.order_number || orderNumber.trim(),
        status: data.order?.status || data.tracking?.status || "unknown",
        tracking_number: data.tracking?.number || data.order?.shipping_tracking_number || null,
        courier: data.tracking?.provider || data.order?.shipping_provider || "The Courier Guy",
        estimated_delivery: data.order?.shipping_estimated_delivery || null,
        message: data.message || null,
        timeline: data.timeline || [
          { status: "Order Placed", description: "Your order has been placed.", date: data.order?.created_at, completed: true },
          { status: "Payment Confirmed", description: "Payment received.", date: data.order?.updated_at, completed: data.order?.status !== "pending_payment" },
          { status: "Processing", description: "Preparing for dispatch.", date: null, completed: ["processing", "shipped", "out_for_delivery", "delivered"].includes(data.order?.status || "") },
          { status: "Shipped", description: data.tracking?.number ? `Tracking: ${data.tracking.number}` : "Shipped with courier.", date: null, completed: ["shipped", "out_for_delivery", "delivered"].includes(data.order?.status || "") },
          { status: "Out for Delivery", description: "On its way to you.", date: null, completed: ["out_for_delivery", "delivered"].includes(data.order?.status || "") },
          { status: "Delivered", description: "Delivered successfully.", date: null, completed: data.order?.status === "delivered" },
        ],
      };

      setTracking(result);
    } catch {
      setError("Failed to look up order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 lg:py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Track Your Order</h1>
        <p className="text-gray-500">Enter your order number to see the latest status.</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. SM-20260310-A1B2C"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          Track
        </button>
      </form>

      {/* Error */}
      {error && searched && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No Order Found</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      )}

      {/* Tracking Results */}
      {tracking && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-semibold text-gray-900">{tracking.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Estimated Delivery</p>
              <p className="font-semibold text-gray-900">
                {tracking.estimated_delivery
                  ? formatDate(tracking.estimated_delivery)
                  : "Pending"}
              </p>
            </div>
          </div>

          {tracking.message && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-700">
              {tracking.message}
            </div>
          )}

          {tracking.tracking_number && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm">
              <span className="text-gray-500">Tracking:</span>{" "}
              <span className="font-medium text-gray-900">{tracking.tracking_number}</span>{" "}
              <span className="text-gray-500">via</span>{" "}
              <span className="font-medium text-gray-900">{tracking.courier}</span>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-0">
            {tracking.timeline.map((step, i) => {
              const Icon = timelineIcons[i] || Package;
              const isLast = i === tracking.timeline.length - 1;
              return (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        step.completed
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      <Icon size={16} />
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "w-0.5 h-12",
                          step.completed ? "bg-primary" : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>
                  <div className="pb-8">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        step.completed ? "text-gray-900" : "text-gray-400"
                      )}
                    >
                      {step.status}
                    </p>
                    {step.date && (
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(step.date)}</p>
                    )}
                    {step.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
