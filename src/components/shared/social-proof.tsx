"use client";

import { useState, useEffect } from "react";
import { Eye, ShoppingCart, MapPin } from "lucide-react";

const SA_CITIES = [
  "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth",
  "Bloemfontein", "Soweto", "Sandton", "Centurion", "Midrand",
  "Stellenbosch", "Polokwane", "Nelspruit", "Rustenburg", "Pietermaritzburg",
];

const FIRST_NAMES = [
  "Thabo", "Naledi", "Sipho", "Zinhle", "Bongani", "Nomsa", "Lebo", "Mandla",
  "Ayanda", "Karabo", "Lerato", "Tshepo", "Busisiwe", "Dumisani", "Palesa",
  "Andile", "Nandi", "Sizwe", "Mpho", "Zanele",
];

const PRODUCT_NAMES = [
  "Fast Charger", "Wireless Earbuds", "Smart Watch", "Bluetooth Speaker",
  "Ring Light", "Air Fryer", "Yoga Mat", "Resistance Bands",
  "Water Bottle", "Vitamin C Serum", "Car Phone Mount",
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Live viewer count
export function LiveViewerCount({ productId }: { productId?: string }) {
  const [viewers, setViewers] = useState(getRandomNumber(3, 28));

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(2, Math.min(35, prev + change));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [productId]);

  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-600">
      <Eye size={14} className="text-primary animate-pulse" />
      <span><strong>{viewers}</strong> people viewing this right now</span>
    </div>
  );
}

// Recent purchase notification toast
export function RecentPurchaseToast() {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState({ name: "", city: "", product: "", timeAgo: "" });

  useEffect(() => {
    const showNotification = () => {
      const name = getRandomItem(FIRST_NAMES);
      const city = getRandomItem(SA_CITIES);
      const product = getRandomItem(PRODUCT_NAMES);
      const minutes = getRandomNumber(1, 45);
      setNotification({
        name: `${name} from ${city}`,
        city,
        product,
        timeAgo: minutes < 5 ? "just now" : `${minutes}m ago`,
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };

    // First notification after 8 seconds
    const firstTimer = setTimeout(showNotification, 8000);

    // Then every 25-45 seconds
    const interval = setInterval(showNotification, getRandomNumber(25000, 45000));

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 z-40 animate-slide-in-left">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 max-w-xs flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
          <ShoppingCart size={18} className="text-green-600" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate">
            {notification.name}
          </p>
          <p className="text-xs text-gray-500">
            purchased <strong>{notification.product}</strong>
          </p>
          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin size={9} /> {notification.timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
}

// Stock urgency badge
export function StockUrgency({ stock }: { stock: number }) {
  if (stock <= 0 || stock > 20) return null;

  const isLow = stock <= 5;
  const isMedium = stock <= 10;

  return (
    <div className={`flex items-center gap-1.5 text-sm font-medium ${isLow ? "text-red-600" : isMedium ? "text-orange-600" : "text-yellow-600"}`}>
      <span className={`w-2 h-2 rounded-full ${isLow ? "bg-red-500 animate-pulse" : isMedium ? "bg-orange-500" : "bg-yellow-500"}`} />
      {isLow
        ? `Only ${stock} left — selling fast!`
        : isMedium
        ? `Only ${stock} left in stock`
        : `Limited stock — ${stock} remaining`}
    </div>
  );
}

// Bought together / frequently viewed
export function BoughtCount({ count }: { count: number }) {
  return (
    <p className="text-sm text-gray-500">
      🔥 <strong>{count.toLocaleString()}</strong> people bought this in the last 30 days
    </p>
  );
}
