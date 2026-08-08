"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/cart-context";
import { IconCart } from "@/components/icons";

export function CartButton() {
  const { totalQty, hydrated } = useCart();
  // Antes de hidratar, el server y el cliente muestran lo mismo (sin
  // contador) para no generar un hydration mismatch.
  const showCount = hydrated && totalQty > 0;

  return (
    <Link
      href="/carrito"
      className="relative text-on-surface transition-colors hover:text-primary"
      aria-label="Ver pedido"
    >
      <IconCart className="h-6 w-6" />
      <AnimatePresence>
        {showCount && (
          <motion.span
            key={totalQty}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 font-label text-[10px] font-bold text-on-secondary"
          >
            {totalQty}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
