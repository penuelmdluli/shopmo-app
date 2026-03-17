import { MetadataRoute } from "next";

const SITE_URL = "https://shopmoo.co.za";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account/", "/checkout/", "/cart"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/account/", "/checkout/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
