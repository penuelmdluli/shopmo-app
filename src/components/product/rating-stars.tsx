"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: "sm" | "md";
}

export function RatingStars({ rating, count, size = "sm" }: RatingStarsProps) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => {
          const starIndex = i + 1;
          const isFull = rating >= starIndex;
          const isHalf = !isFull && rating >= starIndex - 0.5;

          return (
            <span key={i} className="relative">
              {/* Empty star (background) */}
              <Star
                className={cn(starSize, "text-gray-200")}
                fill="currentColor"
                strokeWidth={0}
              />
              {/* Filled or half-filled star (overlay) */}
              {(isFull || isHalf) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: isFull ? "100%" : "50%" }}
                >
                  <Star
                    className={cn(starSize, "text-amber-400")}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {count !== undefined && (
        <span className={cn(textSize, "text-gray-500")}>({count})</span>
      )}
    </div>
  );
}
