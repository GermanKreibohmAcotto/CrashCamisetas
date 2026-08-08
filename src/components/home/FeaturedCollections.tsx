"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconArrowLeft, IconArrowRight } from "@/components/icons";
import type { Category } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export type CollectionCard = {
  category: Category;
  imageUrl: string | null;
};

// Carrusel horizontal con scroll-snap, alimentado por las categorías
// reales. La imagen de portada es la del producto más nuevo de esa
// categoría (las categorías no tienen foto propia); sin productos con
// foto, cae a un degradado liso.
export function FeaturedCollections({
  collections,
}: {
  collections: CollectionCard[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCards(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * 424, behavior: "smooth" });
  }

  if (collections.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-surface py-24">
      <div className="mx-auto mb-12 max-w-7xl px-margin-mobile md:px-margin-desktop">
        <Reveal className="flex items-end justify-between">
          <div>
            <span className="mb-2 block font-label text-label-caps uppercase text-secondary">
              Elegí tu Bando
            </span>
            <h2 className="font-display text-headline-lg uppercase text-on-surface">
              Colecciones Destacadas
            </h2>
          </div>
          {collections.length > 1 && (
            <div className="hidden gap-4 md:flex">
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                aria-label="Anterior"
                className="skew-slant flex h-12 w-12 items-center justify-center border border-outline-variant bg-surface-container text-primary transition-colors hover:border-primary hover:bg-surface-container-high"
              >
                <IconArrowLeft className="skew-slant h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                aria-label="Siguiente"
                className="skew-slant flex h-12 w-12 items-center justify-center bg-primary text-on-primary shadow-[0_0_15px_rgba(151,204,254,0.3)] transition-colors hover:bg-primary-fixed"
              >
                <IconArrowRight className="skew-slant h-5 w-5" />
              </button>
            </div>
          )}
        </Reveal>
      </div>

      <div
        ref={scrollerRef}
        className="w-full snap-x snap-mandatory overflow-x-auto scroll-smooth pb-8"
      >
        <Stagger className="flex w-max gap-6 px-margin-mobile md:px-margin-desktop">
          {collections.map(({ category, imageUrl }) => (
            <StaggerItem key={category.id}>
              <Link
                href={`/catalogo?categoria=${category.slug}`}
                className="skew-slant group relative block h-[500px] w-[85vw] shrink-0 snap-center overflow-hidden rounded-sm bg-surface-container shadow-xl transition-shadow duration-500 hover:shadow-2xl md:w-[400px]"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    sizes="400px"
                    className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high to-surface-container-low" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                <div className="skew-counter absolute bottom-0 left-0 w-full p-8">
                  <h3 className="font-display text-headline-md uppercase text-on-surface transition-colors group-hover:text-primary">
                    {category.name}
                  </h3>
                  <div className="mt-4 h-1 w-12 origin-left scale-x-0 bg-secondary transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
