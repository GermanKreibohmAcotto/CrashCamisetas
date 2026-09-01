"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCart, MAX_QTY_PER_ITEM } from "@/lib/cart-context";
import { useCartPrices } from "@/lib/use-cart-prices";
import { useCartStock } from "@/lib/use-cart-stock";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { X } from "lucide-react";
import { formatPrice, parsePrice } from "@/lib/format";
import type { CartItem } from "@/lib/types";
import type { PriceMap } from "@/lib/whatsapp";

export function CartView() {
  const { items, hydrated, setQty, removeItem, clear } = useCart();
  // Llamado sin condiciones, antes de los early return de abajo: las
  // reglas de hooks no permiten saltearlo cuando !hydrated o el carrito
  // está vacío. Con items = [] el hook no dispara ningún fetch.
  const { prices, loading: pricesLoading } = useCartPrices(items);
  const { stock } = useCartStock(items);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-margin-mobile py-16 text-center text-on-surface-variant md:px-margin-desktop">
        Cargando tu pedido…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-margin-mobile py-16 md:px-margin-desktop">
        <p className="text-on-surface-variant">
          Todavía no agregaste nada a tu pedido.
        </p>
        <Link
          href="/catalogo"
          className="skew-slant border-2 border-primary px-6 py-3 font-display text-headline-sm uppercase text-primary transition-all hover:bg-primary/10"
        >
          <span className="skew-slant block">Ver catálogo</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-margin-mobile py-12 md:px-margin-desktop">
      <h1 className="mb-8 font-display text-headline-lg uppercase text-on-surface">
        Tu Pedido
      </h1>

      <ul className="mb-8 flex flex-col divide-y divide-outline-variant/30 border-t border-outline-variant/30">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const price = parsePrice(prices.get(item.productId));
            const subtotal = price !== null ? formatPrice(price * item.qty) : null;

            // Tope real para este talle: el stock recién leído de Supabase,
            // con el techo minorista. Mientras el stock todavía no cargó,
            // cae solo al techo minorista — no bloquea la interacción
            // mientras se espera la respuesta.
            const variantStock = stock.get(item.variantId);
            const stockCap =
              variantStock !== undefined
                ? Math.min(variantStock, MAX_QTY_PER_ITEM)
                : MAX_QTY_PER_ITEM;
            // Si el admin bajó el stock mientras el carrito seguía abierto,
            // se avisa en vez de recortar la cantidad sola — un carrito que
            // cambia números sin que lo toques es peor que uno que avisa.
            const overStock =
              variantStock !== undefined && item.qty > stockCap;

            return (
            <motion.li
              key={item.variantId}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4 overflow-hidden py-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-surface-container-low">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-on-surface-variant">
                    Sin foto
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link
                  href={`/producto/${item.productSlug}`}
                  className="font-display uppercase text-on-surface transition-colors hover:text-primary"
                >
                  {item.productName}
                </Link>
                <p className="text-sm text-on-surface-variant">
                  Talle {item.size}
                </p>
                {!pricesLoading && (
                  <p className="text-sm text-primary">
                    {subtotal ?? "Precio a confirmar"}
                  </p>
                )}
                {overStock && (
                  <p className="text-xs text-error">
                    Solo quedan {variantStock} disponibles
                  </p>
                )}
              </div>

              <input
                type="number"
                min={1}
                max={stockCap}
                value={item.qty}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (!next || next < 1) {
                    removeItem(item.variantId);
                  } else {
                    setQty(item.variantId, next, stockCap);
                  }
                }}
                aria-label={`Cantidad de ${item.productName}, talle ${item.size}`}
                className="w-16 border-b-2 border-outline bg-surface-container-high px-2 py-1 text-center text-on-surface outline-none transition-colors focus:border-primary"
              />

              <button
                type="button"
                onClick={() => removeItem(item.variantId)}
                aria-label={`Quitar ${item.productName}`}
                className="text-on-surface-variant transition-colors hover:text-error"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {!pricesLoading && (
        <CartTotal items={items} prices={prices} />
      )}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={clear}
          className="text-left font-label text-label-caps uppercase text-on-surface-variant transition-colors hover:text-error"
        >
          Vaciar pedido
        </button>
        <WhatsAppButton items={items} prices={prices} pricesLoading={pricesLoading} />
      </div>
    </div>
  );
}

// Total del pedido, sumando solo lo que tiene precio cargado. Si ningún
// ítem lo tiene todavía (el estado de todos los productos hoy), no
// renderiza nada — el carrito se ve igual que antes de este cambio.
function CartTotal({ items, prices }: { items: CartItem[]; prices: PriceMap }) {
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  const { known, missingQty } = items.reduce(
    (acc, item) => {
      const price = parsePrice(prices.get(item.productId));
      if (price !== null) {
        acc.known += price * item.qty;
      } else {
        acc.missingQty += item.qty;
      }
      return acc;
    },
    { known: 0, missingQty: 0 },
  );

  if (missingQty === totalQty) return null;

  return (
    <div className="mb-8 flex items-center justify-between border-t border-outline-variant/30 pt-4">
      <span className="font-label text-label-caps uppercase text-on-surface-variant">
        Total
      </span>
      <span className="font-display text-headline-md text-primary">
        {formatPrice(known)}
        {missingQty > 0 && (
          <span className="ml-2 text-sm text-on-surface-variant">
            + {missingQty} a confirmar
          </span>
        )}
      </span>
    </div>
  );
}
