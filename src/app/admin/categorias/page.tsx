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
      <h2>Categorías</h2>

      {categories.length === 0 ? (
        <p className="notice">Todavía no hay categorías.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th aria-label="Acciones"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>
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

      <div className="category-form-wrapper">
        <CategoryForm />
      </div>
    </div>
  );
}
