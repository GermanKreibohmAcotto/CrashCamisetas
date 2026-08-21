"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useScroll } from "motion/react";
import { CartButton } from "@/components/CartButton";
import { SearchBar } from "@/components/catalog/SearchBar";
import { X, Menu } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Crash Camisetas";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
const CONTACT_URL = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("¡Hola! Tengo una consulta.")}`
  : undefined;

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/catalogo", label: "Catálogo" },
];

export function Header() {
  const { scrollYProgress } = useScroll();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-primary/10 bg-surface/90 backdrop-blur-md">
      <motion.div
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-primary"
        style={{ scaleX: scrollYProgress }}
      />

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-gutter px-margin-mobile md:px-margin-desktop">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/logo.png"
            alt={STORE_NAME}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border-2 border-primary object-cover"
            priority
          />
          <span className="font-display text-headline-sm uppercase italic tracking-tighter text-primary">
            Crash Camisetas
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-label text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          {CONTACT_URL && (
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
            >
              Contacto
            </a>
          )}
        </nav>

        <Suspense fallback={<div className="hidden flex-1 md:block" />}>
          <SearchBar className="hidden max-w-md flex-1 md:block" />
        </Suspense>

        <div className="flex shrink-0 items-center gap-4">
          <CartButton />
          {CONTACT_URL && (
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-whatsapp transition-transform hover:scale-110 sm:block"
              aria-label="Consultar por WhatsApp"
            >
              <SiWhatsapp className="h-6 w-6" />
            </a>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="text-on-surface lg:hidden"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-outline-variant/30 bg-surface lg:hidden"
          >
            <div className="flex flex-col gap-4 px-margin-mobile py-6">
              <Suspense>
                <SearchBar />
              </Suspense>
              <nav className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-label text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                {CONTACT_URL && (
                  <a
                    href={CONTACT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-label text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
                  >
                    Contacto
                  </a>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
