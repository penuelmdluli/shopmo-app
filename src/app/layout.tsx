import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/providers/providers";
import { ChatWidget } from "@/components/chat/chat-widget";
import { RecentPurchaseToast } from "@/components/shared/social-proof";
import { SpinToWin } from "@/components/engagement/spin-to-win";
import { ExitIntentPopup } from "@/components/engagement/exit-intent-popup";
import { FirstVisitBanner } from "@/components/engagement/first-visit-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ShopMO - South Africa's Smartest Online Store",
    template: "%s | ShopMO",
  },
  description:
    "Shop 32+ trending products with AI-powered recommendations. Free delivery over R500. Secure payments via Yoco. Fast shipping across South Africa.",
  keywords: ["online shopping", "South Africa", "e-commerce", "trending products", "fast delivery", "ShopMO", "Takealot alternative", "cheap online shopping SA"],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://shopmo-app.gaptogold.workers.dev",
    siteName: "ShopMO",
    title: "ShopMO - South Africa's Smartest Online Store",
    description: "Shop 32+ trending products. Free delivery over R500. AI shopping assistant. Secure Yoco payments.",
    images: [{ url: "https://shopmo-app.gaptogold.workers.dev/og-image.png", width: 1200, height: 630, alt: "ShopMO" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopMO - South Africa's Smartest Online Store",
    description: "Shop trending products with AI-powered recommendations. Fast delivery across SA.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0891b2",
  width: "device-width",
  initialScale: 1,
};

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Facebook Pixel */}
        {FB_PIXEL_ID && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
        {FB_PIXEL_ID && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <FirstVisitBanner />
          {children}
          <ChatWidget />
          <RecentPurchaseToast />
          <SpinToWin />
          <ExitIntentPopup />
        </Providers>
      </body>
    </html>
  );
}
