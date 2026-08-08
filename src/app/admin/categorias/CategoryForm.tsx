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
    <form className="category-form" onSubmit={handleSubmit}>
      <h3>Nueva categoría</h3>
      {error && <p className="form-error">{error}</p>}

      <label className="field">
        <span>Nombre</span>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          required
        />
      </label>

      <label className="field">
        <span>Slug</span>
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

      <button
        type="submit"
        className="button button-primary"
        disabled={submitting}
      >
        {submitting ? "Creando…" : "Crear categoría"}
      </button>
    </form>
  );
}
