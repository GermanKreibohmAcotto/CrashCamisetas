import Link from "next/link";
import { IconInstagram, IconWhatsApp } from "@/components/icons";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Crash Camisetas";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "";

function waLink(message: string) {
  return WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    : undefined;
}

// No hardcodeamos el @handle: si algún día cambia NEXT_PUBLIC_INSTAGRAM_URL,
// el texto visible tiene que seguirlo solo. Sin new URL() para no romper
// el render si alguien pega la URL con un typo.
function instagramHandle(url: string): string {
  const match = url.match(/instagram\.com\/([^/?]+)/i);
  return match ? `@${match[1]}` : "Instagram";
}

// Los links de "soporte" del mockup (envíos, devoluciones, FAQ) no
// tienen páginas propias — en una tienda que se maneja por WhatsApp,
// la respuesta correcta es que abran el chat con una pregunta ya
// escrita, no un link muerto a una página que no existe.
export function Footer() {
  const contactUrl = waLink("¡Hola! Tengo una consulta.");
  const shippingUrl = waLink("¡Hola! Quería consultar sobre el envío.");
  const returnsUrl = waLink(
    "¡Hola! Quería consultar sobre cambios y devoluciones.",
  );
  const faqUrl = waLink("¡Hola! Tengo una pregunta.");

  return (
    <footer className="mt-auto w-full border-t-4 border-primary bg-surface-container-lowest">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-margin-mobile py-12 md:flex-row md:justify-between md:px-margin-desktop">
        <div className="flex max-w-xs flex-col gap-4">
          <span className="font-display text-headline-sm uppercase text-primary">
            {STORE_NAME}
          </span>
          <p className="font-body text-body-md text-on-surface-variant">
            Camisetas de fútbol para verdaderos hinchas. Elegís, consultás
            por WhatsApp y listo.
          </p>
          {INSTAGRAM_URL && (
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguinos en Instagram"
              className="flex w-fit items-center gap-2 text-on-surface-variant transition-colors hover:text-primary"
            >
              <IconInstagram className="h-5 w-5" />
              <span className="font-label text-label-caps uppercase">
                {instagramHandle(INSTAGRAM_URL)}
              </span>
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-12">
          <div className="flex flex-col gap-2">
            <span className="mb-2 font-label text-label-caps uppercase text-secondary">
              Explorá
            </span>
            <Link
              href="/"
              className="text-on-surface-variant transition-colors hover:text-on-surface"
            >
              Inicio
            </Link>
            <Link
              href="/catalogo"
              className="text-on-surface-variant transition-colors hover:text-on-surface"
            >
              Catálogo
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="mb-2 font-label text-label-caps uppercase text-secondary">
              Soporte
            </span>
            {shippingUrl && (
              <a
                href={shippingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant transition-colors hover:text-on-surface"
              >
                Envíos
              </a>
            )}
            {returnsUrl && (
              <a
                href={returnsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant transition-colors hover:text-on-surface"
              >
                Cambios y devoluciones
              </a>
            )}
            {faqUrl && (
              <a
                href={faqUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant transition-colors hover:text-on-surface"
              >
                Preguntas frecuentes
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start justify-center md:items-end">
          {contactUrl && (
            <a
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="skew-slant flex items-center gap-3 bg-whatsapp px-8 py-4 font-display text-headline-sm text-white transition-all hover:brightness-110 active:translate-y-0.5"
            >
              <IconWhatsApp
                className="skew-slant h-5 w-5"
                cutoutColor="var(--color-whatsapp)"
              />
              <span className="skew-slant">Chatear por WhatsApp</span>
            </a>
          )}
        </div>
      </div>

      <div className="w-full border-t border-outline-variant bg-surface-container py-6 text-center text-sm text-on-surface-variant">
        © {new Date().getFullYear()} {STORE_NAME}. Hecho para los hinchas.
      </div>
    </footer>
  );
}
