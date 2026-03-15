import Link from "next/link";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-gray-400" aria-hidden="true">
                  /
                </span>
              )}

              {isLast ? (
                <span className="font-medium text-gray-900" aria-current="page">
                  {isFirst && <Home className="mr-1 inline h-3.5 w-3.5" />}
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "text-gray-500 hover:text-gray-700 transition-colors"
                  )}
                >
                  {isFirst && <Home className="mr-1 inline h-3.5 w-3.5" />}
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-500">
                  {isFirst && <Home className="mr-1 inline h-3.5 w-3.5" />}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
