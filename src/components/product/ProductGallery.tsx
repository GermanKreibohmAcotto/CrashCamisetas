"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { BADGE_LABEL, type ProductBadge, type ProductImage } from "@/lib/types";

type GalleryImage = { id: string; url: string };

type ProductGalleryProps = {
  productName: string;
  coverUrl: string | null;
  images: ProductImage[];
  badge?: ProductBadge | null;
};

// La portada (products.image_url) siempre va primero; el resto son las
// fotos adicionales de product_images. Sin ninguna de las dos, muestra
// el estado "sin foto" — nunca revienta.
export function ProductGallery({
  productName,
  coverUrl,
  images,
  badge,
}: ProductGalleryProps) {
  const allImages: GalleryImage[] = [
    ...(coverUrl ? [{ id: "cover", url: coverUrl }] : []),
    ...images.map((img) => ({ id: img.id, url: img.url })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const active = allImages[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-surface-container-low">
        {badge && (
          <div className="skew-slant absolute left-4 top-4 z-20 bg-secondary px-3 py-1.5">
            <span className="skew-slant block font-label text-xs font-bold uppercase text-on-secondary">
              {BADGE_LABEL[badge]}
            </span>
          </div>
        )}
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={active.url}
                alt={productName}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-contain p-6"
              />
            </motion.div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
              Sin foto
            </div>
          )}
        </AnimatePresence>
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border-2 bg-surface-container-low transition-colors ${
                i === activeIndex
                  ? "border-primary"
                  : "border-transparent hover:border-outline-variant"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
