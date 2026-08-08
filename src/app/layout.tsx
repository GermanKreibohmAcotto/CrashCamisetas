import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { CartButton } from "@/components/CartButton";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Crash Camisetas";

export const metadata: Metadata = {
  title: STORE_NAME,
  description: `Catálogo de ${STORE_NAME}. Armá tu pedido y enviálo por WhatsApp.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <header className="site-header">
            <div className="container site-header-inner">
              <Link href="/" className="site-logo">
                {STORE_NAME}
              </Link>
              <nav className="site-nav">
                <Link href="/">Inicio</Link>
                <CartButton />
              </nav>
            </div>
          </header>

          <main className="container site-main">{children}</main>

          <footer className="site-footer">
            <div className="container">
              <p>{STORE_NAME} — pedidos coordinados por WhatsApp</p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
