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
    "Shop 127+ trending products with AI-powered recommendations. Free delivery over R500. Secure payments via Yoco. Fast shipping across South Africa. Electronics, fashion, home & more.",
  keywords: ["online shopping", "South Africa", "e-commerce", "trending products", "fast delivery", "ShopMO", "Takealot alternative", "cheap online shopping SA", "buy online South Africa", "online store SA", "best deals South Africa"],
  verification: {
    google: "d5e2a520578255e1",
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://shopmoo.co.za",
    siteName: "ShopMO",
    title: "ShopMO - South Africa's Smartest Online Store | 127+ Products",
    description: "Shop 127+ trending products. Free delivery over R500. AI shopping assistant. Secure Yoco payments. Electronics, fashion, home & kitchen deals.",
    images: [{ url: "https://shopmoo.co.za/api/og", width: 1200, height: 630, alt: "ShopMO - South Africa's Smartest Online Store" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopMO - South Africa's Smartest Online Store",
    description: "Shop 127+ trending products with AI-powered recommendations. Free delivery over R500. Fast delivery across SA.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0891b2",
  width: "device-width",
  initialScale: 1,
};

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Google Analytics (GA4) */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
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
