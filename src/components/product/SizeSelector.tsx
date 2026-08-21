"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/cart-context";
import { Check } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import type { ProductWithVariants } from "@/lib/types";

// Reemplaza el <select> original por la grilla de talles del diseño y
// absorbe la lógica que antes vivía en AddToCart.tsx. El botón de
// acción queda fijo al pie en mobile (fixed) y vuelve al flujo normal
// en desktop (lg:static) — mismo elemento, sin duplicar el botón.
export function SizeSelector({ product }: { product: ProductWithVariants }) {
  const { addItem } = useCart();
  const variants = product.variants;
  const firstInStock = variants.find((v) => v.stock > 0);
  const allSoldOut = !firstInStock;

  const [variantId, setVariantId] = useState(firstInStock?.id ?? "");
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === variantId);
  const maxQty = selectedVariant?.stock ?? 1;

  if (allSoldOut) {
    return (
      <p className="rounded-sm border border-outline-variant bg-surface-container px-4 py-3 text-on-surface-variant">
        No queda stock de ningún talle por ahora.
      </p>
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedVariant || selectedVariant.stock < 1) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      size: selectedVariant.size,
      imageUrl: product.image_url,
      qty: Math.min(qty, selectedVariant.stock),
    });

    setJustAdded(true);
  }

  const pinnedButtonClasses =
    "skew-slant fixed inset-x-4 bottom-4 z-40 flex items-center justify-center gap-3 px-8 py-5 font-display text-headline-sm shadow-2xl transition-all lg:static lg:inset-auto lg:shadow-none";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-24 lg:pb-0">
      <div>
        <h3 className="mb-3 font-label text-label-caps uppercase text-on-surface-variant">
          Seleccionar Talle
        </h3>
        <div className="flex flex-wrap gap-3">
          {variants.map((variant) => {
            const active = variant.id === variantId;
            const disabled = variant.stock === 0;
            return (
              <button
                key={variant.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setVariantId(variant.id);
                  setQty(1);
                  setJustAdded(false);
                }}
                className={`flex h-14 w-14 items-center justify-center border font-label text-sm uppercase transition-colors ${
                  disabled
                    ? "cursor-not-allowed border-outline-variant/50 text-on-surface-variant/40 line-through"
                    : active
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant text-on-surface hover:border-primary"
                }`}
              >
                {variant.size}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex max-w-[160px] flex-col gap-2">
        <span className="font-label text-label-caps uppercase text-on-surface-variant">
          Cantidad
        </span>
        <input
          type="number"
          min={1}
          max={maxQty}
          value={qty}
          onChange={(e) => {
            const next = Number(e.target.value) || 1;
            setQty(Math.min(Math.max(next, 1), maxQty));
            setJustAdded(false);
          }}
          className="border-b-2 border-outline bg-surface-container-high px-4 py-2 text-on-surface outline-none transition-colors focus:border-primary"
        />
      </label>

      <AnimatePresence mode="wait" initial={false}>
        {justAdded ? (
          <motion.div
            key="added"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/carrito"
              className={`${pinnedButtonClasses} bg-tertiary text-on-tertiary`}
            >
              <Check className="skew-slant h-5 w-5" />
              <span className="skew-slant uppercase">Agregado — Ver pedido</span>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="submit"
              className={`${pinnedButtonClasses} bg-whatsapp text-white hover:brightness-110 active:translate-y-1`}
            >
              <SiWhatsapp className="skew-slant h-5 w-5" />
              <span className="skew-slant uppercase">Agregar al pedido</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
