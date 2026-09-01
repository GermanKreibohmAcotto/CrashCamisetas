"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-sm border border-outline-variant/30 bg-surface-container p-8"
    >
      <h1 className="font-display text-headline-sm uppercase text-on-surface">
        Ingresar
      </h1>
      {error && (
        <p className="rounded-sm border border-error/40 bg-error-container/20 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-wide text-on-surface-variant">
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="rounded-md border border-outline-variant bg-surface-container-high px-3 py-2 text-on-surface outline-none transition-colors focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-wide text-on-surface-variant">
          Contraseña
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="rounded-md border border-outline-variant bg-surface-container-high px-3 py-2 text-on-surface outline-none transition-colors focus:border-primary"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-md bg-primary px-5 py-2.5 font-label text-label-caps uppercase text-on-primary transition-colors hover:bg-primary-fixed disabled:opacity-60"
      >
        {loading ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
