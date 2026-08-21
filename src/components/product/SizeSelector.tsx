"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCart, MAX_QTY_PER_ITEM } from "@/lib/cart-context";
import { Check, Minus, Plus } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import type { ProductWithVariants } from "@/lib/types";

// Reemplaza el <select> original por la grilla de talles del diseño y
// absorbe la lógica que antes vivía en AddToCart.tsx. El botón de
// acción queda fijo al pie en mobile (fixed) y vuelve al flujo normal
// en desktop (lg:static) — mismo elemento, sin duplicar el botón.
export function SizeSelector({ product }: { product: ProductWithVariants }) {
  const { addItem, items } = useCart();
  const variants = product.variants;
  const firstInStock = variants.find((v) => v.stock > 0);
  const allSoldOut = !firstInStock;

  const [variantId, setVariantId] = useState(firstInStock?.id ?? "");
  // String, no number: a diferencia del stock (que se valida en el
  // servidor), acá hace falta poder tener el campo vacío MIENTRAS se
  // escribe. Con un estado numérico y el idiom `Number(x) || 1`, borrar
  // el campo para tipear otra cosa rebotaba a 1 en el mismo keystroke —
  // el bug reportado de "no me deja modificar la cantidad".
  const [qtyText, setQtyText] = useState("1");
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === variantId);

  // Tope absoluto para ESTE talle: el stock real, con el techo minorista
  // de MAX_QTY_PER_ITEM. Lo que ya está en el carrito se resta acá — si
  // el pedido ya tiene 8 y el stock es 10, solo quedan 2 por agregar.
  // Este es el mismo cálculo que evita el otro bug reportado ("me deja
  // agregar infinitas camisetas"): antes solo se clampeaba la cantidad
  // de ESE click contra el stock, sin mirar lo que ya había en el pedido.
  const stockCap = selectedVariant
    ? Math.min(selectedVariant.stock, MAX_QTY_PER_ITEM)
    : 1;
  const alreadyInCart =
    items.find((item) => item.variantId === variantId)?.qty ?? 0;
  const remaining = Math.max(0, stockCap - alreadyInCart);

  if (allSoldOut) {
    return (
      <p className="rounded-sm border border-outline-variant bg-surface-container px-4 py-3 text-on-surface-variant">
        No queda stock de ningún talle por ahora.
      </p>
    );
  }

  // El número válido se DERIVA de qtyText en vez de vivir como estado
  // aparte: así el clamp real ocurre en un solo lugar, no repetido en
  // cada handler. Se llama en onBlur (no en onChange) — mientras se
  // escribe no se corrige nada, recién al salir del campo se normaliza.
  function clampedQty(): number {
    const parsed = Number(qtyText);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.min(Math.floor(parsed), Math.max(remaining, 1));
  }

  function commitQty() {
    setQtyText(String(clampedQty()));
  }

  function decrement() {
    setQtyText(String(Math.max(1, clampedQty() - 1)));
    setJustAdded(false);
  }

  function increment() {
    setQtyText(String(Math.min(remaining, clampedQty() + 1)));
    setJustAdded(false);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedVariant || remaining < 1) return;

    addItem(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        size: selectedVariant.size,
        imageUrl: product.image_url,
        qty: Math.min(clampedQty(), remaining),
      },
      stockCap,
    );

    setQtyText("1");
    setJustAdded(true);
  }

  const pinnedButtonClasses =
    "skew-slant fixed inset-x-4 bottom-4 z-40 flex items-center justify-center gap-3 px-8 py-5 font-display text-headline-sm shadow-2xl transition-all lg:static lg:inset-auto lg:shadow-none";

  const stepperButtonClasses =
    "flex h-10 w-10 shrink-0 items-center justify-center border border-outline-variant text-on-surface transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-outline-variant";

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
                  setQtyText("1");
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

      {remaining > 0 && (
        <label className="flex max-w-[200px] flex-col gap-2">
          <span className="font-label text-label-caps uppercase text-on-surface-variant">
            Cantidad
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={decrement}
              disabled={clampedQty() <= 1}
              aria-label="Restar"
              className={stepperButtonClasses}
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="text"
              inputMode="numeric"
              value={qtyText}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  setQtyText(value);
                  setJustAdded(false);
                }
              }}
              onBlur={commitQty}
              aria-label="Cantidad"
              className="w-14 border-b-2 border-outline bg-surface-container-high px-2 py-2 text-center text-on-surface outline-none transition-colors focus:border-primary"
            />
            <div className="group/qty relative">
              <button
                type="button"
                onClick={increment}
                disabled={clampedQty() >= remaining}
                aria-label="Sumar"
                className={stepperButtonClasses}
              >
                <Plus className="h-4 w-4" />
              </button>
              {clampedQty() >= remaining && (
                <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-sm bg-surface-container-high px-2 py-1 text-xs text-on-surface opacity-0 shadow-lg transition-opacity duration-150 group-hover/qty:opacity-100">
                  No hay más stock disponible
                </span>
              )}
            </div>
          </div>
        </label>
      )}

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
              disabled={remaining < 1}
              className={`${pinnedButtonClasses} ${
                remaining < 1
                  ? "cursor-not-allowed bg-surface-container-high text-on-surface-variant"
                  : "bg-whatsapp text-white hover:brightness-110 active:translate-y-1"
              }`}
            >
              {remaining < 1 ? (
                <span className="skew-slant uppercase">
                  Ya tenés el máximo en el pedido
                </span>
              ) : (
                <>
                  <SiWhatsapp className="skew-slant h-5 w-5" />
                  <span className="skew-slant uppercase">Agregar al pedido</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
