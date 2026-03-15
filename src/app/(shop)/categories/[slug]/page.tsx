import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { MOCK_LISTINGS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { ProductGrid } from "@/components/product/product-grid";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: category.name,
    description: category.description || `Browse ${category.name} products on ShopMO.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const filteredListings = MOCK_LISTINGS.filter(
    (l) => l.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-").toLowerCase() === slug
      || l.category === category.name
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-1">{category.description}</p>
        )}
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
