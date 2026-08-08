// Convierte "Río de la Plata Nº 10" en "rio-de-la-plata-n-10". Se usa para
// autogenerar el slug de productos y categorías a partir del nombre.
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "") // quitar acentos/diacríticos (marcas NFD)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
