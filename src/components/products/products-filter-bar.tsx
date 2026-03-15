"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export function ProductsFilterBar() {
  const [sort, setSort] = useState("relevance");

  return (
    <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SlidersHorizontal size={16} />
        <span>Sort by:</span>
      </div>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-primary"
      >
        <option value="relevance">Relevance</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="newest">Newest</option>
        <option value="rating">Best Rated</option>
      </select>
    </div>
  );
}
