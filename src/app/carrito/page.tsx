import type { Metadata } from "next";
import { CartView } from "./CartView";

// El carrito es un checkout personal, sin valor de búsqueda — ya
// bloqueado en robots.ts. Esto es el segundo cinturón: si un crawler
// llega igual por un link externo, que no lo indexe.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartView />;
}
