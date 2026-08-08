import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../ProductForm";
import type { Category } from "@/lib/types";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h2>Nuevo producto</h2>
      <ProductForm categories={(data ?? []) as Category[]} mode="create" />
    </div>
  );
}
