import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /admin, /login y /carrito no tienen ningún valor de búsqueda: son
// páginas de sesión/checkout, no contenido. Bloquearlas acá es el
// primer cinturón; la meta robots noindex en cada una (ver sus
// generateMetadata) es el segundo, por si un crawler las alcanza igual
// por un link externo.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/login", "/carrito"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
