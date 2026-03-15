"use client";

import { useState } from "react";
import { Search, Package, CheckCircle, Truck, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const mockTracking = {
  order_number: "SM-20260310-A1B2C",
  status: "shipped",
  tracking_number: "TCG123456789",
  courier: "The Courier Guy",
  estimated_delivery: "15 March 2026",
  timeline: [
    {
      status: "Order Placed",
      date: "10 March 2026, 14:30",
      description: "Your order has been placed and confirmed.",
      icon: Package,
      complete: true,
    },
    {
      status: "Payment Confirmed",
      date: "10 March 2026, 14:32",
      description: "Payment received via Yoco.",
      icon: CheckCircle,
      complete: true,
    },
    {
      status: "Processing",
      date: "11 March 2026, 09:15",
      description: "Your order is being packed and prepared for shipping.",
      icon: Clock,
      complete: true,
    },
    {
      status: "Shipped",
      date: "12 March 2026, 11:40",
      description: "Tracking: TCG123456789 via The Courier Guy.",
      icon: Truck,
      complete: true,
    },
    {
      status: "Out for Delivery",
      date: "",
      description: "Your parcel is on its way to you.",
      icon: MapPin,
      complete: false,
    },
    {
      status: "Delivered",
      date: "",
      description: "",
      icon: CheckCircle,
      complete: false,
    },
  ],
};

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [tracking, setTracking] = useState<typeof mockTracking | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    // Mock: any input returns tracking data
    if (orderNumber.trim()) {
      setTracking({ ...mockTracking, order_number: orderNumber.trim() });
    } else {
      setTracking(null);
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
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Track
        </button>
      </form>

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
              <p className="font-semibold text-gray-900">{tracking.estimated_delivery}</p>
            </div>
          </div>

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
              const Icon = step.icon;
              const isLast = i === tracking.timeline.length - 1;
              return (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        step.complete
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
                          step.complete ? "bg-primary" : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>
                  <div className="pb-8">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        step.complete ? "text-gray-900" : "text-gray-400"
                      )}
                    >
                      {step.status}
                    </p>
                    {step.date && (
                      <p className="text-xs text-gray-500 mt-0.5">{step.date}</p>
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

      {/* Empty State */}
      {searched && !tracking && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No Order Found</h2>
          <p className="text-sm text-gray-500">
            Please check your order number and try again.
          </p>
        </div>
      )}
    </div>
  );
}
