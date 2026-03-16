"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";

interface ProductImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}

export function ProductImage({ src, fallbackSrc, alt, className }: ProductImageProps) {
  const [error, setError] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  if (error && usedFallback) {
    // Both primary and fallback failed — show placeholder
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-300 ${className || ""}`}>
        <ShoppingCart size={40} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={error && fallbackSrc ? fallbackSrc : src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (!error && fallbackSrc) {
          setError(true);
        } else {
          setError(true);
          setUsedFallback(true);
        }
      }}
    />
  );
}
