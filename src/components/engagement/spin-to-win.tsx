"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Gift, PartyPopper } from "lucide-react";
import { addSubscriber } from "@/lib/email-marketing";
import { trackLead } from "@/lib/facebook-pixel";

const STORAGE_KEY = "shopmo_spin_used";
const SPIN_DELAY_KEY = "shopmo_spin_shown_at";

// Segments: label, color, probability weight, coupon code (if win)
const SEGMENTS = [
  { label: "5% OFF", color: "#0891b2", textColor: "#fff", weight: 25, code: "SPIN5", discount: "5%" },
  { label: "Try Again", color: "#f1f5f9", textColor: "#64748b", weight: 20, code: null, discount: null },
  { label: "10% OFF", color: "#0e7490", textColor: "#fff", weight: 20, code: "SPIN10", discount: "10%" },
  { label: "Free Ship", color: "#06b6d4", textColor: "#fff", weight: 15, code: "FREESHIP", discount: "Free Shipping" },
  { label: "Try Again", color: "#e2e8f0", textColor: "#64748b", weight: 10, code: null, discount: null },
  { label: "15% OFF", color: "#155e75", textColor: "#fff", weight: 8, code: "SPIN15", discount: "15%" },
  { label: "Try Again", color: "#f1f5f9", textColor: "#64748b", weight: 1, code: null, discount: null },
  { label: "R50 OFF", color: "#164e63", textColor: "#fff", weight: 1, code: "SPIN50", discount: "R50 OFF" },
];

function pickWinningIndex(): number {
  const totalWeight = SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
  let rand = Math.random() * totalWeight;
  for (let i = 0; i < SEGMENTS.length; i++) {
    rand -= SEGMENTS[i].weight;
    if (rand <= 0) return i;
  }
  return 0;
}

export function SpinToWin() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<typeof SEGMENTS[0] | null>(null);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Don't show if already used
    if (typeof window === "undefined") return;
    const used = localStorage.getItem(STORAGE_KEY);
    if (used) return;

    // Show after 8 seconds delay on first visit
    const shownAt = sessionStorage.getItem(SPIN_DELAY_KEY);
    if (shownAt) return;

    const timer = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem(SPIN_DELAY_KEY, Date.now().toString());
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 4;
    const segCount = SEGMENTS.length;
    const arcSize = (2 * Math.PI) / segCount;

    ctx.clearRect(0, 0, size, size);

    SEGMENTS.forEach((seg, i) => {
      const startAngle = i * arcSize;
      const endAngle = startAngle + arcSize;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = seg.textColor;
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(seg.label, radius - 12, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 18, 0, 2 * Math.PI);
    ctx.fillStyle = "#0891b2";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SPIN", center, center + 3);
  }, []);

  const handleSpin = () => {
    if (!email.trim() || spinning) return;

    setSpinning(true);
    // Collect email into marketing system
    const winIndex = pickWinningIndex();
    const wonSegment = SEGMENTS[winIndex];
    addSubscriber(email, "spin_wheel", {
      coupon_code: wonSegment.code || "WELCOME5",
      tags: ["gamification", wonSegment.code ? "winner" : "consolation"],
    });
    trackLead();
    const segAngle = 360 / SEGMENTS.length;
    // Calculate rotation: go to winning segment, add extra full rotations
    const targetAngle = 360 - (winIndex * segAngle + segAngle / 2);
    const totalRotation = rotation + 360 * 5 + targetAngle;
    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(SEGMENTS[winIndex]);
      localStorage.setItem(STORAGE_KEY, "true");
    }, 4500);
  };

  const handleCopy = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShow(false);
    // If they close without spinning, don't show again this session
    sessionStorage.setItem(SPIN_DELAY_KEY, Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-cyan-600 text-white p-5 text-center">
          <Gift size={28} className="mx-auto mb-2" />
          <h2 className="text-xl font-bold">Spin & Win!</h2>
          <p className="text-sm text-white/80 mt-1">
            Try your luck for an exclusive discount
          </p>
        </div>

        <div className="p-5">
          {!result ? (
            <>
              {/* Wheel */}
              <div className="relative mx-auto w-[220px] h-[220px] mb-4">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                  <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-red-500" />
                </div>
                <div
                  className="w-full h-full transition-transform ease-out"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: spinning ? "4s" : "0s",
                    transitionTimingFunction: "cubic-bezier(0.17, 0.67, 0.12, 0.99)",
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={220}
                    height={220}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Email + Spin */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to spin"
                disabled={spinning}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary mb-3 disabled:opacity-50"
              />
              <button
                onClick={handleSpin}
                disabled={!email.trim() || spinning}
                className="w-full py-3 bg-gradient-to-r from-primary to-cyan-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm uppercase tracking-wide"
              >
                {spinning ? "Spinning..." : "🎰 Spin the Wheel!"}
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                One spin per customer. By spinning, you agree to receive marketing emails.
              </p>
            </>
          ) : (
            /* Result */
            <div className="text-center py-4">
              {result.code ? (
                <>
                  <PartyPopper size={40} className="mx-auto text-yellow-500 mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    🎉 You Won {result.discount}!
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Use this code at checkout:
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-center gap-3 mb-4">
                    <span className="text-2xl font-mono font-bold text-primary tracking-wider">
                      {result.code}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary/90"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <Link
                    href="/products"
                    className="inline-block w-full py-3 bg-gradient-to-r from-primary to-cyan-600 text-white font-bold rounded-lg text-sm text-center"
                  >
                    Shop Now & Save!
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-3xl mb-3">😔</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Better luck next time!
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    But here&apos;s 5% off as a consolation:
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-center gap-3 mb-4">
                    <span className="text-2xl font-mono font-bold text-primary tracking-wider">
                      WELCOME5
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("WELCOME5");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary/90"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <Link
                    href="/products"
                    className="inline-block w-full py-3 bg-gradient-to-r from-primary to-cyan-600 text-white font-bold rounded-lg text-sm text-center"
                  >
                    Browse Products
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
