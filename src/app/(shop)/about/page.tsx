import { Package, Target, Eye, Users, Zap, Shield, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          About Shop<span className="text-primary">MO</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          South Africa&apos;s smartest online store, bringing you trending products with
          AI-powered recommendations and fast, reliable delivery nationwide.
        </p>
      </div>

      {/* Story */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
        <div className="space-y-4 text-gray-600">
          <p>
            ShopMO was born from a simple idea: online shopping in South Africa should be smarter,
            faster, and more accessible. Founded in Pretoria, we set out to build a platform that
            combines the best of technology with a deep understanding of what South African shoppers
            want.
          </p>
          <p>
            We use artificial intelligence to curate trending products, optimize pricing, and
            personalize your shopping experience. Whether you&apos;re looking for the latest
            electronics, home essentials, or fashion finds, ShopMO makes it easy to discover products
            you&apos;ll love at prices that make sense.
          </p>
          <p>
            Our partnerships with leading delivery providers like The Courier Guy, Pargo, Fastway,
            and Aramex mean your orders arrive quickly and safely, no matter where you are in
            South Africa.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <Target size={24} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-gray-600">
            To make online shopping in South Africa effortless by delivering the right products at
            the right prices, powered by smart technology and exceptional customer service.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <Eye size={24} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h2>
          <p className="text-gray-600">
            To become South Africa&apos;s most trusted and innovative e-commerce platform, where
            every shopper finds exactly what they need with confidence and convenience.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, title: "Innovation", desc: "AI-powered shopping experience" },
            { icon: Shield, title: "Trust", desc: "Secure payments and data protection" },
            { icon: Heart, title: "Customer First", desc: "Your satisfaction is our priority" },
            { icon: Users, title: "Community", desc: "Supporting local businesses and suppliers" },
          ].map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
