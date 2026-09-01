import Image from "next/image";
import Link from "next/link";
import { BADGE_LABEL, type ProductWithVariants } from "@/lib/types";
import { buildProductInquiryUrl, isWhatsAppNumberConfigured } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";

// Server Component: todo el hover/overlay es CSS puro (group-hover),
// el único link interactivo es un <a> directo a WhatsApp — no hace
// falta "use client" ni JS extra por tarjeta.
//
// priority: la foto de la primera tarjeta de una grilla suele ser el
// LCP (Largest Contentful Paint) de la página — pasarla en false (el
// default) la deja lazy, que es lo correcto para el resto de la grilla.
export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductWithVariants;
  priority?: boolean;
}) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const soldOut = totalStock === 0;
  const price = formatPrice(product.price);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-sm border border-outline-variant/30 bg-surface-container p-4 shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      {product.badge && (
        <div className="skew-slant absolute left-4 top-4 z-30 bg-secondary px-2 py-1">
          <span className="skew-slant block font-label text-[10px] font-bold uppercase text-on-secondary">
            {BADGE_LABEL[product.badge]}
          </span>
        </div>
      )}

      <Link
        href={`/producto/${product.slug}`}
        className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden bg-surface-container-low p-4"
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="relative z-10 object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="relative z-10 text-sm text-on-surface-variant">
            Sin foto
          </span>
        )}

        <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          <span className="skew-slant bg-secondary px-4 py-2 font-label text-label-caps uppercase text-on-secondary shadow-lg">
            Ver Detalle
          </span>
        </div>
      </Link>

      <div className="mt-auto flex flex-col gap-1">
        <Link href={`/producto/${product.slug}`}>
          <h3
            className="truncate font-display text-[18px] uppercase text-on-surface"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>
        {product.categories.length > 0 && (
          <p className="truncate text-sm text-on-surface-variant">
            {product.categories.map((c) => c.name).join(" · ")}
          </p>
        )}

        {price && (
          <span className="mt-3 font-display text-headline-sm text-primary">
            {price}
          </span>
        )}

        {soldOut ? (
          <span className="skew-slant mt-3 flex items-center justify-center border border-outline-variant/50 py-2.5 font-label text-label-caps uppercase text-on-surface-variant">
            <span className="skew-slant">Agotado</span>
          </span>
        ) : (
          isWhatsAppNumberConfigured() && (
            <a
              href={buildProductInquiryUrl(product.name, product.price)}
              target="_blank"
              rel="noopener noreferrer"
              className="skew-slant mt-3 flex items-center justify-center gap-2 bg-whatsapp py-2.5 font-label text-label-caps uppercase text-white transition-all hover:brightness-110 active:translate-y-0.5"
            >
              <SiWhatsapp className="skew-slant h-4 w-4" />
              <span className="skew-slant">Consultar</span>
            </a>
          )
        )}
      </div>
    </div>
  );
}
