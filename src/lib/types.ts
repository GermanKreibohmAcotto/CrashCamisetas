// Tipos de dominio. Reflejan supabase/schema.sql — sin ningún campo de
// precio a propósito: los precios se acuerdan por WhatsApp.

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
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  badge: ProductBadge | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
  category: Category | null;
  // Fotos adicionales de la galería, más allá de la portada (image_url).
  // Ausente u [] cuando el producto no tiene galería cargada.
  images?: ProductImage[];
};

// Ítem tal como vive en el carrito (localStorage). Guarda una foto del
// producto al momento de agregarlo, no una referencia viva — si el admin
// edita el producto después, el carrito ya abierto no se entera.
export type CartItem = {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  size: string;
  imageUrl: string | null;
  qty: number;
};
