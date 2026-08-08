"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function CartButton() {
  const { totalQty, hydrated } = useCart();
  // Antes de hidratar, el server y el cliente muestran lo mismo ("Pedido"
  // sin número) para no generar un hydration mismatch.
  const showCount = hydrated && totalQty > 0;

  return (
    <Link href="/carrito" className="cart-button">
      Pedido{showCount ? ` (${totalQty})` : ""}
    </Link>
  );
}
