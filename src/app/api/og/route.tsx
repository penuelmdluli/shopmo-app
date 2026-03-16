import { NextResponse } from "next/server";

export async function GET() {
  // Redirect to the static OG image for better Cloudflare Workers compatibility
  return NextResponse.redirect(new URL("/og-image.png", "https://shopmoo.co.za"), 302);
}
