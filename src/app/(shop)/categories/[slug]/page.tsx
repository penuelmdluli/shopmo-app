import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getListings, getCategories } from "@/lib/supabase/queries";
import { ProductGrid } from "@/components/product/product-grid";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug)
    || categories.find((c) => slug.startsWith(c.slug) || c.slug.startsWith(slug));
  const name = category?.name || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    title: name,
    description: category?.description || `Browse ${name} products on ShopMO.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [categories, listings] = await Promise.all([
    getCategories(),
    getListings(),
  ]);

  // Try exact match first, then partial match (e.g. "electronics-accessories" starts with "electronics")
  let category = categories.find((c) => c.slug === slug);
  if (!category) {
    category = categories.find((c) => slug.startsWith(c.slug) || c.slug.startsWith(slug));
  }

  // Filter products: match by exact category, slug-based match, or partial slug match
  const filteredListings = listings.filter((l) => {
    const productSlug = l.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
    return productSlug === slug
      || (category && l.category === category.name)
      || productSlug.startsWith(slug)
      || slug.startsWith(productSlug);
  });

  // If no known category but we found products, create a virtual category
  const categoryName = category?.name
    || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const categoryDesc = category?.description || `Browse ${categoryName} products on ShopMO.`;

  if (!category && filteredListings.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">{categoryName}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{categoryName}</h1>
        <p className="text-muted-foreground mt-1">{categoryDesc}</p>
        <p className="text-sm text-muted-foreground mt-1">{filteredListings.length} products found</p>
      </div>

      {/* Products */}
      {filteredListings.length > 0 ? (
        <ProductGrid listings={filteredListings} />
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No products found in this category yet.</p>
          <Link href="/products" className="text-primary hover:underline mt-2 inline-block">
            Browse all products
          </Link>
        </div>
      )}
    </div>
  );
}
