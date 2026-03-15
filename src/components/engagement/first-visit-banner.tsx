"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";

const STORAGE_KEY = "shopmo_first_visit_banner_dismissed";

function shouldShow() {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(STORAGE_KEY);
}

export function FirstVisitBanner() {
  const [show, setShow] = useState(shouldShow);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white relative">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
        <Sparkles size={14} className="shrink-0" />
        <span>
          🎉 <strong>NEW CUSTOMER?</strong> Use code <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded font-bold">WELCOME10</span> for 10% off your first order!
        </span>
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
