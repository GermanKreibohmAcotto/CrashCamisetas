import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

// Página de sesión, sin valor de búsqueda — ya bloqueada en robots.ts.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-margin-mobile py-16">
      <LoginForm />
    </div>
  );
}
