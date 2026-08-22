// Tipos de dominio. Reflejan supabase/schema.sql.

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  sort_order: number;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
};

// Coincide con el CHECK constraint de products.badge en supabase/schema.sql
export type ProductBadge = "nuevo" | "retro" | "limitado" | "mas_vendido";

// Compartido entre ProductCard y ProductGallery, para que el mismo
// badge se lea igual en todos lados.
export const BADGE_LABEL: Record<ProductBadge, string> = {
  nuevo: "Nuevo",
  retro: "Retro",
  limitado: "Limitado",
  mas_vendido: "Más Vendido",
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  // null = "a convenir" (se charla por WhatsApp), no un dato faltante.
  price: number | null;
  badge: ProductBadge | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
  // Un producto puede pertenecer a varias categorías (tabla puente
  // product_categories). Reemplaza a la vieja category_id/category
  // única — ver src/lib/products-query.ts.
  categories: Category[];
  // Fotos adicionales de la galería, más allá de la portada (image_url).
  // Ausente u [] cuando el producto no tiene galería cargada.
  images?: ProductImage[];
};

// Ítem tal como vive en el carrito (localStorage). Guarda una foto del
// producto al momento de agregarlo, no una referencia viva — si el admin
// edita el producto después, el carrito ya abierto no se entera.
//
// A propósito, NO guarda price: un carrito puede quedar abierto en el
// navegador durante semanas, y un precio guardado acá quedaría rancio
// y terminaría en un mensaje de WhatsApp con un importe que ya no es
// real. El precio se relee de Supabase al mostrar el carrito — ver
// src/lib/use-cart-prices.ts.
export type CartItem = {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  size: string;
  imageUrl: string | null;
  qty: number;
};
