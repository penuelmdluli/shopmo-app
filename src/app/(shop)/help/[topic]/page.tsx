import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface HelpTopicPageProps {
  params: Promise<{ topic: string }>;
}

const HELP_CONTENT: Record<string, { title: string; sections: { q: string; a: string }[] }> = {
  orders: {
    title: "Orders & Delivery",
    sections: [
      {
        q: "How do I track my order?",
        a: "You can track your order at any time by visiting the Track Order page and entering your order number (starts with SM-). You will also receive email updates as your order progresses through each stage.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 3-5 business days. Express delivery takes 1-2 business days. Same-day delivery is available for orders placed before 12pm (select areas). Pargo pickup points are usually ready within 3-4 business days.",
      },
      {
        q: "What are the shipping costs?",
        a: "Free delivery on all orders over R500. Standard: R65. Express: R99. Same-day: R149. Pargo Pickup: R45 at 4000+ locations (Checkers, Shell, PEP stores).",
      },
      {
        q: "Which areas do you deliver to?",
        a: "We deliver to all 9 provinces in South Africa. Our courier partners include The Courier Guy, Pargo, Aramex, and Bob Go.",
      },
      {
        q: "Can I change my delivery address after ordering?",
        a: "Please contact us within 2 hours of placing your order and we will try to update the delivery address. Once the order has been dispatched, the address cannot be changed.",
      },
      {
        q: "What happens if I'm not home during delivery?",
        a: "The courier will attempt delivery and leave a notification. They will make a second attempt on the next business day. After 2 failed attempts, the parcel will be held at the nearest depot for 7 days.",
      },
    ],
  },
  returns: {
    title: "Returns & Refunds",
    sections: [
      {
        q: "What is your return policy?",
        a: "We offer a 30-day hassle-free return policy. Items must be unused, undamaged, and in their original packaging. Electronics must include all accessories and manuals.",
      },
      {
        q: "How do I return a product?",
        a: "Contact our support team via email at support@shopmoo.co.za or use the chat feature. We will arrange a courier collection at no cost to you. Once we receive the item and verify its condition, we will process your refund within 5-7 business days.",
      },
      {
        q: "Can I exchange instead of getting a refund?",
        a: "Yes! You can choose either a full refund or an exchange for a different product of equal or lesser value. If the exchange item costs more, you only pay the difference.",
      },
      {
        q: "How long does a refund take?",
        a: "Once we receive your returned item, refunds are processed within 5-7 business days. Credit card refunds may take an additional 3-5 business days to appear on your statement.",
      },
      {
        q: "What if my item arrived damaged?",
        a: "We are really sorry! Please contact us immediately with photos of the damage. We will arrange a free collection and send a replacement or full refund, your choice. Use code SHOPMO10 for 10% off your next order as our apology.",
      },
    ],
  },
  payment: {
    title: "Payment",
    sections: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Credit/Debit Cards (Visa, Mastercard, Amex), EFT bank transfer, Instant EFT via Ozow, SnapScan QR payments, and Mobicred buy-now-pay-later. All payments are secured with SSL encryption.",
      },
      {
        q: "Is it safe to pay online?",
        a: "Absolutely. All transactions are processed through Yoco, South Africa's leading payment provider. We use 256-bit SSL encryption and never store your card details on our servers.",
      },
      {
        q: "My payment failed. What should I do?",
        a: "First, check that your card details are correct and that you have sufficient funds. If the problem persists, try a different payment method or contact your bank. You can also try Instant EFT or SnapScan as alternatives.",
      },
      {
        q: "Can I pay in installments?",
        a: "Yes! Select Mobicred at checkout to split your payment into affordable monthly installments. Terms and conditions apply. You need a Mobicred account which you can sign up for at mobicred.co.za.",
      },
      {
        q: "How do I apply a coupon code?",
        a: "Enter your coupon code in the 'Coupon Code' field on the cart page or during checkout. Click Apply and the discount will be reflected in your order total. Only one coupon can be used per order.",
      },
    ],
  },
  account: {
    title: "Account",
    sections: [
      {
        q: "Do I need an account to shop?",
        a: "No! You can checkout as a guest. However, creating an account lets you track orders, save your wishlist, earn loyalty points, and checkout faster next time.",
      },
      {
        q: "How do I create an account?",
        a: "Click 'Sign Up' at the top of the page and enter your email address. You can also sign up during checkout. It takes less than a minute!",
      },
      {
        q: "I forgot my password",
        a: "Click 'Forgot Password' on the login page and enter your email. We will send you a link to reset your password. The link expires after 24 hours.",
      },
      {
        q: "How do I update my details?",
        a: "Log in to your account and go to Profile. You can update your name, email, phone number, and delivery addresses.",
      },
      {
        q: "How do I delete my account?",
        a: "Please contact our support team at support@shopmoo.co.za. We will process your account deletion request within 48 hours. Note that order history will be retained for legal compliance.",
      },
    ],
  },
  "returns-policy": {
    title: "Returns Policy",
    sections: [
      {
        q: "30-Day Hassle-Free Returns",
        a: "At ShopMO, we want you to be completely satisfied with every purchase. If you are not happy with your order, you can return it within 30 days of delivery for a full refund or exchange.",
      },
      {
        q: "Conditions for Returns",
        a: "Items must be unused and in their original packaging. Electronics must include all accessories, manuals, and original cables. Items damaged through misuse are not eligible for return.",
      },
      {
        q: "How to Initiate a Return",
        a: "Contact our support team via email or chat. Provide your order number and reason for return. We will arrange courier collection at no cost to you.",
      },
      {
        q: "Refund Processing",
        a: "Refunds are processed within 5-7 business days of receiving the returned item. The refund will be issued to the original payment method. Card refunds may take an additional 3-5 business days.",
      },
    ],
  },
  shipping: {
    title: "Shipping Information",
    sections: [
      {
        q: "Delivery Options",
        a: "Free delivery on orders over R500. Standard (R65, 3-5 days), Express (R99, 1-2 days), Same-Day (R149, order before 12pm), Pargo Pickup (R45, 4000+ locations).",
      },
      {
        q: "Courier Partners",
        a: "We work with The Courier Guy, Pargo, Aramex, and Bob Go to ensure reliable delivery across all 9 South African provinces.",
      },
      {
        q: "Tracking Your Delivery",
        a: "Once your order is dispatched, you will receive a tracking number via email. Use this on our Track Order page or the courier's website to follow your delivery in real time.",
      },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    sections: [
      {
        q: "Is ShopMO a legitimate store?",
        a: "Yes! ShopMO is a registered South African online store. We are based in Pretoria and deliver nationwide. All products are genuine and come with manufacturer warranty.",
      },
      {
        q: "Do you price match?",
        a: "Yes! If you find the same product cheaper at another authorised South African retailer, let us know and we will match the price. Simply send us a link or screenshot of the lower price.",
      },
      {
        q: "How do I contact support?",
        a: "You can reach us via email at support@shopmoo.co.za, phone at 079 257 2466, or use the AI chat assistant available on every page. Our team is available Monday to Friday, 8am-5pm.",
      },
      {
        q: "Do products come with warranty?",
        a: "All products come with the standard manufacturer warranty. Electronics typically have a 1-year warranty. Warranty claims should be directed to our support team.",
      },
    ],
  },
};

export async function generateMetadata({ params }: HelpTopicPageProps): Promise<Metadata> {
  const { topic } = await params;
  const content = HELP_CONTENT[topic];
  return {
    title: content ? `${content.title} - Help Centre` : "Help Centre",
    description: content
      ? `Get help with ${content.title.toLowerCase()} at ShopMO. Find answers to common questions.`
      : "ShopMO Help Centre",
  };
}

export default async function HelpTopicPage({ params }: HelpTopicPageProps) {
  const { topic } = await params;
  const content = HELP_CONTENT[topic];

  if (!content) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Topic Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We could not find help content for this topic.
        </p>
        <Link
          href="/help"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Help Centre
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/help" className="hover:text-primary transition-colors">Help Centre</Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">{content.title}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">{content.title}</h1>

      {/* FAQ Accordion-style */}
      <div className="space-y-4">
        {content.sections.map((section, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-2">{section.q}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{section.a}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-10 bg-primary/5 border border-primary/10 rounded-xl p-6 text-center">
        <h3 className="font-bold text-gray-900 mb-2">Still have questions?</h3>
        <p className="text-sm text-gray-500 mb-4">Our team is here to help!</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:support@shopmoo.co.za"
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Email Support
          </a>
          <Link
            href="/help"
            className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-white transition-colors text-sm font-medium text-gray-700"
          >
            Browse All Topics
          </Link>
        </div>
      </div>
    </div>
  );
}
