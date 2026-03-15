"use client";

interface ProductImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}

export function ProductImage({ src, fallbackSrc, alt, className }: ProductImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.currentTarget;
        if (fallbackSrc && target.src !== fallbackSrc) {
          target.src = fallbackSrc;
        } else {
          target.style.display = "none";
        }
      }}
    />
  );
}
