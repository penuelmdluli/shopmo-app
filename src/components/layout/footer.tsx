import Link from "next/link";
import { Package, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-footer-bg text-footer-text">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package size={18} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-white">
                Shop<span className="text-primary">MO</span>
              </span>
            </div>
            <p className="text-sm text-footer-text mb-4">
              South Africa&apos;s smartest online store. AI-powered shopping with fast delivery nationwide.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com/shopmoo" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook size={16} />
              </a>
              <a href="https://instagram.com/shopmoo_za" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram size={16} />
              </a>
              <a href="https://x.com/shopmoo_za" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/categories/electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href="/categories/home-kitchen" className="hover:text-white transition-colors">Home & Kitchen</Link></li>
              <li><Link href="/categories/fashion" className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link href="/deals" className="hover:text-white transition-colors">Deals & Specials</Link></li>
              <li><Link href="/gift-cards" className="hover:text-white transition-colors">Gift Cards</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Centre</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/help/returns-policy" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/help/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link href="/help/faq" className="hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                <span>support@shopmoo.co.za</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary" />
                <span>079 257 2466</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-primary mt-0.5" />
                <span>Pretoria, Gauteng<br />South Africa</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment & Shipping Partners */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">
              <span className="text-white/60">Payment Partners:</span>
              <span className="ml-2 text-white/80">Yoco | Visa | Mastercard | Apple Pay | SnapScan</span>
            </div>
            <div className="text-sm">
              <span className="text-white/60">Delivery Partners:</span>
              <span className="ml-2 text-white/80">The Courier Guy | Pargo | Fastway | Aramex</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-footer-text">
            &copy; {new Date().getFullYear()} ShopMO. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
