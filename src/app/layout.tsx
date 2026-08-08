import type { Metadata } from "next";
import { Anybody, Hanken_Grotesk, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StadiumGlow } from "@/components/site/StadiumGlow";

const anybody = Anybody({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-anybody",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-hanken-grotesk",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
});

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Crash Camisetas";

export const metadata: Metadata = {
  title: STORE_NAME,
  description: `Catálogo de ${STORE_NAME}. Armá tu pedido y enviálo por WhatsApp.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${anybody.variable} ${hankenGrotesk.variable} ${spaceGrotesk.variable}`}
    >
      <body className="flex min-h-screen flex-col font-body">
        <CartProvider>
          <StadiumGlow />
          <Header />
          <main className="flex-1 pt-20">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
