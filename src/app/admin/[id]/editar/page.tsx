import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../../ProductForm";
import type { Category, ProductWithVariants } from "@/lib/types";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/[id]/editar">) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, variants:product_variants(*)")
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

  const typedProduct = product as ProductWithVariants;
  const sortedVariants = [...typedProduct.variants].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return (
    <div>
      <h2>Editar producto</h2>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        mode="edit"
        productId={typedProduct.id}
        initial={{
          name: typedProduct.name,
          slug: typedProduct.slug,
          description: typedProduct.description ?? "",
          categoryId: typedProduct.category_id,
          imageUrl: typedProduct.image_url,
          isActive: typedProduct.is_active,
          variants: sortedVariants.map((v) => ({
            size: v.size,
            stock: v.stock,
          })),
        }}
      />
    </div>
  );
}
