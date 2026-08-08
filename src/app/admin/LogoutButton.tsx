"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ email }: { email?: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {email && <span className="text-sm text-on-surface-variant">{email}</span>}
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-md border border-outline-variant px-4 py-2 text-sm text-on-surface transition-colors hover:border-primary"
      >
        Salir
      </button>
    </div>
  );
}
