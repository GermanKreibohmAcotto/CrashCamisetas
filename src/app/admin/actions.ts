"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProductBadge } from "@/lib/types";

export type VariantInput = {
  size: string;
  stock: number;
};

export type ProductInput = {
  name: string;
  slug: string;
  description: string;
  categoryId: string | null;
  imageUrl: string | null;
  // null = "a convenir" (se charla por WhatsApp). Distinto de 0, que es
  // un precio real: el form lo maneja como string para no confundir
  // "campo vacío" con "cero" — ver ProductForm.tsx.
  price: number | null;
  badge: ProductBadge | null;
  isActive: boolean;
  variants: VariantInput[];
  // URLs de la galería adicional (product_images). image_url es aparte
  // y sigue siendo la portada.
  images: string[];
};

type ActionResult = { error: string } | undefined;

const UNIQUE_VIOLATION = "23505";
const UNDEFINED_COLUMN = "42703";
const UNDEFINED_TABLE = "42P01";
const MIGRATION_HINT =
  "Falta correr alguna migración pendiente (carpeta supabase/migrations/) en el SQL Editor de Supabase.";

function isMissingSchemaError(code: string | undefined): boolean {
  return code === UNDEFINED_COLUMN || code === UNDEFINED_TABLE;
}

// Todas las acciones de este archivo son el "backend" del admin: se llaman
// como funciones normales desde los Client Components, corren en el
// servidor, y usan la sesión de la cookie para autenticarse contra
// Supabase. RLS es la barrera real — este chequeo es una segunda capa
// para no dejar pasar solicitudes sin sesión hasta la base.
async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/login");
  }
  return supabase;
}

async function replaceVariants(
  supabase: Awaited<ReturnType<typeof requireUser>>,
  productId: string,
  variants: VariantInput[],
) {
  const { error: deleteError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId);
  if (deleteError) return deleteError.message;

  if (variants.length === 0) return null;

  const { error: insertError } = await supabase.from("product_variants").insert(
    variants.map((v, i) => ({
      product_id: productId,
      size: v.size,
      stock: v.stock,
      sort_order: i,
    })),
  );
  return insertError?.message ?? null;
}

async function replaceImages(
  supabase: Awaited<ReturnType<typeof requireUser>>,
  productId: string,
  images: string[],
) {
  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  if (deleteError) {
    if (isMissingSchemaError(deleteError.code)) return MIGRATION_HINT;
    return deleteError.message;
  }

  if (images.length === 0) return null;

  const { error: insertError } = await supabase.from("product_images").insert(
    images.map((url, i) => ({
      product_id: productId,
      url,
      sort_order: i,
    })),
  );
  if (insertError) {
    if (isMissingSchemaError(insertError.code)) return MIGRATION_HINT;
    return insertError.message;
  }
  return null;
}

export async function createProduct(
  input: ProductInput,
): Promise<ActionResult> {
  const supabase = await requireUser();

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      category_id: input.categoryId,
      image_url: input.imageUrl,
      price: input.price,
      badge: input.badge,
      is_active: input.isActive,
    })
    .select()
    .single();

  if (error || !product) {
    if (error?.code === UNIQUE_VIOLATION) {
      return { error: "Ya existe un producto con ese slug. Probá con otro." };
    }
    if (isMissingSchemaError(error?.code)) {
      return { error: MIGRATION_HINT };
    }
    return { error: error?.message ?? "No se pudo crear el producto." };
  }

  const variantsError = await replaceVariants(
    supabase,
    product.id,
    input.variants,
  );
  if (variantsError) return { error: variantsError };

  const imagesError = await replaceImages(supabase, product.id, input.images);
  if (imagesError) return { error: imagesError };

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateProduct(
  productId: string,
  input: ProductInput,
): Promise<ActionResult> {
  const supabase = await requireUser();

  const { error } = await supabase
    .from("products")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      category_id: input.categoryId,
      image_url: input.imageUrl,
      price: input.price,
      badge: input.badge,
      is_active: input.isActive,
    })
    .eq("id", productId);

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: "Ya existe un producto con ese slug. Probá con otro." };
    }
    if (isMissingSchemaError(error.code)) {
      return { error: MIGRATION_HINT };
    }
    return { error: error.message };
  }

  const variantsError = await replaceVariants(
    supabase,
    productId,
    input.variants,
  );
  if (variantsError) return { error: variantsError };

  const imagesError = await replaceImages(supabase, productId, input.images);
  if (imagesError) return { error: imagesError };

  revalidatePath("/");
  revalidatePath(`/producto/${input.slug}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProduct(productId: string): Promise<void> {
  const supabase = await requireUser();
  await supabase.from("products").delete().eq("id", productId);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function toggleProductActive(
  productId: string,
  isActive: boolean,
): Promise<void> {
  const supabase = await requireUser();
  await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createCategory(
  name: string,
  slug: string,
): Promise<ActionResult> {
  const supabase = await requireUser();
  const { error } = await supabase.from("categories").insert({ name, slug });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: "Ya existe una categoría con ese slug. Probá con otro." };
    }
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/categorias");
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const supabase = await requireUser();
  await supabase.from("categories").delete().eq("id", categoryId);
  revalidatePath("/");
  revalidatePath("/admin/categorias");
}
