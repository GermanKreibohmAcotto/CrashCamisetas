import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../../ProductForm";
import { PRODUCT_SELECT, toProductWithVariants } from "@/lib/products-query";
import type { Category, ProductImage } from "@/lib/types";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/[id]/editar">) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  if (!product) {
    notFound();
  }

  const typedProduct = toProductWithVariants(product);
  const sortedVariants = [...typedProduct.variants].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  // Igual que en la página pública: separado del query principal para
  // que un product_images inexistente (falta correr la migración) no
  // convierta un producto real en un 404.
  const { data: galleryImages } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", typedProduct.id)
    .order("sort_order", { ascending: true });

  const images = ((galleryImages ?? []) as ProductImage[]).map((img) => img.url);

  return (
    <div>
      <h2 className="mb-6 font-display text-headline-sm uppercase text-on-surface">
        Editar producto
      </h2>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        mode="edit"
        productId={typedProduct.id}
        initial={{
          name: typedProduct.name,
          slug: typedProduct.slug,
          description: typedProduct.description ?? "",
          categoryIds: typedProduct.categories.map((c) => c.id),
          imageUrl: typedProduct.image_url,
          price: typedProduct.price ?? null,
          badge: typedProduct.badge ?? null,
          isActive: typedProduct.is_active,
          variants: sortedVariants.map((v) => ({
            size: v.size,
            stock: v.stock,
          })),
          images,
        }}
      />
    </div>
  );
}
