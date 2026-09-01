// Fuente única para el nombre y la URL absoluta del sitio. Todo lo que
// necesita una URL completa (canonical, sitemap, robots, Open Graph)
// depende de esto — sin un valor consistente acá, cada uno inventaría
// el suyo.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.crashcamisetas.com.ar";

export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Crash Camisetas";
