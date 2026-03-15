import Link from "next/link";
import { Truck, Zap, RotateCcw, Shield, ArrowRight, Flame, Mail, ChevronRight, Package, Smartphone, Home, Shirt, Heart, Dumbbell, Gamepad2, Car, Flower2 } from "lucide-react";
import { MOCK_LISTINGS, MOCK_DEALS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { VALUE_PROPOSITIONS } from "@/lib/constants";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://shopmoo.co.za";

function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ShopMO",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description: "South Africa's smartest online store. Trending products, fast delivery, AI-powered shopping.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "ZA",
      addressRegion: "Gauteng",
    },
    sameAs: [],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ShopMO",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TrendingSection } from "@/components/home/trending-section";
import { DealsSection } from "@/components/home/deals-section";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { ProductGrid } from "@/components/product/product-grid";

const ICON_MAP: Record<string, React.ElementType> = {
  Truck, Zap, RotateCcw, Shield, Smartphone, Home, Shirt, Heart, Dumbbell, Gamepad2, Car, Flower2,
};

const CATEGORY_COLORS = [
  "bg-cyan-50 text-cyan-700",
  "bg-orange-50 text-orange-700",
  "bg-purple-50 text-purple-700",
  "bg-pink-50 text-pink-700",
  "bg-green-50 text-green-700",
  "bg-blue-50 text-blue-700",
  "bg-red-50 text-red-700",
  "bg-yellow-50 text-yellow-700",
];

export default function HomePage() {
  const trendingProducts = MOCK_LISTINGS.slice(0, 8);
  const newArrivals = MOCK_LISTINGS.slice(-4);

  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <Header />
      <main className="min-h-screen pb-16 lg:pb-0">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-cyan-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-10 md:py-24">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3 md:mb-4">
                South Africa&apos;s Smartest Online Store
              </h1>
              <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8">
                AI-powered shopping with fast delivery nationwide. Discover trending products at unbeatable prices.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Shop Now
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/deals"
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/20 transition-colors border border-white/30"
                >
                  View Deals
                  <Flame size={18} />
                </Link>
              </div>
            </div>
          </div>
          {/* Stats Bar */}
          <div className="bg-black/20">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-wrap justify-center md:justify-between gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold">10,000+</p>
                  <p className="text-sm text-white/80">Products</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">4,000+</p>
                  <p className="text-sm text-white/80">Pickup Points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">Same-Day</p>
                  <p className="text-sm text-white/80">Dispatch</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUE_PROPOSITIONS.map((prop) => {
              const Icon = ICON_MAP[prop.icon] || Package;
              return (
                <div
                  key={prop.title}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{prop.title}</p>
                    <p className="text-xs text-muted-foreground">{prop.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Trending Products */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
            <Link href="/products" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <TrendingSection listings={trendingProducts} />
        </section>

        {/* Category Grid */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_CATEGORIES.map((cat, i) => {
              const Icon = ICON_MAP[cat.icon_name || "Package"] || Package;
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className={`${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} p-5 rounded-xl hover:shadow-md transition-all group`}
                >
                  <Icon size={28} className="mb-3" />
                  <h3 className="font-semibold mb-1">{cat.name}</h3>
                  <p className="text-xs opacity-80 line-clamp-2">{cat.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Flash Deals */}
        <section className="bg-gray-50 py-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Flame size={24} className="text-secondary" />
              <h2 className="text-2xl font-bold text-foreground">Flash Deals</h2>
            </div>
            <DealsSection deals={MOCK_DEALS} />
          </div>
        </section>

        {/* New Arrivals */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">New Arrivals</h2>
            <Link href="/products" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <ProductGrid listings={newArrivals} />
        </section>

        {/* Newsletter */}
        <section className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Mail size={32} className="mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Stay in the Loop</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Get the latest deals, new arrivals and exclusive offers delivered to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </section>

        {/* Trust Section */}
        <section className="max-w-7xl mx-auto px-4 py-10 text-center">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Trusted by thousands of South Africans
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["The Courier Guy", "Pargo", "Fastway", "Aramex", "Yoco", "Visa/Mastercard"].map((name) => (
              <span
                key={name}
                className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-full"
              >
                {name}
              </span>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
