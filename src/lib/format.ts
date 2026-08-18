// Formateo de precio compartido por toda la tienda y el admin, para que
// $45.000 se lea siempre igual sin repetir el Intl.NumberFormat en cada
// componente.

const formatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// Normaliza a number | null, sin formatear — lo usa buildOrderMessage
// (src/lib/whatsapp.ts) para sumar totales antes de mostrarlos.
//
// Acepta string además de number: PostgREST debería mandar `numeric`
// como número JSON, pero normalizar con Number() acá cuesta nada y evita
// que un cambio de driver rompa el cálculo en silencio en vez de en este
// único lugar.
export function parsePrice(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined) return null;

  const num = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(num) ? num : null;
}

// Devuelve null cuando no hay precio (en vez de un string tipo "—") para
// que cada consumidor decida cómo mostrar el estado "a convenir" en su
// propio contexto (tarjeta, detalle, carrito).
export function formatPrice(
  value: number | string | null | undefined,
): string | null {
  const num = parsePrice(value);
  return num === null ? null : `$${formatter.format(num)}`;
}
