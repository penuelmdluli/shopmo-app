import Link from "next/link";
import { ChevronRight, Package, Smartphone, Home, Shirt, Heart, Dumbbell, Gamepad2, Car, Flower2 } from "lucide-react";
import { getCategories } from "@/lib/supabase/queries";

const ICON_MAP: Record<string, React.ElementType> = {
  Smartphone, Home, Shirt, Heart, Dumbbell, Gamepad2, Car, Flower2,
};

const CATEGORY_COLORS = [
  "bg-cyan-50 text-cyan-700 border-cyan-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-pink-50 text-pink-700 border-pink-200",
  "bg-green-50 text-green-700 border-green-200",
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-red-50 text-red-700 border-red-200",
  "bg-yellow-50 text-yellow-700 border-yellow-200",
];

export const metadata = {
  title: "Shop by Category",
  description: "Browse products by category. Electronics, Home & Kitchen, Fashion, Beauty and more.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">Categories</span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground mb-6">Shop by Category</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => {
          const Icon = ICON_MAP[cat.icon_name || "Package"] || Package;
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className={`${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} p-6 rounded-xl border hover:shadow-lg transition-all group`}
            >
              <Icon size={36} className="mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-lg font-semibold mb-1">{cat.name}</h2>
              <p className="text-sm opacity-80">{cat.description}</p>
              <div className="flex items-center gap-1 mt-3 text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                Browse <ChevronRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
