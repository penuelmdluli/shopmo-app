"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, SearchX, Loader2 } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { trackSearch } from "@/lib/facebook-pixel";
import type { StorefrontListing } from "@/types/database";

export function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<StorefrontListing[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Facebook Pixel: track search + fetch results
  useEffect(() => {
    if (query.trim()) {
      trackSearch(query.trim());
    }
    fetchResults(query);
  }, [query, fetchResults]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">Search</span>
      </nav>

      {query.trim() ? (
        <>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Search results for &quot;{query}&quot;
          </h1>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
              <Loader2 size={20} className="animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {results.length} {results.length === 1 ? "product" : "products"} found
              </p>

              {results.length > 0 ? (
                <ProductGrid listings={results} />
              ) : (
                <div className="text-center py-16">
                  <SearchX size={48} className="mx-auto mb-4 text-gray-300" />
                  <h2 className="text-lg font-semibold text-foreground mb-2">No results found</h2>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    We couldn&apos;t find any products matching &quot;{query}&quot;. Try a different search term or browse our categories.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link
                      href="/products"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary-hover transition-colors"
                    >
                      Browse All Products
                    </Link>
                    <Link
                      href="/categories"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Shop by Category
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <SearchX size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Search for products</h2>
          <p className="text-muted-foreground">
            Use the search bar above to find products, brands and more.
          </p>
        </div>
      )}
    </div>
  );
}
