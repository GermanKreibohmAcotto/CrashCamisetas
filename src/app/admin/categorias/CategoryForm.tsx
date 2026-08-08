"use client";

import { useState, type FormEvent } from "react";
import { slugify } from "@/lib/slugify";
import { createCategory } from "../actions";

export function CategoryForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanSlug = slug.trim();

    if (!cleanName || !cleanSlug) {
      setError("Nombre y slug son obligatorios.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await createCategory(cleanName, cleanSlug);

    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setName("");
    setSlug("");
    setSlugTouched(false);
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="font-display text-sm uppercase text-on-surface">
        Nueva categoría
      </h3>
      {error && (
        <p className="rounded-sm border border-error/40 bg-error-container/20 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-wide text-on-surface-variant">
          Nombre
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          required
          className="rounded-md border border-outline-variant bg-surface-container-high px-3 py-2 text-on-surface outline-none transition-colors focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-wide text-on-surface-variant">
          Slug
        </span>
        <input
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          required
          className="rounded-md border border-outline-variant bg-surface-container-high px-3 py-2 text-on-surface outline-none transition-colors focus:border-primary"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-fixed disabled:opacity-60"
      >
        {submitting ? "Creando…" : "Crear categoría"}
      </button>
    </form>
  );
}
