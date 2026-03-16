"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, Send, Check, Copy } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const GIFT_CARD_AMOUNTS = [100, 250, 500, 1000];

export function GiftCardSection() {
  const [selectedAmount, setSelectedAmount] = useState(250);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [giftCode, setGiftCode] = useState("");

  const actualAmount = customAmount ? parseInt(customAmount) : selectedAmount;
  const isValid = actualAmount >= 50 && actualAmount <= 5000 && recipientEmail.trim() && senderName.trim();

  const [purchaseError, setPurchaseError] = useState("");

  const handlePurchase = async () => {
    if (!isValid) return;
    setPurchaseError("");
    // Gift card purchasing requires payment integration — show coming soon
    setPurchaseError("Gift cards are launching soon! In the meantime, browse our products for great deals.");
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(giftCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (purchased) {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gift Card Sent! 🎉</h2>
        <p className="text-gray-500 mb-6">
          A {formatCurrency(actualAmount)} gift card has been sent to {recipientEmail}
        </p>

        {/* Gift Card Visual */}
        <div className="bg-gradient-to-br from-primary to-cyan-600 text-white rounded-2xl p-6 mb-6 shadow-lg mx-auto max-w-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Gift size={20} />
              <span className="font-bold">ShopMO</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Gift Card</span>
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(actualAmount)}</p>
          <p className="text-sm text-white/80 mb-4">From: {senderName}</p>
          <div className="bg-white/20 rounded-lg p-2 flex items-center justify-between">
            <span className="font-mono text-sm tracking-wider">{giftCode}</span>
            <button onClick={handleCopy} className="p-1 hover:bg-white/20 rounded">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <Link
          href="/products"
          className="inline-block px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Gift Card Preview */}
        <div>
          <div className="bg-gradient-to-br from-primary to-cyan-600 text-white rounded-2xl p-6 shadow-lg aspect-[16/10] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift size={20} />
                <span className="font-bold">ShopMO</span>
              </div>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Gift Card</span>
            </div>
            <div>
              <p className="text-3xl font-bold">{formatCurrency(actualAmount)}</p>
              {senderName && <p className="text-sm text-white/80 mt-1">From: {senderName}</p>}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Gift cards never expire. Redeemable on shopmoo.co.za
          </p>
        </div>

        {/* Right: Form */}
        <div className="space-y-4">
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Select Amount</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {GIFT_CARD_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
                  className={`py-2 text-sm font-medium rounded-lg border transition-colors ${
                    selectedAmount === amount && !customAmount
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 text-gray-700 hover:border-primary/50"
                  }`}
                >
                  R{amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Or enter custom amount (R50 - R5,000)"
              min={50}
              max={5000}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Recipient&apos;s Email</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="friend@email.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Sender Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Your Name</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Personal Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Happy Birthday! Enjoy shopping 🎁"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Purchase */}
          {purchaseError && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">{purchaseError}</p>
          )}
          <button
            onClick={handlePurchase}
            disabled={!isValid}
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send size={16} />
            Send Gift Card — {formatCurrency(actualAmount)}
          </button>
        </div>
      </div>
    </div>
  );
}
