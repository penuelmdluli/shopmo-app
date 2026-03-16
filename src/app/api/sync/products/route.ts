import { NextResponse } from "next/server";
import { getListings } from "@/lib/supabase/queries";

// API endpoint for SellBot to fetch ShopMO product catalog
// SellBot calls this to stay in sync with what ShopMO is selling
// When a customer orders on ShopMO, SellBot knows which vendor to source from

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const inStock = searchParams.get("in_stock");
  const updatedSince = searchParams.get("updated_since");

  let products = await getListings();

  // Filter by category
  if (category) {
    products = products.filter(
      (p) => p.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-") === category
    );
  }

  // Filter by stock status
  if (inStock === "true") {
    products = products.filter((p) => p.is_in_stock);
  }

  // Filter by last update time (for incremental sync)
  if (updatedSince) {
    const since = new Date(updatedSince);
    products = products.filter((p) => new Date(p.updated_at) >= since);
  }

  return NextResponse.json({
    success: true,
    count: products.length,
    products: products.map((p) => ({
      id: p.id,
      product_id: p.product_id,
      title: p.title,
      slug: p.slug,
      sku: p.sku,
      category: p.category,
      current_price: p.current_price,
      original_price: p.original_price,
      stock_quantity: p.stock_quantity,
      is_in_stock: p.is_in_stock,
      brand: p.brand,
      images: p.images,
      attributes: p.attributes,
      status: p.status,
      updated_at: p.updated_at,
    })),
    synced_at: new Date().toISOString(),
  });
}
