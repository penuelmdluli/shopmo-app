"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight } from "lucide-react";

const STORAGE_KEY = "shopmo_exit_shown";

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse leaves from the top (intent to close tab)
    if (e.clientY <= 5) {
      const shown = sessionStorage.getItem(STORAGE_KEY);
      if (!shown) {
        setShow(true);
        sessionStorage.setItem(STORAGE_KEY, "true");
      }
    }
  }, []);

  useEffect(() => {
    // Only show on desktop (no mouse leave on mobile)
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    // Delay adding listener to avoid false triggers
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 z-10 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X size={16} />
        </button>

        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 text-center">
          <ShoppingBag size={32} className="mx-auto mb-2" />
          <h2 className="text-2xl font-bold">Wait! Don&apos;t Leave Empty-Handed</h2>
        </div>

        <div className="p-6">
          {!submitted ? (
            <>
              <p className="text-center text-gray-600 mb-4">
                Get <span className="font-bold text-red-600 text-lg">10% OFF</span> your first order.
                Just enter your email below:
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  Get My 10% Off <ArrowRight size={16} />
                </button>
              </form>
              <button
                onClick={() => setShow(false)}
                className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600"
              >
                No thanks, I&apos;ll pay full price
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-3xl mb-2">🎉</p>
              <h3 className="text-lg font-bold text-gray-900 mb-2">You&apos;re In!</h3>
              <p className="text-sm text-gray-500 mb-3">
                Use code <span className="font-mono font-bold text-primary">STAYSHOPMO</span> at checkout
              </p>
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <span className="text-2xl font-mono font-bold text-primary tracking-wider">STAYSHOPMO</span>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Shopping <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
