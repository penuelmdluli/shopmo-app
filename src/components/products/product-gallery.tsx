"use client";

import { useState, useRef, useCallback } from "react";
import { ShoppingCart, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { ProductImage } from "@/components/shared/product-image";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const mainImageRef = useRef<HTMLDivElement>(null);

  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[selectedIndex] : null;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, []);

  const handleMouseEnter = useCallback(() => setIsZooming(true), []);
  const handleMouseLeave = useCallback(() => setIsZooming(false), []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  const lightboxPrev = () => {
    setLightboxIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  };

  const lightboxNext = () => {
    setLightboxIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  };

  if (!hasImages) {
    return (
      <div>
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center text-gray-300">
          <ShoppingCart size={80} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-200">
              <ShoppingCart size={24} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Main Image with Zoom */}
        <div
          ref={mainImageRef}
          className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 relative cursor-zoom-in group"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => openLightbox(selectedIndex)}
        >
          {/* Normal Image */}
          <ProductImage
            src={currentImage!}
            fallbackSrc={images.length > 1 ? images[1] : undefined}
            alt={title}
            className="w-full h-full object-contain p-4 transition-opacity duration-200"
          />

          {/* Zoom Overlay — shows zoomed-in portion on hover */}
          {isZooming && (
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundSize: "250%",
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                backgroundRepeat: "no-repeat",
              }}
            />
          )}

          {/* Zoom hint icon */}
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
            <ZoomIn size={18} className="text-gray-700" />
          </div>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:border-primary/50 ${
                selectedIndex === i
                  ? "border-primary ring-1 ring-primary/20"
                  : "border-transparent"
              }`}
            >
              <ProductImage
                src={img}
                alt={`${title} ${i + 1}`}
                className="w-full h-full object-contain p-1"
              />
            </button>
          ))}
          {/* Fill remaining slots if fewer than 4 images */}
          {images.length < 4 &&
            Array.from({ length: 4 - images.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-200 border-2 border-transparent"
              >
                <ShoppingCart size={24} />
              </div>
            ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-50"
          >
            <X size={24} />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 text-white/60 text-sm z-50">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors z-50"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors z-50"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Full-size Image */}
          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]}
              alt={`${title} - Full View ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    lightboxIndex === i
                      ? "border-white opacity-100"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-contain bg-white/10 p-0.5"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
