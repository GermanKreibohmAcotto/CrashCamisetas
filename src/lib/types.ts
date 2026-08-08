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

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
  category: Category | null;
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
