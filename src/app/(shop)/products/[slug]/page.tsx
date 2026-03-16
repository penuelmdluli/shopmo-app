import Link from "next/link";
import { ChevronRight, Star, CheckCircle, User, Shield, Truck, RotateCcw } from "lucide-react";
import { notFound } from "next/navigation";
import { getListings, getListingBySlug, getReviews } from "@/lib/supabase/queries";
import { formatDate } from "@/lib/utils";
import { PriceDisplay } from "@/components/shared/price-display";
import { ProductActions } from "@/components/products/product-actions";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductSocialProof } from "@/components/products/product-social-proof";
import { ProductGallery } from "@/components/products/product-gallery";
import { ReviewForm } from "@/components/reviews/review-form";
import type { StorefrontListing } from "@/types/database";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://shopmoo.co.za";

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Product Not Found" };
  return {
    title: listing.title,
    description: listing.description,
    openGraph: {
      title: listing.title,
      description: listing.description,
      url: `${SITE_URL}/products/${listing.slug}`,
      images: listing.images?.[0] ? [{ url: listing.images[0] }] : [],
      type: "website",
    },
  };
}

function ProductJsonLd({ listing, reviewData }: { listing: StorefrontListing; reviewData: { rating: number; body: string | null; customer?: { full_name: string } }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images,
    sku: listing.sku,
    brand: { "@type": "Brand", name: listing.brand || "ShopMO" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${listing.slug}`,
      priceCurrency: "ZAR",
      price: listing.current_price,
      availability: listing.is_in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "ShopMO" },
    },
    aggregateRating: listing.rating_count > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: listing.rating_average,
          reviewCount: listing.rating_count,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    review: reviewData.length > 0
      ? reviewData.slice(0, 5).map((r) => ({
          "@type": "Review",
          reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
          author: { "@type": "Person", name: r.customer?.full_name || "Customer" },
          reviewBody: r.body || "",
        }))
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [listing, allListings] = await Promise.all([
    getListingBySlug(slug),
    getListings(),
  ]);

  if (!listing) {
    notFound();
  }

  const reviews = await getReviews(listing.id);

  const relatedProducts = allListings.filter(
    (l) => l.category === listing.category && l.id !== listing.id
  ).slice(0, 4);

  const attributes = listing.attributes || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* JSON-LD Structured Data for Google */}
      <ProductJsonLd listing={listing} reviewData={reviews} />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href={`/categories/${listing.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`} className="hover:text-primary transition-colors">
          {listing.category}
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium line-clamp-1">{listing.title}</span>
      </nav>

      {/* Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left: Gallery with Zoom & Lightbox */}
        <ProductGallery images={listing.images || []} title={listing.title} />

        {/* Right: Product Info */}
        <div>
          {listing.brand && (
            <p className="text-sm text-primary font-medium mb-1">{listing.brand}</p>
          )}
          <h1 className="text-2xl font-bold text-foreground mb-3">{listing.title}</h1>

          {/* Rating */}
          {listing.rating_count > 0 ? (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={star <= Math.round(listing.rating_average) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{listing.rating_average}</span>
              <span className="text-sm text-muted-foreground">({listing.rating_count} reviews)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-primary font-medium">New Arrival</span>
              <span className="text-sm text-muted-foreground">Be the first to review</span>
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            <PriceDisplay
              currentPrice={listing.current_price}
              originalPrice={listing.original_price}
              size="lg"
            />
          </div>

          {/* Social Proof (client component) */}
          <ProductSocialProof listing={listing} />

          {/* Description */}
          <p className="text-muted-foreground mb-6 leading-relaxed">{listing.description}</p>

          {/* Actions (client component) */}
          <ProductActions listing={listing} />

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
              <Truck size={16} className="text-primary shrink-0" />
              <span className="text-xs text-gray-600">Free delivery R500+</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
              <RotateCcw size={16} className="text-primary shrink-0" />
              <span className="text-xs text-gray-600">30-day returns</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
              <Shield size={16} className="text-primary shrink-0" />
              <span className="text-xs text-gray-600">Secure checkout</span>
            </div>
          </div>

          {/* SKU */}
          <p className="text-xs text-muted-foreground mt-4">SKU: {listing.sku}</p>
        </div>
      </div>

      {/* Specifications — filter out internal SellBot AI analysis fields */}
      {(() => {
        const internalKeys = new Set([
          "verdict", "reasoning", "sa_trend", "risk_factors", "rules_failed",
          "rules_passed", "barcode_status", "source_url_hint", "competitive_strategy",
          "supplier_price", "estimated_margin", "margin", "cost_price",
          "ai_analysis", "ai_score", "discovery_source", "source_url",
          "profit_margin", "supplier", "supplier_name", "supplier_url",
        ]);
        const filtered = Object.entries(attributes).filter(
          ([key]) => !internalKeys.has(key) && !key.startsWith("_")
        );
        return filtered.length > 0 ? (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">Specifications</h2>
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {filtered.map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-3 font-medium text-foreground w-1/3 capitalize">
                        {key.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null;
      })()}

      {/* Reviews */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Customer Reviews ({reviews.length})
        </h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => {
              // Extract reviewer name from body (format: "review text\n\n— Name L.")
              const bodyParts = review.body?.split("\n\n— ") || [];
              const reviewBody = bodyParts[0] || review.body;
              const reviewerName = review.customer?.full_name || bodyParts[1] || "Verified Customer";

              return (
                <div key={review.id} className="bg-white border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {reviewerName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{reviewerName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                      </div>
                    </div>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle size={12} />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  {review.title && (
                    <p className="font-medium text-foreground text-sm mb-1">{review.title}</p>
                  )}
                  {reviewBody && (
                    <p className="text-sm text-muted-foreground">{reviewBody}</p>
                  )}
                  {review.seller_response && (
                    <div className="mt-3 pl-4 border-l-2 border-primary bg-primary/5 p-3 rounded-r-lg">
                      <p className="text-xs font-medium text-primary mb-1">Seller Response</p>
                      <p className="text-sm text-muted-foreground">{review.seller_response}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm mb-4">No reviews yet. Be the first to review this product!</p>
        )}

        {/* Review Form */}
        <div className="mt-6">
          <ReviewForm listingId={listing.id} productName={listing.title} />
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Related Products</h2>
          <ProductGrid listings={relatedProducts} />
        </section>
      )}
    </div>
  );
}
