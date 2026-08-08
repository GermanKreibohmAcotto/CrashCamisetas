"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { IconArrowDown } from "@/components/icons";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
const CONTACT_URL = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("¡Hola! Quiero saber más sobre las camisetas.")}`
  : undefined;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// Es la primera sección de la página, así que anima al montar (no al
// entrar en viewport como el resto): con whileInView no tendría sentido,
// ya está a la vista desde el primer frame.
export function Hero() {
  return (
    <section className="stadium-glow relative flex min-h-[85vh] w-full items-center overflow-hidden bg-surface">
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-gutter px-margin-mobile py-24 md:px-margin-desktop lg:grid-cols-12">
        <motion.div
          className="flex flex-col gap-8 lg:col-span-7"
          initial="hidden"
          animate="visible"
          variants={container}
        >
          <motion.div
            variants={item}
            className="inline-flex w-fit items-center gap-3 rounded-full border border-primary/20 bg-surface-container/80 px-4 py-2 shadow-lg backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
            </span>
            <span className="font-label text-label-caps uppercase tracking-widest text-primary">
              Nuevos Ingresos
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-headline-lg-mobile uppercase text-on-surface drop-shadow-2xl md:text-display-hero"
          >
            Viste la <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Pasión.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-xl font-body text-body-lg text-on-surface-variant"
          >
            Camisetas de fútbol para los verdaderos hinchas. Elegí tu talle y
            coordiná tu pedido directo por WhatsApp.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-4 flex flex-col gap-6 sm:flex-row"
          >
            <Link
              href="/catalogo"
              className="skew-slant group relative overflow-hidden bg-primary px-8 py-5 text-center font-display text-headline-sm text-on-primary shadow-[0_0_20px_rgba(151,204,254,0.3)] transition-all hover:bg-primary-fixed hover:shadow-[0_0_30px_rgba(151,204,254,0.6)] active:translate-y-1"
            >
              <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
              <span className="skew-slant relative z-10 block uppercase">
                Explorar Catálogo
              </span>
            </Link>
            {CONTACT_URL && (
              <a
                href={CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="skew-slant flex items-center justify-center gap-3 border-2 border-outline-variant bg-surface-container px-8 py-5 font-display text-headline-sm text-on-surface transition-all hover:border-primary hover:bg-surface-container-high active:translate-y-1"
              >
                <span className="skew-slant block uppercase">
                  Consultar por WhatsApp
                </span>
              </a>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="relative hidden justify-center lg:col-span-5 lg:flex"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="motion-safe:animate-pulse absolute -inset-4 rounded-full bg-primary/20 opacity-50 blur-3xl" />
          <Image
            src="/logo.png"
            alt="Crash Camisetas"
            width={420}
            height={420}
            priority
            className="relative z-10 w-full max-w-md object-contain drop-shadow-2xl transition-transform duration-700 ease-out hover:scale-105"
            style={{ filter: "drop-shadow(0 0 30px rgba(151,204,254,0.4))" }}
          />
        </motion.div>
      </div>

      <div className="motion-safe:animate-bounce absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 opacity-70">
        <span className="font-label text-label-caps uppercase text-on-surface-variant">
          Scroll
        </span>
        <IconArrowDown className="h-5 w-5 text-primary" />
      </div>
    </section>
  );
}
