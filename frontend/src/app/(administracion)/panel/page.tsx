"use client";

import Link from "next/link";

import { useAuth } from "@/providers/auth-provider";
import { useMenu } from "@/features/auth/hooks";

export default function PanelPage() {
  const { user, token } = useAuth();
  const { data: menu = [] } = useMenu(token);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-sm text-muted-foreground">
          Este es el resumen de las secciones disponibles para tu rol.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menu.map((grupo) => (
          <div
            key={grupo.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <h2 className="text-sm font-semibold text-foreground">
              {grupo.nombre}
            </h2>
            <ul className="flex flex-col gap-1">
              {grupo.urls.map((url) => (
                <li key={url.id}>
                  <Link
                    href={`/${grupo.path}/${url.path}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {url.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
