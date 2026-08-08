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
    <div className="admin-user">
      {email && <span className="admin-user-email">{email}</span>}
      <button
        type="button"
        className="button button-secondary"
        onClick={handleLogout}
      >
        Salir
      </button>
    </div>
  );
}
