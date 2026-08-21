"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import { toUploadableImage } from "@/lib/heic";
import { createProduct, updateProduct, type VariantInput } from "./actions";
import type { Category, ProductBadge } from "@/lib/types";
import { X } from "lucide-react";

const BADGE_OPTIONS: { value: ProductBadge; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "retro", label: "Retro" },
  { value: "limitado", label: "Limitado" },
  { value: "mas_vendido", label: "Más Vendido" },
];

const inputClasses =
  "rounded-md border border-outline-variant bg-surface-container-high px-3 py-2 text-on-surface outline-none transition-colors focus:border-primary";
const labelClasses = "flex flex-col gap-1.5";
const labelTextClasses = "text-xs uppercase tracking-wide text-on-surface-variant";

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
    price: number | null;
    badge: ProductBadge | null;
    isActive: boolean;
    variants: VariantInput[];
    images: string[];
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
  // String, no number: el resto del form usa el idiom Number(x) || 0 para
  // stock, pero eso colapsa "", 0 y NaN todos a 0 — acá necesitamos poder
  // distinguir "sin precio cargado" (input vacío) de "precio cero" real.
  const [price, setPrice] = useState(
    initial?.price !== null && initial?.price !== undefined
      ? String(initial.price)
      : "",
  );
  const [badge, setBadge] = useState<ProductBadge | null>(initial?.badge ?? null);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [imageUrl, setImageUrl] = useState<string | null>(
    initial?.imageUrl ?? null,
  );
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<VariantInput[]>(
    initial?.variants && initial.variants.length > 0
      ? initial.variants
      : [{ size: "", stock: 0 }],
  );

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const uploading = uploadingCover || uploadingGallery;

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function uploadToStorage(file: File): Promise<string | null> {
    let uploadable: File;
    try {
      uploadable = await toUploadableImage(file);
    } catch {
      setFormError(
        `No se pudo convertir "${file.name}" (HEIC). Probá exportarla como JPG.`,
      );
      return null;
    }

    const ext = uploadable.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, uploadable);

    if (error) {
      setFormError(`No se pudo subir "${file.name}": ${error.message}`);
      return null;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setFormError(null);

    const url = await uploadToStorage(file);
    if (url) setImageUrl(url);

    setUploadingCover(false);
  }

  async function handleGalleryChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setFormError(null);

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadToStorage(file);
      if (url) uploaded.push(url);
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploadingGallery(false);
    e.target.value = "";
  }

  function removeGalleryImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
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

    const cleanPrice = price.trim();
    let priceValue: number | null = null;
    if (cleanPrice !== "") {
      priceValue = Number(cleanPrice);
      if (!Number.isFinite(priceValue) || priceValue < 0) {
        setFormError("El precio tiene que ser un número mayor o igual a 0.");
        return;
      }
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
      price: priceValue,
      badge,
      isActive,
      variants: cleanVariants,
      images,
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
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      {formError && (
        <p className="rounded-sm border border-error/40 bg-error-container/20 px-3 py-2 text-sm text-error">
          {formError}
        </p>
      )}

      <label className={labelClasses}>
        <span className={labelTextClasses}>Nombre</span>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className={inputClasses}
        />
      </label>

      <label className={labelClasses}>
        <span className={labelTextClasses}>Slug (URL)</span>
        <input
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          required
          className={inputClasses}
        />
      </label>

      <label className={labelClasses}>
        <span className={labelTextClasses}>Descripción</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${inputClasses} resize-y`}
        />
      </label>

      <label className={labelClasses}>
        <span className={labelTextClasses}>Precio</span>
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Dejar vacío = a convenir por WhatsApp"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputClasses}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className={labelClasses}>
          <span className={labelTextClasses}>Categoría</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClasses}
          >
            <option value="">Sin categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClasses}>
          <span className={labelTextClasses}>Badge</span>
          <select
            value={badge ?? ""}
            onChange={(e) =>
              setBadge((e.target.value || null) as ProductBadge | null)
            }
            className={inputClasses}
          >
            <option value="">Sin badge</option>
            {BADGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span className="text-sm text-on-surface">Visible en la tienda</span>
      </label>

      <div className={labelClasses}>
        <span className={labelTextClasses}>Foto de portada</span>
        {imageUrl && (
          <div className="relative h-28 w-28 overflow-hidden rounded-sm bg-surface-container-low">
            <Image src={imageUrl} alt="" fill sizes="112px" className="object-cover" />
          </div>
        )}
        <input
          type="file"
          accept="image/*,.heic,.heif"
          onChange={handleCoverChange}
          className="text-sm text-on-surface-variant file:mr-3 file:rounded-md file:border-0 file:bg-surface-container-high file:px-3 file:py-1.5 file:text-on-surface"
        />
        {uploadingCover && (
          <p className="text-sm text-on-surface-variant">
            Subiendo imagen… (las HEIC de iPhone se convierten solas)
          </p>
        )}
      </div>

      <div className={labelClasses}>
        <span className={labelTextClasses}>Galería (fotos adicionales)</span>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((url) => (
              <div
                key={url}
                className="group relative h-20 w-20 overflow-hidden rounded-sm bg-surface-container-low"
              >
                <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  aria-label="Quitar foto"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface/80 text-on-surface opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          onChange={handleGalleryChange}
          className="text-sm text-on-surface-variant file:mr-3 file:rounded-md file:border-0 file:bg-surface-container-high file:px-3 file:py-1.5 file:text-on-surface"
        />
        {uploadingGallery && (
          <p className="text-sm text-on-surface-variant">
            Subiendo fotos… (las HEIC de iPhone se convierten solas)
          </p>
        )}
      </div>

      <fieldset className="rounded-sm border border-outline-variant/40 p-4">
        <legend className="px-1 text-xs uppercase tracking-wide text-on-surface-variant">
          Talles y stock
        </legend>

        <div className="flex flex-col gap-3">
          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
              <label className={labelClasses}>
                <span className={labelTextClasses}>Talle</span>
                <input
                  type="text"
                  placeholder="S, M, L, XL…"
                  value={variant.size}
                  onChange={(e) => updateVariant(index, { size: e.target.value })}
                  className={inputClasses}
                />
              </label>

              <label className={labelClasses}>
                <span className={labelTextClasses}>Stock</span>
                <input
                  type="number"
                  min={0}
                  value={variant.stock}
                  onChange={(e) =>
                    updateVariant(index, { stock: Number(e.target.value) || 0 })
                  }
                  className={inputClasses}
                />
              </label>

              <button
                type="button"
                onClick={() => removeVariant(index)}
                disabled={variants.length === 1}
                className="h-fit pb-2 text-sm text-on-surface-variant transition-colors hover:text-error disabled:opacity-40"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="mt-4 rounded-md border border-outline-variant px-4 py-2 text-sm text-on-surface transition-colors hover:border-primary"
        >
          + Agregar talle
        </button>
      </fieldset>

      <div className="mt-2">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="rounded-md bg-primary px-6 py-2.5 font-medium text-on-primary transition-colors hover:bg-primary-fixed disabled:opacity-60"
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
