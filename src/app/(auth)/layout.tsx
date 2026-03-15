import Link from "next/link";
import { Package } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Package size={22} className="text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">
          Shop<span className="text-primary">MO</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {children}
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="mt-6 text-sm text-gray-500 hover:text-primary transition-colors"
      >
        &larr; Back to ShopMO
      </Link>
    </div>
  );
}
