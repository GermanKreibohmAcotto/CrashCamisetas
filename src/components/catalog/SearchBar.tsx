"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo");
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex items-center gap-2 rounded-lg border-b-2 border-outline bg-surface-container-high px-4 py-2 transition-colors focus-within:border-primary focus-within:shadow-[0_0_12px_rgba(151,204,254,0.35)]">
        <Search className="h-4 w-4 shrink-0 text-on-surface-variant" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar camisetas…"
          className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
        />
      </div>
    </form>
  );
}
