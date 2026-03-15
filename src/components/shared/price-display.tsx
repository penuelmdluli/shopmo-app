import { cn, formatCurrency } from "@/lib/utils";

interface PriceDisplayProps {
  currentPrice: number;
  originalPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({ currentPrice, originalPrice, size = "md", className }: PriceDisplayProps) {
  const hasDiscount = originalPrice && originalPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const sizeClasses = {
    sm: { current: "text-sm font-semibold", original: "text-xs", badge: "text-[10px] px-1 py-0.5" },
    md: { current: "text-lg font-bold", original: "text-sm", badge: "text-xs px-1.5 py-0.5" },
    lg: { current: "text-2xl font-bold", original: "text-base", badge: "text-sm px-2 py-1" },
  };

  const s = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className={cn(s.current, "text-foreground")}>{formatCurrency(currentPrice)}</span>
      {hasDiscount && (
        <>
          <span className={cn(s.original, "text-muted-foreground line-through")}>
            {formatCurrency(originalPrice)}
          </span>
          <span className={cn(s.badge, "bg-red-100 text-red-700 rounded-full font-semibold")}>
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
