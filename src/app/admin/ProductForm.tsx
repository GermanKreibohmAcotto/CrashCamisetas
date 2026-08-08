"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import { createProduct, updateProduct, type VariantInput } from "./actions";
import type { Category } from "@/lib/types";

type ProductFormProps = {
  categories: Category[];
  mode: "create" | "edit";
  productId?: string;
  initial?: {
    name: string;
    slug: string;
    description: string;
    categoryId: string | null;
    imageUrl: string | null;
    isActive: boolean;
    variants: VariantInput[];
  };
};

export function ProductForm({
  categories,
  mode,
  productId,
  initial,
}: ProductFormProps) {
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [imageUrl, setImageUrl] = useState<string | null>(
    initial?.imageUrl ?? null,
  );
  const [variants, setVariants] = useState<VariantInput[]>(
    initial?.variants && initial.variants.length > 0
      ? initial.variants
      : [{ size: "", stock: 0 }],
  );

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError(null);

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file);

    if (error) {
      setFormError(`No se pudo subir la imagen: ${error.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  }

  function updateVariant(index: number, patch: Partial<VariantInput>) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    );
  }

  function addVariant() {
    setVariants((prev) => [...prev, { size: "", stock: 0 }]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanSlug = slug.trim();

    if (!cleanName || !cleanSlug) {
      setFormError("Nombre y slug son obligatorios.");
      return;
    }

    const cleanVariants = variants
      .map((v) => ({ size: v.size.trim(), stock: Number(v.stock) || 0 }))
      .filter((v) => v.size.length > 0);

    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const v of cleanVariants) {
      const key = v.size.toLowerCase();
      if (seen.has(key)) duplicates.add(v.size);
      seen.add(key);
    }
    if (duplicates.size > 0) {
      setFormError(`Hay talles repetidos: ${[...duplicates].join(", ")}`);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const input = {
      name: cleanName,
      slug: cleanSlug,
      description: description.trim(),
      categoryId: categoryId || null,
      imageUrl,
      isActive,
      variants: cleanVariants,
    };

    const result =
      mode === "edit" && productId
        ? await updateProduct(productId, input)
        : await createProduct(input);

    if (result?.error) {
      setFormError(result.error);
      setSubmitting(false);
    }
    // Si no hay error, la Server Action ya redirigió a /admin.
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      {formError && <p className="form-error">{formError}</p>}

      <label className="field">
        <span>Nombre</span>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>Slug (URL)</span>
        <input
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          required
        />
      </label>

      <label className="field">
        <span>Descripción</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="field">
        <span>Categoría</span>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <span>Visible en la tienda</span>
      </label>

      <div className="field">
        <span>Foto</span>
        {imageUrl && (
          <div className="image-preview">
            <Image src={imageUrl} alt="" fill sizes="120px" />
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {uploading && <p className="notice">Subiendo imagen…</p>}
      </div>

      <fieldset className="variants-fieldset">
        <legend>Talles y stock</legend>

        {variants.map((variant, index) => (
          <div className="variant-row" key={index}>
            <label className="field">
              <span>Talle</span>
              <input
                type="text"
                placeholder="S, M, L, XL…"
                value={variant.size}
                onChange={(e) =>
                  updateVariant(index, { size: e.target.value })
                }
              />
            </label>

            <label className="field">
              <span>Stock</span>
              <input
                type="number"
                min={0}
                value={variant.stock}
                onChange={(e) =>
                  updateVariant(index, { stock: Number(e.target.value) || 0 })
                }
              />
            </label>

            <button
              type="button"
              className="button button-text"
              onClick={() => removeVariant(index)}
              disabled={variants.length === 1}
            >
              Quitar
            </button>
          </div>
        ))}

        <button
          type="button"
          className="button button-secondary"
          onClick={addVariant}
        >
          + Agregar talle
        </button>
      </fieldset>

      <div className="form-actions">
        <button
          type="submit"
          className="button button-primary"
          disabled={submitting || uploading}
        >
          {submitting
            ? "Guardando…"
            : mode === "edit"
              ? "Guardar cambios"
              : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
