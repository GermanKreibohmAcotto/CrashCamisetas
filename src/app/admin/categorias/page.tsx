import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "./CategoryForm";
import { DeleteCategoryButton } from "./DeleteCategoryButton";
import type { Category } from "@/lib/types";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const categories = (data ?? []) as Category[];

  return (
    <div>
      <h2 className="mb-6 font-display text-headline-sm uppercase text-on-surface">
        Categorías
      </h2>

      {categories.length === 0 ? (
        <p className="text-on-surface-variant">Todavía no hay categorías.</p>
      ) : (
        <div className="mb-8 overflow-x-auto rounded-sm border border-outline-variant/30">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container">
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-on-surface-variant">
                  Nombre
                </th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-on-surface-variant">
                  Slug
                </th>
                <th className="px-3 py-2" aria-label="Acciones"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-outline-variant/20 last:border-0"
                >
                  <td className="px-3 py-2 text-on-surface">{category.name}</td>
                  <td className="px-3 py-2 text-on-surface-variant">
                    {category.slug}
                  </td>
                  <td className="px-3 py-2">
                    <DeleteCategoryButton
                      categoryId={category.id}
                      categoryName={category.name}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="max-w-sm rounded-sm border border-outline-variant/30 bg-surface-container p-6">
        <CategoryForm />
      </div>
    </div>
  );
}
