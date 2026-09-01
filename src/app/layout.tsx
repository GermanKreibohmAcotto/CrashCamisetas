import type { Metadata } from "next";
import { Anybody, Hanken_Grotesk, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StadiumGlow } from "@/components/site/StadiumGlow";
import { SITE_URL, STORE_NAME } from "@/lib/site";

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

const DESCRIPTION =
  `Camisetas de fútbol retro, de selecciones y de clubes nacionales e ` +
  `internacionales. Elegí tu talle y coordiná el pedido directo por ` +
  `WhatsApp — ${STORE_NAME}, envíos a todo el país.`;

export const metadata: Metadata = {
  // Prerrequisito de todo el resto de metadata: sin esto, las imágenes
  // Open Graph con ruta relativa (como opengraph-image.tsx) no resuelven
  // a una URL absoluta y Next tira warning en build.
  metadataBase: new URL(SITE_URL),
  title: {
    default: STORE_NAME,
    // Cada página define solo su parte (ej. "River Titular 2026") y
    // hereda la marca — así se evita repetir "Crash Camisetas" a mano
    // en cada generateMetadata.
    template: `%s | ${STORE_NAME}`,
  },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: STORE_NAME,
    url: SITE_URL,
    title: STORE_NAME,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: STORE_NAME,
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/site.webmanifest",
  other: {
    "apple-mobile-web-app-title": STORE_NAME,
  },
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
